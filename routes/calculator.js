const express = require('express');
const CalculatorController = require('../controllers/CalculatorController');

const router = express.Router();

router.get('/config', CalculatorController.config.bind(CalculatorController));

module.exports = router;