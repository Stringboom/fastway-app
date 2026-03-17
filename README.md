# Fastway Couriers — Track & Quote

> **Technical Assessment** Fastway Couriers South Africa

A web application integrating with the Fastway Couriers SA API to provide parcel tracking and shipping quotes.

Live: [Website](https://fastway-app.fly.dev/)

---

## Tech Stack

| Layer      | Technology                                     |
|------------|------------------------------------------------|
| Frontend   | React 18 + React Router + Bootstrap 5 + Vite  |
| Backend    | PHP 8.2 (no framework)                         |
| Web server | nginx + PHP-FPM (single container)             |
| Container  | Docker + Docker Compose                        |

---

## Project Structure

```
fastway-app/
├── Dockerfile                        # Multi-stage: Node → PHP-FPM + nginx
├── docker-compose.yml                # Single service, reads from .env
├── .env.example                      # Environment variable template
├── .github/workflows/deploy.yml      # CI/CD — secrets from GitHub
│
├── backend/
│   ├── composer.json
│   ├── public/index.php              # Front controller (API routes only)
│   └── src/
│       ├── Controllers/              # TrackController, QuoteController,
│       │                             # SuburbsController, HealthController
│       ├── Services/FastwayApiClient.php
│       ├── Http/                     # Request, Response, Router
│       ├── Middleware/               # CorsMiddleware, RateLimitMiddleware
│       └── Validation/Validator.php
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── context/ApiContext.jsx    # React context — all API calls live here
        ├── App.jsx
        ├── main.jsx                  # Imports Bootstrap from npm
        ├── components/               # Navbar, Footer, Alert, Spinner
        ├── pages/                    # HomePage, TrackPage, QuotePage
        └── styles/global.css         # Brand variables + timeline only
```

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Steps

```bash
git clone https://github.com/Stringboom/fastway-app.git fastway-app && cd fastway-app

cp .env.example .env
# Edit .env and set FASTWAY_API_KEY

docker compose up --build
```

Open **http://localhost:8080**

---

## Environment Variables

Create a `.env` file from `.env.example`. **Never commit `.env` to version control.**

| Variable           | Description                          |
|--------------------|--------------------------------------|
| `FASTWAY_API_KEY`  | Fastway API key (server-side only)   |
| `FASTWAY_API_BASE` | `https://sa.api.fastway.org/latest`  |
| `FASTWAY_RFC_CODE` | Regional franchise code (`JNB`)      |

The API key is consumed exclusively by the PHP backend — it is never sent to or stored in the browser.


## Local Development (without Docker)

### Backend

```bash
cd backend && composer install
FASTWAY_API_KEY=your_key FASTWAY_RFC_CODE=JNB php -S 0.0.0.0:8080 -t public public/index.php
```

### Frontend

```bash
cd frontend && npm install
npm run dev   # → http://localhost:3000 (proxies /api to localhost:8080)
```

---

## API Endpoints

| Method | Path            | Description                                          |
|--------|-----------------|------------------------------------------------------|
| `GET`  | `/api/health`   | Health check                                         |
| `GET`  | `/api/track`    | Track parcel — `?label=Z60000983328`                 |
| `GET`  | `/api/quote`    | Shipping quote — `?suburb=Sandton&postcode=2196&weight=2.5` |
| `GET`  | `/api/suburbs`  | Suburb autocomplete — `?term=Sand`                   |

All endpoints proxy through the PHP backend — the Fastway API key is never exposed.

---

## Features

### Track & Trace (`/track`)
- Enter a Fastway label number to get current status, scan history, and POD signature
- Status badge driven by scan type: `P` Pickup · `T` Transit · `D` Delivered
- Deep-link support: `/track?label=Z60000983328`
- Test labels: `Z60000983328`, `Z30002408261`

### Shipping Quote (`/quote`)
- Suburb autocomplete — searches `/psc/listdeliverysuburbs/JNB/{term}`, auto-fills postcode
- Optional parcel dimensions (L × W × H cm) — cubic weight applied if greater than dead weight
- Multiple region matches handled silently — first match used automatically
- Displays best rate + all services with incl./excl. VAT pricing and frequent shipper rates
- RFCode `JNB` applied automatically

---

## Architecture Notes

**Project structure** follows a layered, MVC-adjacent pattern without a framework:
- `Controllers` handle HTTP concerns
- `FastwayApiClient` is the sole point of contact with the external API
- `Middleware` handles CORS and rate limiting as composable cross-cutting concerns
- `Validator` is a stateless utility

**React context** (`ApiContext`) centralises all API calls. Pages consume `useApi()` and never import `axios` directly — this makes it trivial to mock or swap the transport layer in tests.

**Multi-provider extensibility**: introduce a `CourierInterface` with `trackParcel()` and `getQuote()` methods. Each courier implements it; a factory resolves the correct implementation. Controllers become provider-agnostic.

**API key security**: loaded from environment on the server — never transmitted to the browser, never in `docker-compose.yml` defaults, never in source control. In CI/CD it flows from GitHub secrets into a generated `.env` file.

**Rate limiting**: file-based token bucket, 30 requests/minute per IP. Upgrade to Redis for multi-instance deployments.

**Caching**: track results can be cached ~60 seconds; quote results ~5 minutes. Use Redis or APCu.

**Scaling**: at 100 req/day the current setup handles it easily. At 10k/day: add Redis, a load balancer, and 2–3 PHP-FPM replicas behind nginx upstream.

---

## Security

- API key is server-side only — never exposed to the client
- All inputs validated and sanitised before any API call
- Rate limiting: 30 req/min per IP
- CORS restricted via `ALLOWED_ORIGIN` env var
- Security headers set by nginx (`X-Frame-Options`, `X-Content-Type-Options`)

---
