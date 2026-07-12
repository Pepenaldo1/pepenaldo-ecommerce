const jwt = require('jsonwebtoken');
const db = require('../config/db');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/vendor/register  (any logged-in customer can become a vendor)
async function becomeVendor(req, res) {
  try {
    const { business_name, vendor_bio } = req.body;
    if (!business_name) {
      return res.status(400).json({ error: 'Business name is required.' });
    }

    const result = await db.query(
      `UPDATE users
       SET role = 'vendor', business_name = $1, vendor_bio = $2
       WHERE id = $3
       RETURNING id, name, email, role, phone, business_name, vendor_bio, vendor_verified, created_at`,
      [business_name, vendor_bio || null, req.user.id]
    );

    const user = result.rows[0];
    // Reissue the token so the new "vendor" role takes effect immediately
    // (the old token still says "customer" until it's replaced).
    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not register as a vendor.' });
  }
}

// GET /api/vendor/products  (vendor's own products only)
async function listMyProducts(req, res) {
  try {
    const result = await db.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.vendor_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json({ products: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load your products.' });
  }
}

// POST /api/vendor/products  (creates a product owned by this vendor)
async function createMyProduct(req, res) {
  try {
    const { name, description, price, stock, image_url, category_id } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required.' });
    }
    const result = await db.query(
      `INSERT INTO products (name, description, price, stock, image_url, category_id, vendor_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description || null, price, stock || 0, image_url || null, category_id || null, req.user.id]
    );
    res.status(201).json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create product.' });
  }
}

// PUT /api/vendor/products/:id  (only if this vendor owns it)
async function updateMyProduct(req, res) {
  try {
    const owns = await db.query('SELECT vendor_id FROM products WHERE id = $1', [req.params.id]);
    if (owns.rows.length === 0) return res.status(404).json({ error: 'Product not found.' });
    if (owns.rows[0].vendor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not own this product.' });
    }

    const { name, description, price, stock, image_url, category_id, is_active } = req.body;
    const result = await db.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        stock = COALESCE($4, stock),
        image_url = COALESCE($5, image_url),
        category_id = COALESCE($6, category_id),
        is_active = COALESCE($7, is_active),
        updated_at = now()
       WHERE id = $8
       RETURNING *`,
      [name, description, price, stock, image_url, category_id, is_active, req.params.id]
    );
    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update product.' });
  }
}

// DELETE /api/vendor/products/:id  (only if this vendor owns it)
async function deleteMyProduct(req, res) {
  try {
    const owns = await db.query('SELECT vendor_id FROM products WHERE id = $1', [req.params.id]);
    if (owns.rows.length === 0) return res.status(404).json({ error: 'Product not found.' });
    if (owns.rows[0].vendor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not own this product.' });
    }
    await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete product.' });
  }
}

// GET /api/vendor/:id  (public vendor storefront — name, bio, their active products)
async function getVendorProfile(req, res) {
  try {
    const vendorResult = await db.query(
      `SELECT id, name, business_name, vendor_bio, vendor_verified, created_at
       FROM users WHERE id = $1 AND role = 'vendor'`,
      [req.params.id]
    );
    if (vendorResult.rows.length === 0) return res.status(404).json({ error: 'Vendor not found.' });

    const productsResult = await db.query(
      `SELECT * FROM products WHERE vendor_id = $1 AND is_active = true ORDER BY created_at DESC`,
      [req.params.id]
    );

    res.json({ vendor: vendorResult.rows[0], products: productsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load vendor profile.' });
  }
}

module.exports = {
  becomeVendor,
  listMyProducts,
  createMyProduct,
  updateMyProduct,
  deleteMyProduct,
  getVendorProfile,
};
