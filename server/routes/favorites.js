const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// GET /api/favorites
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const db = await getDb();
        const favorites = await db.all('SELECT * FROM favorites WHERE user_id = ? ORDER BY id DESC', [userId]);
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, name, calories, protein, carbs, fat } = req.body;

        if (!type || !name || calories === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const db = await getDb();

        // Check availability
        const existing = await db.get(
            'SELECT id FROM favorites WHERE user_id = ? AND type = ? AND name = ?',
            [userId, type, name]
        );

        if (existing) {
            return res.status(400).json({ error: 'Favorite already exists', id: existing.id });
        }

        const result = await db.run(
            `INSERT INTO favorites (user_id, type, name, calories, protein, carbs, fat) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, type, name, calories, protein, carbs, fat]
        );

        res.json({ id: result.lastID, success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/favorites/:id
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const db = await getDb();
        await db.run('DELETE FROM favorites WHERE id = ? AND user_id = ?', [req.params.id, userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
