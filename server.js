const express       = require('express');
const cors          = require('cors');
const freightRoutes = require('./routes/freight');
const costRoutes    = require('./routes/costs');
const { errorHandler } = require('./middleware/validation');

const app  = express();
const PORT = process.env.PORT || 3000;

// CORS aberto temporariamente para teste
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'via-sovrana-api',
    ts: new Date().toISOString()
  });
});

app.use('/api/freight', freightRoutes);
app.use('/api/costs', costRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Via Sovrana API rodando na porta ${PORT}`);
});

module.exports = app;