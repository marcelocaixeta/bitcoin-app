# Nova Arquitetura — Bitcoin App → Plataforma de finanças pessoais

Documento de referência para o frontend React (GitHub Pages), rotas, autenticação e integração com API **Laravel + PostgreSQL**.

**Última atualização:** maio/2026  
**Frontend:** React 18 + CRA (`react-scripts` 5) → evolução com **React Router**  
**Backend (planejado):** Laravel 11+ + PostgreSQL  
**Produção do frontend:** [https://marcelocaixeta.github.io/bitcoin-app/](https://marcelocaixeta.github.io/bitcoin-app/)

---

## 1. Visão do produto

O app começou como painel de **Bitcoin + Fear & Greed Index**. A evolução é uma **SPA** em que usuários autenticados gerenciam finanças pessoais; o painel de mercado permanece como área pública ou logada.

| Domínio | Descrição |
|---------|-----------|
| **Autenticação** | Cadastro, login, sessão, perfil |
| **Prestações** | Parcelas / compromissos recorrentes ou parcelados |
| **Recebimentos** | Entradas de dinheiro |
| **Cartão** | Gastos no cartão de crédito |
| **Cálculos / dashboard** | Saldo, projeções, totais por período (regras no backend) |
| **Market insights** | BTC + FGI (funcionalidade atual) |

O **backend** concentra regras de negócio, persistência e segurança. O **frontend** em GitHub Pages só consome a API REST (JSON).

```text
┌─────────────────────┐         HTTPS JSON          ┌──────────────────────┐
│  React SPA (Pages)  │  ◄──────────────────────►  │  Laravel API + PG    │
│  marcelocaixeta...  │      Bearer token / CORS     │  api.seudominio.com  │
└─────────────────────┘                             └──────────────────────┘
```

---

## 2. Princípios arquiteturais

| Princípio | Aplicação |
|-----------|-----------|
| **Feature-based** | Pastas por domínio (`auth`, `finance`, `market-insights`) |
| **Rotas explícitas** | `react-router-dom` com layouts público vs autenticado |
| **API desacoplada** | `shared/api` com `baseURL` por ambiente; sem lógica de DB no React |
| **Pages finas** | `pages/` só monta features; lógica fica em `features/` e `shared/` |
| **Deploy estático** | Build CRA → `gh-pages`; sem Node no servidor de produção do front |
| **Migração incremental** | Painel BTC continua funcionando enquanto entram login e finanças |

### Regras de importação

```text
pages  →  features  →  shared
app (router, layouts, providers)  →  pages | features | shared
features  ✗→  outra feature (usar app/ ou shared/ para orquestrar)
```

---

## 3. Arquitetura alvo do frontend

### 3.1 Estrutura de pastas

```text
src/
├── app/
│   ├── App.jsx
│   ├── router.jsx                 # definição de rotas
│   ├── providers.jsx              # AuthProvider, React Query (opcional)
│   └── layouts/
│       ├── PublicLayout.jsx       # login, cadastro
│       └── AppLayout.jsx          # menu + <Outlet /> área logada
│
├── pages/                         # 1 arquivo ≈ 1 rota (composição fina)
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── InstallmentsPage.jsx
│   ├── IncomePage.jsx
│   ├── CreditCardPage.jsx
│   └── MarketInsightsPage.jsx     # painel BTC/FGI atual
│
├── features/
│   ├── auth/
│   │   ├── components/            # LoginForm, RegisterForm
│   │   ├── context/AuthContext.jsx
│   │   ├── hooks/useAuth.js
│   │   ├── services/authApi.js
│   │   └── index.js
│   ├── finance/
│   │   ├── installments/
│   │   ├── income/
│   │   ├── credit-card/
│   │   ├── dashboard/             # resumos que consomem API agregada
│   │   └── index.js
│   └── market-insights/           # ex-MyComponent, PointerChart, charts
│       ├── components/
│       ├── services/              # CoinGecko, alternative.me (públicos)
│       └── index.js
│
├── shared/
│   ├── api/
│   │   └── httpClient.js          # axios + baseURL + interceptor Authorization
│   ├── components/
│   │   └── ProtectedRoute.jsx
│   ├── config/
│   │   └── env.js                 # REACT_APP_API_URL
│   ├── constants/
│   └── utils/
│
├── index.js
├── index.css
├── setupTests.js
└── reportWebVitals.js
```

### 3.2 Dependências novas (planejadas)

| Pacote | Uso |
|--------|-----|
| `react-router-dom` | Rotas, layouts, navegação |
| `@tanstack/react-query` (opcional) | Cache de chamadas à API Laravel, loading/error |
| (futuro) biblioteca de formulários | `react-hook-form` + validação |

---

## 4. Rotas

### 4.1 Mapa de rotas

| Rota (path) | Acesso | Página | Feature principal |
|-------------|--------|--------|-------------------|
| `/` | Público ou redirect | Home / redirect | — |
| `/login` | Público | `LoginPage` | `auth` |
| `/register` | Público | `RegisterPage` | `auth` |
| `/market` | Público* | `MarketInsightsPage` | `market-insights` |
| `/dashboard` | Autenticado | `DashboardPage` | `finance/dashboard` |
| `/installments` | Autenticado | `InstallmentsPage` | `finance/installments` |
| `/income` | Autenticado | `IncomePage` | `finance/income` |
| `/credit-card` | Autenticado | `CreditCardPage` | `finance/credit-card` |

\*Decisão de produto: `/market` pode ficar público para manter o app atual acessível sem login.

### 4.2 Exemplo de `router.jsx`

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { MarketInsightsPage } from '../pages/MarketInsightsPage';
// ... demais pages

const BASENAME = '/bitcoin-app'; // igual ao homepage do package.json

export function AppRouter() {
  return (
    <BrowserRouter basename={BASENAME}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/market" element={<MarketInsightsPage />} />
        </Route>

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/installments" element={<InstallmentsPage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/credit-card" element={<CreditCardPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/market" replace />} />
        <Route path="*" element={<Navigate to="/market" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 4.3 `ProtectedRoute`

Redireciona para `/login` se não houver usuário/token válido; opcionalmente guarda `location` para voltar após login.

```jsx
// shared/components/ProtectedRoute.jsx (conceito)
export function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
```

---

## 5. GitHub Pages + React Router

O Pages serve **arquivos estáticos**. Não há rewrite automático para SPA em subpath (`/bitcoin-app/login`).

### 5.1 Configuração obrigatória (CRA)

`package.json`:

```json
"homepage": "https://marcelocaixeta.github.io/bitcoin-app/"
```

Isso define `PUBLIC_URL=/bitcoin-app` no build. O router usa **`basename="/bitcoin-app"`**.

### 5.2 Escolha de estratégia de rotas

| Estratégia | URL exemplo | Prós | Contras |
|------------|-------------|------|---------|
| **A) `BrowserRouter` + `404.html`** | `.../bitcoin-app/login` | URLs limpas | Exige `public/404.html` no deploy |
| **B) `HashRouter`** | `.../bitcoin-app/#/login` | Funciona sem config extra no Pages | `#` na URL |

**Recomendação:** **A (`BrowserRouter`)** para app de finanças (URLs mais profissionais). **B** como plano B se o 404 der trabalho.

#### Estratégia A — `public/404.html`

Copiar o `index.html` do build (ou template com redirect) para que refresh em `/bitcoin-app/dashboard` não dê 404 do GitHub. O CRA documenta o script de redirect para SPA no Pages.

Após `npm run build`, garantir que o deploy inclua `404.html` na raiz do site publicado (branch `gh-pages`).

#### Estratégia B — `HashRouter`

```jsx
import { HashRouter } from 'react-router-dom';
// basename não é necessário no HashRouter para paths internos
<HashRouter>
  <Routes>...</Routes>
</HashRouter>
```

### 5.3 O que **não** muda no Pages

- Fluxo: `npm run build` → `npm run deploy` (`gh-pages -d build`)
- Backend Laravel em **outro host** (VPS, Railway, Forge, etc.) — Pages **não** roda PHP

### 5.4 Variáveis de ambiente no CRA

Arquivo `.env.development`:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

Arquivo `.env.production`:

```env
REACT_APP_API_URL=https://api.seudominio.com/api
```

Uso em `shared/config/env.js`:

```javascript
export const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:8000/api';
```

**Importante:** variáveis `REACT_APP_*` são embutidas no build. Troque a URL da API de produção **antes** de `npm run build` para deploy.

---

## 6. Integração com Laravel + PostgreSQL

### 6.1 Separação de responsabilidades

| Camada | Responsabilidade |
|--------|------------------|
| **React (Pages)** | UI, formulários, navegação, exibição de totais retornados pela API |
| **Laravel** | Autenticação, validação, autorização, regras de cálculo, ORM, migrations |
| **PostgreSQL** | Dados por usuário (multi-tenant por `user_id`) |

Cálculos (saldo, parcelas restantes, fatura do cartão, etc.) devem ser feitos no **backend** para um único lugar de verdade; o front só exibe e envia inputs.

### 6.2 Autenticação recomendada (SPA estática + API separada)

Como o front está em `github.io` e a API em outro domínio, evite depender só de cookie de sessão SPA sem CORS/Sanctum bem configurado.

| Opção | Quando usar |
|-------|-------------|
| **Laravel Sanctum — API tokens** | Bearer token no header `Authorization`; simples para mobile/web estático |
| **JWT** (`tymon/jwt-auth` ou pacotes Laravel) | Se preferir token stateless puro |

Fluxo típico:

1. `POST /api/register` → cria usuário  
2. `POST /api/login` → retorna `{ token, user }`  
3. Front guarda token (`localStorage` ou `sessionStorage`; ver nota de segurança)  
4. `httpClient` adiciona `Authorization: Bearer <token>`  
5. `GET /api/user` (ou `/me`) para hidratar sessão ao abrir o app  
6. `POST /api/logout` invalida token no servidor (se aplicável)

**Laravel:** migrations em PG, Models (`User`, `Installment`, `Income`, `CreditCardExpense`, …), Policies por `user_id`, Resources/Controllers em `routes/api.php`.

### 6.3 CORS (obrigatório)

No Laravel, permitir origem do frontend:

```text
https://marcelocaixeta.github.io
```

E em desenvolvimento:

```text
http://localhost:3000
```

Sanctum / `config/cors.php` — `supports_credentials` só se usar cookies cross-site (mais complexo com Pages).

### 6.4 Contrato de API (esboço)

Prefixo: `{API_URL}` = ex. `https://api.seudominio.com/api`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/register` | Cadastro |
| POST | `/login` | Login → token |
| POST | `/logout` | Logout (auth) |
| GET | `/user` | Usuário atual (auth) |
| GET/POST/PUT/DELETE | `/installments` | CRUD prestações |
| GET/POST/PUT/DELETE | `/incomes` | CRUD recebimentos |
| GET/POST/PUT/DELETE | `/credit-card-expenses` | CRUD gastos cartão |
| GET | `/dashboard/summary` | Totais calculados (período query `?from=&to=`) |

Respostas JSON padronizadas; erros HTTP 422 com `errors` para formulários.

### 6.5 `shared/api/httpClient.js` (padrão)

```javascript
import axios from 'axios';
import { API_URL } from '../config/env';

export const httpClient = axios.create({
  baseURL: API_URL,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

httpClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      // limpar token + redirect login (via evento ou callback injetado)
    }
    return Promise.reject(error);
  }
);
```

APIs públicas (CoinGecko, FGI) podem usar `axios` direto ou um `publicHttpClient` sem token.

---

## 7. Segurança (frontend estático)

| Tópico | Orientação |
|--------|------------|
| Token em `localStorage` | Comum em SPAs; vulnerável a XSS — sanitize inputs, dependências atualizadas |
| `sessionStorage` | Expira ao fechar aba; um pouco menos persistente |
| HTTPS | Pages e API sempre em HTTPS em produção |
| Secrets | Nunca commitar `.env.production` com chaves privadas; só `REACT_APP_API_URL` pública |
| Autorização | Laravel valida `user_id` em **toda** query; front só esconde rotas |

---

## 8. Mapeamento do código atual → nova estrutura

| Atual | Destino |
|-------|---------|
| `App.js` + charts | `app/` + `pages/MarketInsightsPage` + `features/market-insights/` |
| `MyComponent.js`, `PointerChart.js` | `features/market-insights/components/` |
| `FearAndGreedChartLine.js` | `features/market-insights/components/` |
| `ServiceBitcoinPrice.js`, `ServiceFearAndGreed.js` | `features/market-insights/services/` |
| (novo) login/cadastro | `features/auth/` + `pages/` |
| (novo) finanças | `features/finance/*` |

---

## 9. Plano de migração (sem quebrar Pages)

Cada etapa termina com **`npm run build` OK**. Deploy (`npm run deploy`) nos marcos **M1, M4, M7**.

### M0 — Baseline
- `npm run build` e smoke test do painel atual em `/bitcoin-app`.

### M1 — Rotas + layout (sem backend)
- Instalar `react-router-dom`.
- Criar `app/router.jsx`, `PublicLayout`, `AppLayout`.
- Mover painel BTC para rota `/market` (`MarketInsightsPage`).
- Configurar `BrowserRouter` + `basename` **ou** `HashRouter`.
- Se `BrowserRouter`: adicionar `public/404.html` para SPA no Pages.
- **Deploy.**

### M2 — Esqueleto de features e `shared/api`
- Pastas `features/auth`, `features/finance`, `shared/api`, `shared/config`.
- `httpClient` com `REACT_APP_API_URL` (ainda sem API real).

### M3 — Auth UI (mock ou API local)
- `LoginPage`, `RegisterPage`, `AuthContext`, `ProtectedRoute`.
- Rotas `/login`, `/register`, `/dashboard` (dashboard placeholder).
- Integrar Laravel local quando existir `POST /api/login`.

### M4 — Módulo finanças (primeira entidade)
- Ex.: CRUD **recebimentos** (`/income`) contra API Laravel.
- **Deploy** com API de staging apontada em `.env.production`.

### M5 — Demais entidades
- Prestações, cartão, página de dashboard com `GET /dashboard/summary`.

### M6 — Limpeza
- Remover arquivos legados na raiz de `src/`.
- Reexports antigos removidos.

### M7 — Hardening
- React Query (cache), tratamento global de 401, testes de rotas protegidas.
- **Deploy final.**

---

## 10. Estado atual (AS-IS) — referência

Estrutura plana em `src/` (CRA), sem router. APIs externas públicas: CoinGecko e alternative.me. Deploy via `homepage` + `gh-pages`.

Dívidas técnicas atuais: `await` no top-level de módulos; serviços acoplados aos componentes; `class` em vez de `className` em `App.js`.

Detalhes históricos da migração só de pastas (pré-rotas) permanecem válidos como subpassos dentro de **M1** e **M6**.

---

## 11. Backend Laravel — checklist paralelo

Desenvolver em repositório separado (recomendado) `bitcoin-api` ou monorepo `backend/`:

- [ ] Laravel 11+, PostgreSQL, `.env`  
- [ ] Migrations: `users`, `installments`, `incomes`, `credit_card_expenses`  
- [ ] Sanctum ou JWT configurado  
- [ ] CORS para `github.io` e `localhost:3000`  
- [ ] `routes/api.php` com prefixo `/api`  
- [ ] Policies / `user_id` em todos os recursos  
- [ ] Endpoint `dashboard/summary` com regras de cálculo  
- [ ] Deploy API (HTTPS) — **domínio fixo** para `REACT_APP_API_URL`  

---

## 12. Validação antes de cada deploy

```bash
npm run build
# Testar local: http://localhost:3000/bitcoin-app/...
# Rotas: /market, /login, refresh em rota profunda (se BrowserRouter)
npm run deploy
```

Checklist produção:

- [ ] `homepage` inalterado  
- [ ] `REACT_APP_API_URL` aponta para API de produção no build  
- [ ] Login e uma rota autenticada funcionam contra API real  
- [ ] `/market` (BTC/FGI) ainda carrega  
- [ ] CORS sem erro no console  

---

## 13. Decisões registradas

| Data | Decisão |
|------|---------|
| 2026-05 | Frontend permanece em **GitHub Pages**; backend em **Laravel + PostgreSQL** em host separado. |
| 2026-05 | Arquitetura **feature-based** + **React Router** com área pública e área autenticada. |
| 2026-05 | Cálculos financeiros no **Laravel**; React apenas apresenta e edita dados. |
| 2026-05 | Rotas: preferir **`BrowserRouter` + `basename` + `404.html`**; `HashRouter` como alternativa. |
| 2026-05 | Auth: **Bearer token** (Sanctum API / JWT) por simplicidade com SPA estática cross-origin. |

---

## 14. Referências

- [CRA — Deployment / GitHub Pages](https://create-react-app.dev/docs/deployment/#github-pages)  
- [React Router — Basename](https://reactrouter.com/en/main/router-components/browser-router)  
- [Laravel Sanctum — API Token Authentication](https://laravel.com/docs/sanctum#api-token-authentication)  
- [Laravel CORS](https://laravel.com/docs/routing#cors)  
- Deploy deste repo: `README.md`
