const { pool } = require('../config/db');
const City = require('../models/City');
const Zone = require('../models/Zone');

function toNumber(value) {
  return Number(value || 0);
}

class RouteRepository {
  async getDefaultRouteKey() {
    const [rows] = await pool.execute(
      `
      SELECT setting_value
      FROM system_settings
      WHERE setting_key = 'default_route_key'
      LIMIT 1
      `
    );

    return rows[0]?.setting_value || 'rota_castelo';
  }

  async getRouteByKey(routeKey) {
    const [rows] = await pool.execute(
      `
      SELECT id, route_key, route_name, corridor_name, origin_region, destination_region
      FROM routes
      WHERE route_key = ?
        AND active = 1
      LIMIT 1
      `,
      [routeKey]
    );

    if (!rows[0]) {
      throw new Error(`Rota não encontrada ou inativa: ${routeKey}`);
    }

    return rows[0];
  }

  async getRouteConfig(routeKey = null) {
    const finalRouteKey = routeKey || await this.getDefaultRouteKey();
    const route = await this.getRouteByKey(finalRouteKey);
    const routeId = route.id;

    const [parameterRows] = await pool.execute(
      `
      SELECT
        price_per_kg,
        presumed_profit_tax_percent,
        effective_icms_percent,
        total_tax_percent,
        default_frequency,
        default_delivery_deadline,
        collection_cutoff_time
      FROM route_parameters
      WHERE route_id = ?
        AND active = 1
      LIMIT 1
      `,
      [routeId]
    );

    if (!parameterRows[0]) {
      throw new Error(`Parâmetros comerciais não encontrados para a rota: ${finalRouteKey}`);
    }

    const params = parameterRows[0];

    const [cityRows] = await pool.execute(
      `
      SELECT
        c.city_key,
        c.city_name,
        c.state_code,
        rc.distance_km,
        rc.fixed_fee,
        rc.frequency,
        rc.delivery_deadline,
        rc.collection_cutoff_time
      FROM route_cities rc
      INNER JOIN cities c ON c.id = rc.city_id
      WHERE rc.route_id = ?
        AND rc.active = 1
        AND c.active = 1
      ORDER BY rc.display_order, c.city_name
      `,
      [routeId]
    );

    const [zoneRows] = await pool.execute(
      `
      SELECT
        dz.zone_key,
        dz.zone_name,
        dz.description,
        rdz.zone_fee
      FROM route_delivery_zones rdz
      INNER JOIN delivery_zones dz ON dz.id = rdz.zone_id
      WHERE rdz.route_id = ?
        AND rdz.active = 1
        AND dz.active = 1
      ORDER BY rdz.display_order, dz.zone_key
      `,
      [routeId]
    );

    // const [weightRows] = await pool.execute(
    //   `
    //   SELECT weight_kg
    //   FROM route_table_weights
    //   WHERE route_id = ?
    //     AND active = 1
    //   ORDER BY display_order, weight_kg
    //   `,
    //   [routeId]
    // );

    const [costRows] = await pool.execute(
      `
      SELECT
        daily_km,
        vehicle_km_per_liter,
        fuel_price_per_liter,
        driver_cost,
        vehicle_insurance_cost,
        maintenance_cost_per_km,
        vehicle_installment_daily_cost,
        tolls_cost,
        cargo_insurance_cost
      FROM route_cost_defaults
      WHERE route_id = ?
        AND active = 1
      LIMIT 1
      `,
      [routeId]
    );

    if (!costRows[0]) {
      throw new Error(`Custos padrão não encontrados para a rota: ${finalRouteKey}`);
    }

    const CITIES = {};
    for (const row of cityRows) {
      CITIES[row.city_key] = new City(
        row.city_key,
        row.city_name,
        toNumber(row.distance_km),
        toNumber(row.fixed_fee)
      );
    }

    const ZONES = {};
    for (const row of zoneRows) {
      ZONES[row.zone_key] = new Zone(
        row.zone_key,
        row.zone_name,
        toNumber(row.zone_fee)
      );
    }

    const cost = costRows[0];

    return {
      route: {
        id: route.id,
        key: route.route_key,
        name: route.route_name,
        corridorName: route.corridor_name,
        originRegion: route.origin_region,
        destinationRegion: route.destination_region,
      },

      TAX: {
        RKG: toNumber(params.price_per_kg),
        LP: toNumber(params.presumed_profit_tax_percent),
        ICMS_EFET: toNumber(params.effective_icms_percent),
        TRIB_TOTAL: toNumber(params.total_tax_percent),
      },

      CITIES,
      ZONES,

      TABLE_WEIGHTS: [],
    //   weightRows.map((row) => toNumber(row.weight_kg)),

      DEFAULT_COSTS: {
        kmDia: toNumber(cost.daily_km),
        kmL: toNumber(cost.vehicle_km_per_liter),
        dieselL: toNumber(cost.fuel_price_per_liter),
        motorista: toNumber(cost.driver_cost),
        seguroVeic: toNumber(cost.vehicle_insurance_cost),
        manutKmR: toNumber(cost.maintenance_cost_per_km),
        parcelaVeic: toNumber(cost.vehicle_installment_daily_cost),
        pedagios: toNumber(cost.tolls_cost),
        seguroCarga: toNumber(cost.cargo_insurance_cost),
      },

      commercialDefaults: {
        frequency: params.default_frequency,
        deliveryDeadline: params.default_delivery_deadline,
        collectionCutoffTime: params.collection_cutoff_time,
      },
    };
  }
}

module.exports = new RouteRepository();