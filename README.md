# 🏎️ F1 Insights & Morning Brief Platform

[![Deploy to VPS](https://github.com/m3/f1-insights/actions/workflows/deploy.yml/badge.svg)](https://github.com/m3/f1-insights/actions/workflows/deploy.yml)
[![Run Test Suite](https://github.com/m3/f1-insights/actions/workflows/test.yml/badge.svg)](https://github.com/m3/f1-insights/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A production-ready **Modular Monolith** for Formula 1 race pace analysis, corner telemetry traces, tyre degradation modeling, FIA penalty watch, multi-source X & YouTube media sentiment radar, and AI-generated race briefings.

🌐 **Live Production URL**: [https://f1.sports.superchargedbym3.com](https://f1.sports.superchargedbym3.com)  
⚡ **API Health Endpoint**: [https://f1.sports.superchargedbym3.com/api/v1/health](https://f1.sports.superchargedbym3.com/api/v1/health)  
📖 **OpenAPI Documentation**: [https://f1.sports.superchargedbym3.com/api/v1/docs](https://f1.sports.superchargedbym3.com/api/v1/docs)  

---

## 🏛️ System Architecture Overview

```
                      ┌──────────────────────────────────────────────┐
                      │              PRODUCTION WEB CLIENT           │
                      │  • React + Vite SPA Dashboard                │
                      │  • https://f1.sports.superchargedbym3.com    │
                      └──────────────────────┬───────────────────────┘
                                             │
                                             │ HTTPS / REST (/api/v1/*)
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │          NGINX REVERSE PROXY & SSL           │
                      │  • Port 3010: React Vite SPA                 │
                      │  • Port 8000: FastAPI Backend Monolith        │
                      │  • Rate Limiting: 30r/m burst=20             │
                      └──────────────────────┬───────────────────────┘
                                             │
                                             ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                                FastAPI MODULAR MONOLITH                                   │
│                                                                                           │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌───────────────────────────┐  │
│  │     REST API LAYER      │  │   CALENDAR SCHEDULER    │  │   ASYNC WORKER PIPELINE   │  │
│  │ • /api/v1/overview      │  │ • Session Checkpoints   │  │ • FastF1 & TracingInsights│  │
│  │ • /api/v1/telemetry     │  │ • Dynamic Polling       │  │ • Shared Connection Pool  │  │
│  │ • /api/v1/admin (Key)   │  │ • Briefing Triggers     │  │ • X & YouTube Media Radar │  │
│  └────────────┬────────────┘  └────────────┬────────────┘  └─────────────┬─────────────┘  │
└───────────────┼────────────────────────────┼─────────────────────────────┼────────────────┘
                │                            │                             │
                ▼                            ▼                             ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                              STORAGE & INTEGRATION LAYER                                  │
│  • SQLite 3 (WAL Mode): f1_insights.db (Single Source of Truth)                            │
│  • Multi-Source Schema: config/entities.json (Schema v2026.3)                             │
│  • Delivery Channels: Discord Webhooks & Telegram Bot                                     │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack & Key Features

- **Backend Monolith**: Python 3.11+, FastAPI, Uvicorn, SQLAlchemy, SQLite WAL Mode.
- **Frontend Dashboard**: React, Vite, Recharts (interactive corner speed/throttle traces), Lucide React, Vanilla CSS Carbon Dark System.
- **Data Analytics Engine**: FastF1, TracingInsights GitHub archive, Jolpica / Ergast F1 API.
- **Social Media Radar**: Schema v2026.3 tracking journalists, drivers, technical keywords, and **YouTube watchalong channels** (`@F1Gamer`, `@peterwindsor`, `@brrrake`, `@donut`, `@autosport`).
- **Security & Hardening**: Let's Encrypt SSL, Nginx IP Rate Limiting (`30r/m burst=20`), `X-API-Key` protected admin trigger endpoints (`/api/v1/admin/*`).
- **CI/CD Pipeline**: GitHub Actions implementing **M3-Conventions §3 (CI-builds-the-artifact)** with rsync & PM2 health verification.

---

## 🚀 Local Development & Running Tests

### 1. Install Dependencies
```bash
# Backend dependencies
pip install -r backend/requirements.txt

# Frontend dependencies
cd portal && npm install && cd ..
```

### 2. Run Test Suite
```bash
npm test
# OR
python3 -m pytest -v
```

### 3. Run Pipeline & Dev Server
```bash
# Run pipeline to seed database
npm run pipeline

# Start local PM2 stack
npm run pm2:start
```

---

## 🔄 CI/CD & Production Deployment (M3-Conventions §3)

Deployments to **`m3-vps`** are fully automated via GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)):

```
┌────────────────────────────────┐
│ GitHub Actions CI Build        │ ──► Runs pytest, builds React UI in CI
└────────────────────────────────┘
                │
                ▼ (Rsync Artifact)
┌────────────────────────────────┐
│ m3-vps Server                  │ ──► /var/www/f1-insights/
└────────────────────────────────┘
                │
                ▼
┌────────────────────────────────┐
│ PM2 Process Supervisor         │ ──► Restarts PM2 & verifies health status
└────────────────────────────────┘
```

### Required GitHub Secrets:
- `VPS_HOST`: IP address of VPS (`91.99.167.113`).
- `VPS_USERNAME`: SSH user (`mathias`).
- `VPS_SSH_KEY`: SSH Private Key.
- `VPS_PROJECT_PATH`: Target directory (`/var/www/f1-insights`).
