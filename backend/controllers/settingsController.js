const db = require('../config/db');

// GET /api/settings  (public — used to render the homepage hero)
async function getSettings(req, res) {
  try {
    const result = await db.query('SELECT key, value FROM site_settings');
    const settings = {};
    result.rows.forEach((row) => { settings[row.key] = row.value; });
    res.json({ settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load settings.' });
  }
}

// PUT /api/admin/settings  (admin only)
async function updateSettings(req, res) {
  try {
    const { hero_image_url } = req.body;
    await db.query(
      `INSERT INTO site_settings (key, value) VALUES ('hero_image_url', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [hero_image_url || null]
    );
    res.json({ message: 'Settings updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update settings.' });
  }
}

module.exports = { getSettings, updateSettings };
