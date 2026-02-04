const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const verifyToken = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', verifyToken, userRoutes);
app.use('/api/analyze', verifyToken, require('./routes/analyze')); // Protect analyze too
app.use('/api/entries', verifyToken, require('./routes/entries'));
app.use('/api/favorites', verifyToken, require('./routes/favorites'));



// Serve Frontend (Static Files)
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
