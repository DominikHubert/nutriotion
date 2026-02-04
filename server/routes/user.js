const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// Calculate BMR (Mifflin-St. Jeor)
function calculateBMR(gender, weight, height, age) {
    // BMR = 10*W + 6.25*H - 5*A + s
    // s = +5 for men, -161 for women
    let s = gender === 'male' ? 5 : -161;
    return (10 * weight) + (6.25 * height) - (5 * age) + s;
}

// GET User Profile
router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        // Get user by ID from token
        const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);

        // Don't send password
        if (user) {
            delete user.password;
        }

        res.json(user || null);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST/UPDATE User Profile
router.post('/', async (req, res) => {
    try {
        const { gender, age, weight, height, activity_level, goal, ai_provider } = req.body;
        const userId = req.user.id;

        // Validation
        if (!gender || !age || !weight || !height) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const bmr = calculateBMR(gender, weight, height, age);
        const totalCalories = bmr * (activity_level || 1.2); // PAL

        const db = await getDb();

        const existing = await db.get('SELECT id FROM users WHERE id = ?', [userId]);

        if (existing) {
            await db.run(
                `UPDATE users SET gender=?, age=?, weight=?, height=?, activity_level=?, bmr=?, goal_calories=?, ai_provider=? WHERE id=?`,
                [gender, age, weight, height, activity_level, Math.round(totalCalories), Math.round(totalCalories), ai_provider || 'gemini', userId]
            );
        } else {
            // Should not happen as user is created on register, but just in case
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, bmr: Math.round(totalCalories) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
