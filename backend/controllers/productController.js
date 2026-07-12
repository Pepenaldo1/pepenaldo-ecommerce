const db = require('../config/db');

// GET /api/products?category=tech&search=phone
async function listProducts(req, res) {
  try {
    const { category, search } = req.query;
    const conditions = ['p.is_active = true'];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`c.slug = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`p.name ILIKE $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await db.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ${where}
       ORDER BY p.created_at DESC`,
      params
    );
    res.json({ products: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch products.' });
  }
}

// GET /api/products/:id
async function getProduct(req, res) {
  try {
    const result = await db.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found.' });
    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch product.' });
  }
}

// POST /api/admin/products  (admin only)
async function createProduct(req, res) {
  try {
    const { name, description, price, stock, image_url, category_id } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required.' });
    }
    const result = await db.query(
      `INSERT INTO products (name, description, price, stock, image_url, category_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description || null, price, stock || 0, image_url || null, category_id || null]
    );
    res.status(201).json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create product.' });
  }
}

// PUT /api/admin/products/:id  (admin only)
async function updateProduct(req, res) {
  try {
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
       WHERE id = $8 RETURNING *`,
      [name, description, price, stock, image_url, category_id, is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found.' });
    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update product.' });
  }
}

// DELETE /api/admin/products/:id  (admin only)
async function deleteProduct(req, res) {
  try {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete product.' });
  }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
