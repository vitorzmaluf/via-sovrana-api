require('dotenv').config();

const express = require('express');
const cors = require('cors');
const freightRoutes = require('./routes/freight');
const costRoutes = require('./routes/costs');
const leadRoutes = require('./routes/leads');
const authRoutes = require('./routes/auth');
const { authRequired } = require('./middleware/auth');
const { errorHandler } = require('./middleware/validation');
const { testConnection } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

const defaultOrigins = [
  'https://viasovrana.com.br',
  'https://www.viasovrana.com.br',

  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5500',
  'http://localhost:8080',

  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:8080'
];

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : defaultOrigins;

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'via-sovrana-api',
    message: 'API Node publicada corretamente'
  });
});

app.get('/health', async (req, res) => {
  try {
    const dbOk = await testConnection();

    res.json({
      status: 'ok',
      service: 'via-sovrana-api',
      database: dbOk ? 'ok' : 'error',
      ts: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      service: 'via-sovrana-api',
      database: 'error',
      message: error.message,
      ts: new Date().toISOString()
    });
  }
}); 

app.use('/api/auth', authRoutes);

// Rotas protegidas da calculadora interna
app.use('/api/freight', authRequired, freightRoutes);
app.use('/api/costs', authRequired, costRoutes);

// Rota pública do formulário do site
app.use('/api/leads', leadRoutes);


app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Via Sovrana API rodando na porta ${PORT}`);
});

module.exports = app;