const express       = require('express');
const cors          = require('cors');
const freightRoutes = require('./routes/freight');
const costRoutes    = require('./routes/costs');
const { errorHandler } = require('./middleware/validation');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────
//  CORS
//  Em produção, troque '*' pelo domínio real:
//  ex: 'https://vitorzmaluf.github.io'
// ─────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
}));

app.use(express.json());

// ─────────────────────────────────────────
//  HEALTH CHECK
// ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'via-sovrana-api', ts: new Date().toISOString() });
});

// ─────────────────────────────────────────
//  ROTAS
// ─────────────────────────────────────────
app.use('/api/freight', freightRoutes);
app.use('/api/costs',   costRoutes);

// ─────────────────────────────────────────
//  ERROR HANDLER (deve ser o último middleware)
// ─────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Via Sovrana API rodando na porta ${PORT}`);
});

module.exports = app;
