const City  = require('../models/City');
const Zone  = require('../models/Zone');

// ─────────────────────────────────────────
//  CONSTANTES FISCAIS
// ─────────────────────────────────────────
const TAX = Object.freeze({
  RKG:        1.54,    // R$/kg
  LP:         0.0593,  // Lucro Presumido
  ICMS_EFET:  0.096,   // Decreto SP 70.292/2025 — válido até 31/12/2026
  TRIB_TOTAL: 0.1553,
});

// ─────────────────────────────────────────
//  CIDADES — CORREDOR CASTELO BRANCO
// ─────────────────────────────────────────
const CITIES = Object.freeze({
  itapevi:   new City('itapevi',   'Itapevi',   40,  90),
  itu:       new City('itu',       'Itu',        80,  110),
  sorocaba:  new City('sorocaba',  'Sorocaba',   95,  80),
  salto:     new City('salto',     'Salto',      95,  80),
  boituva:   new City('boituva',   'Boituva',   120,  60),
  cerquilho: new City('cerquilho', 'Cerquilho', 120,  60),
  tatui:     new City('tatui',     'Tatuí',     144,  75),
});

// ─────────────────────────────────────────
//  ZONAS DE ENTREGA EM SP
// ─────────────────────────────────────────
const ZONES = Object.freeze({
  z1: new Zone('z1', 'Z1 — Casa Verde, Santana, Lapa, Centro', 35),
  z2: new Zone('z2', 'Z2 — Vila Mariana, Tatuapé, Mooca',      55),
  z3: new Zone('z3', 'Z3 — Jabaquara, Penha, Itaquera',        80),
  z4: new Zone('z4', 'Z4 — Guarulhos, ABC, Cotia, Barueri',   120),
});

// ─────────────────────────────────────────
//  PESOS DE REFERÊNCIA (tabela de preços)
// ─────────────────────────────────────────
const TABLE_WEIGHTS = Object.freeze([30, 80, 150, 300, 500]);

// ─────────────────────────────────────────
//  CUSTO OPERACIONAL PADRÃO
// ─────────────────────────────────────────
const DEFAULT_COSTS = Object.freeze({
  kmDia:       340,
  kmL:         11,
  dieselL:     6.20,
  motorista:   200.00,
  seguroVeic:  20.00,
  manutKmR:    0.12,
  parcelaVeic: 100.00,
  pedagios:    80.00,
  seguroCarga: 19.00,
});

module.exports = { TAX, CITIES, ZONES, TABLE_WEIGHTS, DEFAULT_COSTS };
