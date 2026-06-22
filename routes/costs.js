const express         = require('express');
const CostController  = require('../controllers/CostController');

const router = express.Router();

/**
 * GET  /api/costs/defaults     → valores padrão para pré-preencher o form
 * POST /api/costs/calculate    → recalcula com parâmetros customizados
 */

router.get('/defaults',   CostController.defaults.bind(CostController));
router.post('/calculate', CostController.calculate.bind(CostController));

module.exports = router;
