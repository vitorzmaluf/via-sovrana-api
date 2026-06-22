const express           = require('express');
const FreightController = require('../controllers/FreightController');
const { validateQuote, validateSimulateDay, validateProposal } = require('../middleware/validation');

const router = express.Router();

/**
 * GET  /api/freight/references     → lista cidades e zonas
 * GET  /api/freight/table          → tabela completa de preços
 * POST /api/freight/quote          → envio único
 * POST /api/freight/simulate-day   → simular dia com múltiplos clientes
 * POST /api/freight/proposal       → análise de proposta de cliente
 */

router.get('/references',    FreightController.references.bind(FreightController));
router.get('/table',         FreightController.priceTable.bind(FreightController));
router.post('/quote',        validateQuote,       FreightController.quote.bind(FreightController));
router.post('/simulate-day', validateSimulateDay, FreightController.simulateDay.bind(FreightController));
router.post('/proposal',     validateProposal,    FreightController.proposal.bind(FreightController));

module.exports = router;
