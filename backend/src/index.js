const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const analyzeRoutes = require('./routes/analyze');
const suggestRoutes = require('./routes/suggest');
const wardrobeRoutes = require('./routes/wardrobe');
const tryOnRoutes = require('./routes/tryon');

const app = express();
const PORT = process.env.PORT || 5050;

// Security middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
// Virtual try-on sends multiple images in one request, so allow larger payloads.
app.use(express.json({ limit: '25mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gaya-backend' });
});

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/suggest', suggestRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/tryon', tryOnRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gaya backend running on port ${PORT}`);
});
