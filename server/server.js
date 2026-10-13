require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Health check: confirms the server is up
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'IMovies API' });
});

// Routes, the database connection and error handling are added in Epic 3 (backend development).

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`IMovies server running on port ${PORT}`));
