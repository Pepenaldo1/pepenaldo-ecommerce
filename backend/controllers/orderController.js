const crypto = require('crypto');
const db = require('../config/db');
const { initializeTransaction, verifyTransaction } = require('../utils/paystack');
const { sendAdminNewOrderEmail, sendCustomerConfirmationEmail } = require('../utils/email');

// POST /api/orders/checkout  { shipping_address, shipping_phone }
// Reads the user's cart, creates an order + order_items, then starts a Paystack transaction.
async function checkout(req, res) {
  const client = await db.pool.connect();
  try {
    const { shipping_address, shipping_phone } = req.body;
    if (!shipping_address || !shipping_phone) {
      return res.status(400).json({ error: 'Shipping address and phone are required.' });
    }

    await client.query('BEGIN');

    const cartResult = await client.query(
      `SELECT ci.quantity, p.id AS product_id, p.name, p.price, p.stock
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1`,
      [req.user.id]
    );
    const cartItems = cartResult.rows;
    if (cartItems.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Not enough stock for ${item.name}.` });
      }
    }

    const total = cartItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, shipping_phone)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, total, shipping_address, shipping_phone]
    );
    const order = orderResult.rows[0];

    for (const item of cartItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.product_id, item.name, item.price, item.quantity]
      );
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [
        item.quantity,
        item.product_id,
      ]);
    }

    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    const reference = `pep_${order.id.replace(/-/g, '').slice(0, 16)}_${Date.now()}`;
    await client.query('UPDATE orders SET payment_reference = $1 WHERE id = $2', [reference, order.id]);

    await client.query('COMMIT');

    const paystackData = await initializeTransaction({
      email: req.user.email,
      amount: total,
      reference,
      callback_url: `${process.env.FRONTEND_URL}/checkout/verify`,
    });

    res.status(201).json({
      order: { ...order, payment_reference: reference },
      authorization_url: paystackData.authorization_url,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Checkout failed.' });
  } finally {
    client.release();
  }
}

// GET /api/orders/verify/:reference
// Called by the frontend after Paystack redirects back, and also usable as a manual check.
async function verifyPayment(req, res) {
  try {
    const { reference } = req.params;
    const paystackData = await verifyTransaction(reference);

    if (paystackData.status !== 'success') {
      await db.query(
        `UPDATE orders SET payment_status = 'failed' WHERE payment_reference = $1`,
        [reference]
      );
      return res.status(400).json({ error: 'Payment was not successful.' });
    }

    // Guard against a tampered/mismatched amount: what Paystack actually
    // received (in kobo) must match what we expected for this order.
    const pendingOrder = await db.query(
      'SELECT * FROM orders WHERE payment_reference = $1',
      [reference]
    );
    const existingOrder = pendingOrder.rows[0];
    if (!existingOrder) return res.status(404).json({ error: 'Order not found.' });

    const expectedKobo = Math.round(Number(existingOrder.total_amount) * 100);
    if (paystackData.amount !== expectedKobo) {
      await db.query(
        `UPDATE orders SET payment_status = 'failed' WHERE payment_reference = $1`,
        [reference]
      );
      console.error(
        `Amount mismatch for order ${existingOrder.id}: expected ${expectedKobo} kobo, got ${paystackData.amount} kobo.`
      );
      return res.status(400).json({ error: 'Payment amount does not match order total.' });
    }

    const orderResult = await db.query(
      `UPDATE orders SET payment_status = 'paid', status = 'paid', updated_at = now()
       WHERE payment_reference = $1 RETURNING *`,
      [reference]
    );
    const order = orderResult.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const itemsResult = await db.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    const userResult = await db.query('SELECT email FROM users WHERE id = $1', [order.user_id]);
    const customerEmail = userResult.rows[0]?.email;

    // Fire-and-forget — don't block the response on email delivery.
    sendAdminNewOrderEmail(order, itemsResult.rows).catch((e) => console.error('Admin email failed:', e));
    if (customerEmail) {
      sendCustomerConfirmationEmail(customerEmail, order, itemsResult.rows).catch((e) =>
        console.error('Customer email failed:', e)
      );
    }

    res.json({ order, items: itemsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not verify payment.' });
  }
}

// Paystack webhook — more reliable than relying solely on the redirect.
// POST /api/orders/webhook  (raw body, verified with HMAC signature)
async function paystackWebhook(req, res) {
  try {
    const signature = req.headers['x-paystack-signature'];
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(req.body);
    if (event.event === 'charge.success') {
      const reference = event.data.reference;

      const pendingOrder = await db.query(
        'SELECT * FROM orders WHERE payment_reference = $1',
        [reference]
      );
      const existingOrder = pendingOrder.rows[0];
      if (!existingOrder) return res.sendStatus(200); // unknown reference, nothing to do

      const expectedKobo = Math.round(Number(existingOrder.total_amount) * 100);
      if (event.data.amount !== expectedKobo) {
        console.error(
          `Webhook amount mismatch for order ${existingOrder.id}: expected ${expectedKobo} kobo, got ${event.data.amount} kobo.`
        );
        return res.sendStatus(200); // acknowledge receipt, but don't mark as paid
      }

      const orderResult = await db.query(
        `UPDATE orders SET payment_status = 'paid', status = 'paid', updated_at = now()
         WHERE payment_reference = $1 AND payment_status != 'paid' RETURNING *`,
        [reference]
      );
      const order = orderResult.rows[0];
      if (order) {
        const itemsResult = await db.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
        const userResult = await db.query('SELECT email FROM users WHERE id = $1', [order.user_id]);
        sendAdminNewOrderEmail(order, itemsResult.rows).catch(console.error);
        if (userResult.rows[0]?.email) {
          sendCustomerConfirmationEmail(userResult.rows[0].email, order, itemsResult.rows).catch(console.error);
        }
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

// GET /api/orders/mine
async function myOrders(req, res) {
  try {
    const orders = await db.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ orders: orders.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch orders.' });
  }
}

// GET /api/admin/orders  (admin only)
async function listAllOrders(req, res) {
  try {
    const result = await db.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );
    res.json({ orders: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch orders.' });
  }
}

// PUT /api/admin/orders/:id/status  { status }  (admin only)
async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
    }
    const result = await db.query(
      'UPDATE orders SET status = $1, updated_at = now() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found.' });
    res.json({ order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update order.' });
  }
}

module.exports = {
  checkout,
  verifyPayment,
  paystackWebhook,
  myOrders,
  listAllOrders,
  updateOrderStatus,
};
