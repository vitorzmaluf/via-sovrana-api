require('dotenv').config();

const RouteRepository = require('../repositories/RouteRepository');

async function main() {
  const config = await RouteRepository.getRouteConfig();

  console.log(JSON.stringify({
    route: config.route,
    TAX: config.TAX,
    cidades: Object.values(config.CITIES),
    zonas: Object.values(config.ZONES),
    pesos: config.TABLE_WEIGHTS,
    custos: config.DEFAULT_COSTS,
    commercialDefaults: config.commercialDefaults,
  }, null, 2));
}

main()
  .then(() => {
    console.log('\nConfiguração da rota carregada com sucesso.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nErro ao carregar configuração da rota:');
    console.error(error);
    process.exit(1);
  });