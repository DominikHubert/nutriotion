const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// POST /api/entries - Add a new entry
router.post('/', async (req, res) => {
    try {
        const { type, name, calories, protein, carbs, fat, date, weight } = req.body;
        const userId = req.user.id;

        // Simplistic validation
        if (!type || !name || calories === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const db = await getDb();
        const result = await db.run(
            `INSERT INTO entries (user_id, type, name, calories, protein, carbs, fat, date, weight) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, type, name, calories, protein, carbs, fat, date || new Date().toISOString(), weight]
        );

        res.json({ id: result.lastID, success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/entries/today - Get stats for a specific date (defaults to today)
router.get('/today', async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.query; // Expects YYYY-MM-DD
        const db = await getDb();

        let query = `SELECT * FROM entries WHERE user_id = ? AND date(date) = ?`;
        let params = [userId];

        if (date) {
            params.push(date);
        } else {
            // Default to today local time (server time)
            // Ideally client should always send date to avoid timezone issues, but fallback:
            query = `SELECT * FROM entries WHERE user_id = ? AND date(date) = date('now', 'localtime')`;
            params = [userId];
        }

        // Fix: 'now' in sqlite is UTC. 'localtime' converts. 
        // Better: Client sends YYYY-MM-DD.
        // If client sends date, we match exact string.

        const entries = await db.all(query, params);

        const stats = {
            calories_in: 0,
            calories_out: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            entries: entries
        };

        entries.forEach(e => {
            if (e.type === 'food') {
                stats.calories_in += e.calories;
                stats.protein += e.protein || 0;
                stats.carbs += e.carbs || 0;
                stats.fat += e.fat || 0;
            } else if (e.type === 'sport') {
                stats.calories_out += e.calories;
            }
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/entries/:id
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDb();
        // Ensure user owns the entry
        await db.run('DELETE FROM entries WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/entries/:id
router.put('/:id', async (req, res) => {
    try {
        const { name, calories, date } = req.body;
        const db = await getDb();
        await db.run(
            'UPDATE entries SET name = ?, calories = ?, date = ? WHERE id = ? AND user_id = ?',
            [name, calories, date, req.params.id, req.user.id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/entries/history - Get history stats
router.get('/history', async (req, res) => {
    try {
        const { range } = req.query; // 'week' or 'month'
        const days = range === 'month' ? 30 : 7;
        const userId = req.user.id;

        const db = await getDb();
        // SQLite date modifiers: 'now', '-7 days'
        // We use local time approximation by just taking the date part of ISO string stored in DB usually
        // Note: DB stores dates as ISO strings (UTC usually).

        const entries = await db.all(
            `SELECT * FROM entries WHERE user_id = ? AND date >= date('now', '-${days} days')`,
            [userId]
        );

        // Process data
        const historyMap = {};

        // Initialize map with empty days to ensure continuous chart
        for (let i = 0; i < days; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            historyMap[dateStr] = { date: dateStr, calories_in: 0, calories_out: 0 };
        }

        entries.forEach(e => {
            // Assume e.date is ISO string "2024-01-01T12:00:00.000Z"
            const dateStr = e.date.split('T')[0];
            if (historyMap[dateStr]) { // Only count if within range (query should filter mostly but good to be safe)
                if (e.type === 'food') {
                    historyMap[dateStr].calories_in += e.calories;
                } else if (e.type === 'sport') {
                    historyMap[dateStr].calories_out += e.calories;
                }
            }
        });

        // Convert to array and sort by date ascending
        const result = Object.values(historyMap).sort((a, b) => a.date.localeCompare(b.date));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
