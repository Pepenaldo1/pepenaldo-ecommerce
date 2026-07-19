const db = require('../config/db');

// POST /api/products/:id/reviews  (must have a paid order containing this product)
async function createReview(req, res) {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    const stars = Number(rating);
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    // Find a paid order by this user that actually contains this product.
    const eligible = await db.query(
      `SELECT o.id FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1 AND oi.product_id = $2 AND o.payment_status = 'paid'
       LIMIT 1`,
      [req.user.id, productId]
    );
    if (eligible.rows.length === 0) {
      return res.status(403).json({ error: 'You can only review products from a paid order.' });
    }

    const result = await db.query(
      `INSERT INTO reviews (product_id, user_id, order_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (product_id, user_id) DO UPDATE SET rating = $4, comment = $5, created_at = now()
       RETURNING *`,
      [productId, req.user.id, eligible.rows[0].id, stars, comment || null]
    );
    res.status(201).json({ review: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not submit review.' });
  }
}

// GET /api/products/:id/reviews
async function listReviews(req, res) {
  try {
    const result = await db.query(
      `SELECT r.*, u.name AS user_name
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json({ reviews: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load reviews.' });
  }
}

module.exports = { createReview, listReviews };
