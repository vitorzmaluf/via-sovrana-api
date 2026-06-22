const express       = require('express');
const cors          = require('cors');
const freightRoutes = require('./routes/freight');
const costRoutes    = require('./routes/costs');
const { errorHandler } = require('./middleware/validation');

const app  = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'https://viasovrana.com.br',
  'https://www.viasovrana.com.br',

  // Localhost para testes
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5500',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5500'
];

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'via-sovrana-api', ts: new Date().toISOString() });
});

app.use('/api/freight', freightRoutes);
app.use('/api/costs', costRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Via Sovrana API rodando na porta ${PORT}`);
});

module.exports = app;