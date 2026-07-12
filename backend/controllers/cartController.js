const db = require('../config/db');

// GET /api/cart
async function getCart(req, res) {
  try {
    const result = await db.query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.image_url, p.stock
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    );
    res.json({ items: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch cart.' });
  }
}

// POST /api/cart  { product_id, quantity }
async function addToCart(req, res) {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id is required.' });

    const result = await db.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING *`,
      [req.user.id, product_id, quantity]
    );
    res.status(201).json({ item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add item to cart.' });
  }
}

// PUT /api/cart/:id  { quantity }
async function updateCartItem(req, res) {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1.' });
    }
    const result = await db.query(
      `UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [quantity, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cart item not found.' });
    res.json({ item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update cart item.' });
  }
}

// DELETE /api/cart/:id
async function removeCartItem(req, res) {
  try {
    const result = await db.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cart item not found.' });
    res.json({ message: 'Item removed from cart.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not remove cart item.' });
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
