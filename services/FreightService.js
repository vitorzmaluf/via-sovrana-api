const { TAX, CITIES, ZONES, TABLE_WEIGHTS, DEFAULT_COSTS } = require('../config/domain');
const FreightResult    = require('../models/FreightResult');
const { DailySimulationResult, ClientFreightResult, DaySummary } = require('../models/DailySimulation');
const { ProposalAnalysis, Verdict } = require('../models/ProposalAnalysis');
const CostService      = require('./CostService');

class FreightService {

  // ─────────────────────────────────────────
  //  ENVIO ÚNICO
  // ─────────────────────────────────────────

  /**
   * Calcula o frete de um envio isolado.
   * @param {string} cityKey
   * @param {string} zoneKey
   * @param {number} pesoKg
   * @returns {FreightResult}
   */
  quote(cityKey, zoneKey, pesoKg) {
    const city = CITIES[cityKey];
    const zone = ZONES[zoneKey];

    const carga    = r2(pesoKg * TAX.RKG);
    const bruto    = r2(city.taxaFixa + carga + zone.taxa);
    const icms     = r2(bruto * TAX.ICMS_EFET);
    const lp       = r2(bruto * TAX.LP);
    const tributos = r2(bruto * TAX.TRIB_TOTAL);
    const liquido  = r2(bruto - tributos);

    return new FreightResult({
      cityKey,
      cityLabel:  city.label,
      zoneKey,
      zoneLabel:  zone.label,
      pesoKg,
      taxaFixa:   city.taxaFixa,
      taxaZona:   zone.taxa,
      carga,
      bruto,
      icms,
      lp,
      tributos,
      liquido,
      rKgEfetivo: r2(bruto / pesoKg),
    });
  }

  // ─────────────────────────────────────────
  //  SIMULAR DIA
  // ─────────────────────────────────────────

  /**
   * Simula um dia com múltiplos clientes rateando o custo operacional.
   * @param {Array<{id?, nome?, cityKey, zoneKey, pesoKg}>} clientes
   * @param {import('../models/OperationalCost').OperationalCostParams|null} costParams
   * @returns {DailySimulationResult}
   */
  simulateDay(clientes, costParams = null) {
    const costResult  = CostService.calcDailyCost(costParams);
    const custoDia    = costResult.total;
    const pesoTotal   = clientes.reduce((s, c) => s + c.pesoKg, 0);

    const clientResults = clientes.map(c => {
      const frete      = this.quote(c.cityKey, c.zoneKey, c.pesoKg);
      const custoRat   = r2((c.pesoKg / pesoTotal) * custoDia);
      const lucro      = r2(frete.liquido - custoRat);
      const margem     = r2(lucro / frete.bruto);

      return new ClientFreightResult({
        id:           c.id,
        nome:         c.nome,
        cidade:       frete.cityLabel,
        zona:         frete.zoneLabel,
        pesoKg:       c.pesoKg,
        freteBruto:   frete.bruto,
        tributos:     frete.tributos,
        liquido:      frete.liquido,
        custoRateado: custoRat,
        lucro,
        margem,
        rKgEfetivo:   frete.rKgEfetivo,
      });
    });

    const receitaTotal  = r2(clientResults.reduce((s, r) => s + r.freteBruto, 0));
    const tributosTotal = r2(clientResults.reduce((s, r) => s + r.tributos, 0));
    const liquidoTotal  = r2(clientResults.reduce((s, r) => s + r.liquido, 0));
    const lucroTotal    = r2(liquidoTotal - custoDia);
    const margemDia     = pesoTotal > 0 ? r2(lucroTotal / receitaTotal) : 0;

    return new DailySimulationResult({
      clientes: clientResults,
      resumo: new DaySummary({
        pesoTotal,
        receitaTotal,
        tributosTotal,
        liquidoTotal,
        custoDia,
        lucroTotal,
        margemDia,
      }),
      custos: costResult,
    });
  }

  // ─────────────────────────────────────────
  //  TABELA DE PREÇOS
  // ─────────────────────────────────────────

  /**
   * Monta a tabela completa: cidade × zona × peso de referência.
   * @returns {{ pesos: string[], rows: object[] }}
   */
  buildPriceTable() {
    const rows = [];
    for (const [cityKey, city] of Object.entries(CITIES)) {
      for (const [zoneKey, zone] of Object.entries(ZONES)) {
        const precos = {};
        for (const w of TABLE_WEIGHTS) {
          precos[`${w}kg`] = this.quote(cityKey, zoneKey, w).bruto;
        }
        rows.push({ cityKey, cidade: city.label, km: city.km, zoneKey, zona: zone.label, precos });
      }
    }
    return { pesos: TABLE_WEIGHTS.map(w => `${w}kg`), rows };
  }

  // ─────────────────────────────────────────
  //  PROPOSTA CLIENTE
  // ─────────────────────────────────────────

  /**
   * Avalia se uma proposta de preço de cliente é viável.
   * @param {string} cityKey
   * @param {string} zoneKey
   * @param {number} pesoKg
   * @param {number} valorProposto
   * @param {number} pesoTotalDia
   * @param {import('../models/OperationalCost').OperationalCostParams|null} costParams
   * @returns {ProposalAnalysis}
   */
  analyzeProposal(cityKey, zoneKey, pesoKg, valorProposto, pesoTotalDia, costParams = null) {
    const frete      = this.quote(cityKey, zoneKey, pesoKg);
    const costResult = CostService.calcDailyCost(costParams);
    const custoRat   = r2((pesoKg / pesoTotalDia) * costResult.total);

    const minimoAbs = r2(frete.tributos + custoRat);
    const minimoRec = r2(minimoAbs / (1 - 0.15));

    const lucroSeProposta  = r2(valorProposto - frete.tributos - custoRat);
    const margemSeProposta = r2(lucroSeProposta / valorProposto);

    let verdito, verditoLabel;
    if (valorProposto >= frete.bruto) {
      verdito = Verdict.ACCEPT;
      verditoLabel = 'Aceite — valor acima da tabela';
    } else if (valorProposto >= minimoRec) {
      verdito = Verdict.VIABLE;
      verditoLabel = 'Viável — dentro da margem mínima recomendada';
    } else if (valorProposto >= minimoAbs) {
      verdito = Verdict.NEGOTIATE;
      verditoLabel = 'Negocie — abaixo do recomendado, mas cobre custos';
    } else {
      verdito = Verdict.REFUSE;
      verditoLabel = 'Recuse — não cobre tributos + custo operacional';
    }

    return new ProposalAnalysis({
      frete,
      valorProposto,
      minimoAbs,
      minimoRec,
      contraproposta: frete.bruto,
      lucroSeProposta,
      margemSeProposta,
      custoRateado: custoRat,
      verdito,
      verditoLabel,
    });
  }

  // ─────────────────────────────────────────
  //  REFERÊNCIAS
  // ─────────────────────────────────────────

  /** @returns {{ cidades: object[], zonas: object[] }} */
  getReferences() {
    const cidades = Object.values(CITIES).map(c => ({ key: c.key, label: c.label, km: c.km, taxaFixa: c.taxaFixa }));
    const zonas   = Object.values(ZONES).map(z => ({ key: z.key, label: z.label, taxa: z.taxa }));
    return { cidades, zonas };
  }
}

function r2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = new FreightService();
