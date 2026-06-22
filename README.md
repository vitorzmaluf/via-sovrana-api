# Via Sovrana API — Deploy na Hostinger

## Estrutura do projeto

```
via-sovrana-api/
├── server.js               ← entry point Express
├── package.json
├── api-client.js           ← usado pelo FRONTEND (copiar para /vs-interno/)
│
├── config/
│   └── domain.js           ← constantes fiscais, cidades, zonas
│
├── models/                 ← classes de domínio (imutáveis)
│   ├── City.js
│   ├── Zone.js
│   ├── FreightResult.js
│   ├── DailySimulation.js
│   ├── OperationalCost.js
│   └── ProposalAnalysis.js
│
├── dto/
│   └── index.js            ← contratos de request/response de cada endpoint
│
├── services/               ← lógica de negócio
│   ├── FreightService.js
│   └── CostService.js
│
├── controllers/            ← orquestração HTTP
│   ├── FreightController.js
│   └── CostController.js
│
├── routes/                 ← definição de rotas
│   ├── freight.js
│   └── costs.js
│
└── middleware/
    └── validation.js       ← validação de entrada + error handler global
```

---

## Endpoints disponíveis

| Método | Rota                        | Descrição                              |
|--------|-----------------------------|----------------------------------------|
| GET    | /health                     | Health check                           |
| GET    | /api/freight/references     | Lista cidades e zonas                  |
| GET    | /api/freight/table          | Tabela completa de preços              |
| POST   | /api/freight/quote          | Frete de envio único                   |
| POST   | /api/freight/simulate-day   | Simular dia com múltiplos clientes     |
| POST   | /api/freight/proposal       | Análise de proposta de cliente         |
| GET    | /api/costs/defaults         | Parâmetros padrão de custo             |
| POST   | /api/costs/calculate        | Recalcular custo + break-even          |

---

## Deploy na Hostinger (VPS ou Node.js Hosting)

### 1. Subir os arquivos

Via FTP (Hostinger File Manager ou FileZilla), faça upload de toda a pasta
`via-sovrana-api/` para `~/via-sovrana-api/` no servidor.

### 2. Instalar dependências

No terminal SSH da Hostinger:

```bash
cd ~/via-sovrana-api
npm install --production
```

### 3. Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
CORS_ORIGIN=https://vitorzmaluf.github.io
```

Instale o dotenv:
```bash
npm install dotenv
```

Adicione no topo do `server.js`:
```js
require('dotenv').config();
```

### 4. Rodar com PM2 (processo persistente)

```bash
npm install -g pm2
pm2 start server.js --name via-sovrana-api
pm2 save
pm2 startup   # faz reiniciar automaticamente no boot
```

### 5. Proxy reverso (Nginx — recomendado na Hostinger VPS)

Se sua Hostinger usar Nginx, adicione um bloco server para expor a API:

```nginx
server {
    listen 80;
    server_name api.viasovrana.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Depois habilite HTTPS via Certbot:
```bash
sudo certbot --nginx -d api.viasovrana.com.br
```

### 6. Atualizar o frontend

No arquivo `api-client.js` que fica na pasta `/vs-interno/`, atualize:

```js
const BASE_URL = 'https://api.viasovrana.com.br';
```

---

## Próximos passos — Persistência (fase 2)

Quando for adicionar banco de dados, a estrutura já está preparada.
Adicionar:

```
repositories/
├── TripRepository.js      ← salvar dias simulados
├── ClientRepository.js    ← cadastro de clientes
└── PriceHistoryRepository.js
```

Sugestão de banco: **SQLite** (via `better-sqlite3`) para começar sem infra extra.
Migrar para **PostgreSQL** quando precisar de múltiplos usuários ou relatórios.

---

## Exemplo de uso da API

### POST /api/freight/quote

```json
// Request
{
  "cityKey": "sorocaba",
  "zoneKey": "z2",
  "pesoKg": 150
}

// Response
{
  "cidade": "Sorocaba",
  "zona": "Z2 — Vila Mariana, Tatuapé, Mooca",
  "pesoKg": 150,
  "composicao": {
    "taxaFixa": 80,
    "carga": 231,
    "taxaZona": 55
  },
  "freteBruto": 366,
  "icms": 35.14,
  "lp": 21.7,
  "tributos": 56.84,
  "freteliquido": 309.16,
  "rKgEfetivo": 2.44
}
```

### POST /api/freight/simulate-day

```json
// Request
{
  "clientes": [
    { "nome": "Indústria Alpha", "cityKey": "sorocaba", "zoneKey": "z1", "pesoKg": 200 },
    { "nome": "Distribuidora Beta", "cityKey": "boituva",  "zoneKey": "z2", "pesoKg": 80  }
  ]
}

// Response
{
  "clientes": [ ... ],
  "resumo": {
    "pesoTotal": 280,
    "receitaTotal": 598.2,
    "tributosTotal": 92.9,
    "liquidoTotal": 505.3,
    "custoDia": 651,
    "lucroTotal": -145.7,
    "margemDia": -0.24
  },
  "custos": { "diesel": 191.64, ... "total": 651 }
}
```
