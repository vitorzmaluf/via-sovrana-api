// const {
//   TAX: FALLBACK_TAX,
//   CITIES: FALLBACK_CITIES,
//   ZONES: FALLBACK_ZONES,
//   TABLE_WEIGHTS: FALLBACK_TABLE_WEIGHTS,
//   DEFAULT_COSTS: FALLBACK_DEFAULT_COSTS,
// } = require('../config/domain');

const RouteRepository = require('../repositories/RouteRepository');
const FreightResult = require('../models/FreightResult');
const {
  DailySimulationResult,
  ClientFreightResult,
  DaySummary,
} = require('../models/DailySimulation');
const { ProposalAnalysis, Verdict } = require('../models/ProposalAnalysis');
const CostService = require('./CostService');

class FreightService {
  async getCalculatorConfig() {
    return RouteRepository.getRouteConfig();
  } 

  quoteFromConfig(config, cityKey, zoneKey, pesoKg) {
    const { TAX, CITIES, ZONES } = config;

    const city = CITIES[cityKey];
    const zone = ZONES[zoneKey];
    const peso = Number(pesoKg);

    if (!city) {
      throw badRequest(`Cidade inválida: ${cityKey}`);
    }

    if (!zone) {
      throw badRequest(`Zona inválida: ${zoneKey}`);
    }

    if (!peso || Number.isNaN(peso) || peso <= 0) {
      throw badRequest('Peso deve ser um número maior que zero.');
    }

    const carga = r2(peso * TAX.RKG);
    const bruto = r2(city.taxaFixa + carga + zone.taxa);
    const icms = r2(bruto * TAX.ICMS_EFET);
    const lp = r2(bruto * TAX.LP);
    const tributos = r2(bruto * TAX.TRIB_TOTAL);
    const liquido = r2(bruto - tributos);

    return new FreightResult({
      cityKey,
      cityLabel: city.label,
      zoneKey,
      zoneLabel: zone.label,
      pesoKg: peso,
      taxaFixa: city.taxaFixa,
      taxaZona: zone.taxa,
      carga,
      bruto,
      icms,
      lp,
      tributos,
      liquido,
      rKgEfetivo: r2(bruto / peso),
    });
  }

  async quote(cityKey, zoneKey, pesoKg) {
    const config = await this.getCalculatorConfig();
    return this.quoteFromConfig(config, cityKey, zoneKey, pesoKg);
  }

  async simulateDay(clientes, costParams = null) {
    const config = await this.getCalculatorConfig();

    const costResult = CostService.calcDailyCostWithDefaults(
      costParams,
      config.DEFAULT_COSTS
    );

    const custoDia = costResult.total;
    const pesoTotal = clientes.reduce((s, c) => s + Number(c.pesoKg || 0), 0);

    if (!pesoTotal || pesoTotal <= 0) {
      throw badRequest('Peso total do dia deve ser maior que zero.');
    }

    const clientResults = clientes.map((c) => {
      const frete = this.quoteFromConfig(
        config,
        c.cityKey,
        c.zoneKey,
        c.pesoKg
      );

      const custoRat = r2((frete.pesoKg / pesoTotal) * custoDia);
      const lucro = r2(frete.liquido - custoRat);
      const margem = r2(lucro / frete.bruto);

      return new ClientFreightResult({
        id: c.id,
        nome: c.nome,
        cidade: frete.cityLabel,
        zona: frete.zoneLabel,
        pesoKg: frete.pesoKg,
        freteBruto: frete.bruto,
        tributos: frete.tributos,
        liquido: frete.liquido,
        custoRateado: custoRat,
        lucro,
        margem,
        rKgEfetivo: frete.rKgEfetivo,
      });
    });

    const receitaTotal = r2(clientResults.reduce((s, r) => s + r.freteBruto, 0));
    const tributosTotal = r2(clientResults.reduce((s, r) => s + r.tributos, 0));
    const liquidoTotal = r2(clientResults.reduce((s, r) => s + r.liquido, 0));
    const lucroTotal = r2(liquidoTotal - custoDia);
    const margemDia = receitaTotal > 0 ? r2(lucroTotal / receitaTotal) : 0;

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

  async buildPriceTable() {
    const config = await this.getCalculatorConfig();

    const { CITIES, ZONES } = config;

    // A tabela de pesos NÃO vem do MySQL por enquanto.
    // Usamos os pesos fixos antigos apenas para a aba "Tabela".
    const tableWeights = config.TABLE_WEIGHTS;

    if (!Array.isArray(tableWeights) || tableWeights.length === 0) {
      throw new Error('Pesos da tabela comercial não configurados no banco.');
    }

    const rows = [];

    for (const [cityKey, city] of Object.entries(CITIES)) {
      for (const [zoneKey, zone] of Object.entries(ZONES)) {
        const precos = {};

        for (const w of tableWeights) {
          precos[`${w}kg`] = this.quoteFromConfig(
            {
              ...config,
              CITIES,
              ZONES,
            },
            cityKey,
            zoneKey,
            w
          ).bruto;
        }

        rows.push({
          cityKey,
          cidade: city.label,
          km: city.km,
          zoneKey,
          zona: zone.label,
          precos,
        });
      }
    }

    return {
      pesos: tableWeights.map((w) => `${w}kg`),
      rows,
    };
  }

  async analyzeProposal(
    cityKey,
    zoneKey,
    pesoKg,
    valorProposto,
    pesoTotalDia,
    costParams = null
  ) {
    const config = await this.getCalculatorConfig();

    const frete = this.quoteFromConfig(config, cityKey, zoneKey, pesoKg);

    const costResult = CostService.calcDailyCostWithDefaults(
      costParams,
      config.DEFAULT_COSTS
    );

    const pesoDia = Number(pesoTotalDia);

    if (!pesoDia || Number.isNaN(pesoDia) || pesoDia <= 0) {
      throw badRequest('Peso total do dia deve ser maior que zero.');
    }

    const custoRat = r2((frete.pesoKg / pesoDia) * costResult.total);
    const minimoAbs = r2(frete.tributos + custoRat);
    const minimoRec = r2(minimoAbs / (1 - 0.15));
    const lucroSeProposta = r2(valorProposto - frete.tributos - custoRat);
    const margemSeProposta = r2(lucroSeProposta / valorProposto);

    let verdito;
    let verditoLabel;

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

  async getReferences() {
    const config = await this.getCalculatorConfig();

    const cidades = Object.values(config.CITIES).map((c) => ({
      key: c.key,
      label: c.label,
      km: c.km,
      taxaFixa: c.taxaFixa,
    }));

    const zonas = Object.values(config.ZONES).map((z) => ({
      key: z.key,
      label: z.label,
      taxa: z.taxa,
    }));

    return { cidades, zonas };
  }
}

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function r2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = new FreightService();