# 🚗 RideFlow — Frontend

> Aplicação Angular 18 para gerenciamento de corridas em tempo real.

---

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Executando](#executando)
- [Testes](#testes)
- [Build de Produção](#build-de-produção)
- [Docker](#docker)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Stack Tecnológica](#stack-tecnológica)
- [Funcionalidades](#funcionalidades)

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|------------|---------------|
| Node.js    | 18.x          |
| npm        | 9.x           |
| Angular CLI| 18.x          |
| Docker     | 24.x (opcional) |

---

## Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd frontend

# Instale as dependências
npm ci
```

---

## Executando

```bash
# Desenvolvimento (http://localhost:4200)
npm start

# O backend deve estar rodando em http://localhost:8080
```

### Variáveis de ambiente

| Variável | Dev | Produção |
|----------|-----|----------|
| `apiUrl` | `http://localhost:8080/api/v1` | `/api/v1` |
| `sseUrl` | `http://localhost:8080/api/v1/notifications` | `/api/v1/notifications` |

Configuradas em `src/environments/environment.ts` e `environment.prod.ts`.

---

## Testes

```bash
# Rodar todos os testes
npm test

# Modo watch
npm run test:watch

# Com relatório de cobertura
npm run test:coverage
```

### Cobertura mínima (jest.config.js)

| Métrica    | Threshold |
|------------|-----------|
| Statements | 70%       |
| Branches   | 70%       |
| Functions  | 70%       |
| Lines      | 70%       |

---

## Build de Produção

```bash
npm run build:prod
```

Os artefatos são gerados em `dist/rideflow-frontend/browser/`.

---

## Docker

```bash
# Build da imagem
docker build -t rideflow-frontend .

# Executar standalone (porta 4200)
docker run -p 4200:80 rideflow-frontend
```

### Stack completa via Docker Compose

```bash
# A partir da pasta backend/, sobe tudo (PG + Redis + Kafka + Backend + Frontend)
cd ../backend
docker compose up -d --build

# Ver logs do frontend
docker logs -f rideflow-frontend

# Parar tudo
docker compose down
```

O Nginx serve a SPA e faz proxy reverso de `/api/` para o backend.

---

## Estrutura do Projeto

```
src/app/
├── core/                          # Singleton services, models, interceptors
│   ├── models/                    # Interfaces (Ride, Driver, Address, ApiResponse)
│   ├── services/                  # HTTP services (RideApi, DriverApi, Cep, SSE)
│   ├── interceptors/              # Functional interceptors (error, loading)
│   └── facades/                   # State management com Signals (RideFacade, DriverFacade)
│
├── shared/                        # Componentes e utilitários reutilizáveis
│   ├── components/
│   │   ├── address-form/          # CEP lookup + auto-preenchimento
│   │   ├── error-message/         # Exibe string ou FieldError[]
│   │   ├── loading-spinner/       # Spinner com mensagem
│   │   └── status-badge/          # Badge colorido por status
│   ├── pipes/                     # RideStatusPipe
│   └── validators/                # UUID, CEP, UF, endereços diferentes
│
├── features/
│   ├── passenger/
│   │   └── components/
│   │       ├── ride-form/         # Formulário de solicitação de corrida
│   │       └── ride-confirmation/ # Confirmação pós-criação
│   └── driver/
│       └── components/
│           ├── driver-dashboard/  # Painel com SSE em tempo real
│           ├── ride-card/         # Card de corrida (aceitar/rejeitar)
│           └── connection-status/ # Indicador SSE (🟢/🔴/🟡)
│
├── app.component.ts               # Toolbar + navegação por abas
├── app.config.ts                   # Providers (router, http, interceptors)
└── app.routes.ts                   # Lazy loading: /passenger, /driver
```

---

## Stack Tecnológica

| Tecnologia       | Versão | Propósito                            |
|------------------|--------|--------------------------------------|
| Angular          | 18.x   | Framework (Standalone, Signals)      |
| Angular Material | 18.x   | Componentes UI                       |
| RxJS             | 7.x    | Programação reativa (HTTP, SSE)      |
| TypeScript       | 5.x    | Linguagem                            |
| Jest             | 29.x   | Testes unitários                     |
| Nginx            | 1.27   | Servidor de produção (Docker)        |
| Docker           | —      | Conteinerização multi-stage          |

### Padrões adotados

- **Standalone Components** — sem NgModules, tree-shaking otimizado
- **Signals** — state management reativo nativo do Angular
- **Facade Pattern** — abstrai HTTP + state dos componentes
- **Smart/Dumb Components** — separação de responsabilidades
- **Reactive Forms** — validação cross-field reativa
- **Functional Interceptors** — cross-cutting concerns sem classes
- **OnPush Change Detection** — em componentes Dumb

---

## Funcionalidades

### 🚗 Passageiro (`/passenger`)
- Seleção de usuário (dropdown com UUIDs mockados)
- Formulário de endereço com busca automática por CEP (ViaCEP)
- Validação cross-field (origem ≠ destino)
- Confirmação visual após criação da corrida

### 🚙 Motorista (`/driver`)
- Seleção de motorista (carregado do backend)
- Conexão SSE em tempo real com indicador visual
- Lista de corridas pendentes atualizada automaticamente
- Aceitar/Rejeitar corrida com feedback (snackbar)
- Tratamento de conflito 409 (corrida já aceita)

---

## Alinhamento com o Backend

| Endpoint Backend                           | Componente Frontend     |
|--------------------------------------------|-------------------------|
| `POST /api/v1/rides`                       | RideFormComponent       |
| `GET /api/v1/rides?status=PENDING`         | DriverDashboardComponent|
| `POST /api/v1/rides/{id}/accept`           | DriverDashboardComponent|
| `POST /api/v1/rides/{id}/reject`           | DriverDashboardComponent|
| `GET /api/v1/drivers`                      | DriverDashboardComponent|
| `GET /api/v1/notifications/drivers/{id}/stream` | SseService         |
