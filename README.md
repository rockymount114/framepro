# FramePro — AI-Powered Picture Frame & Interior Visualization Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0+-000000.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB.svg?style=flat&logo=python)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0+-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED.svg?style=flat&logo=docker)](https://www.docker.com/)

FramePro is a production-ready, monorepo-based SaaS and B2B platform designed for the framing and interior design industry. It combines high-density PS moulding product management, photorealistic 2D frame rendering, AI room wall detection, automated Incoterm quotation generation, and distributor logistics planning into an integrated ecosystem.

---

## 🌟 Key Features

- 🖼️ **AI 2D Frame Preview Studio**: Real-time rendering of artwork framed with custom PS moulding SKUs, adjustable moulding widths (30mm–80mm), silk mat board margins, and lighting bevel highlights.
- 🏠 **AI Room Visualizer & Wall Detector**: Wall plane region detection, perspective transform, and ambient shadow synthesis placing artwork into real interior scenes.
- 📄 **Automated B2B PDF Quotation Engine**: Instant generation of official PDF quotes supporting **FOB**, **EXW**, and **DDP** Incoterms, wholesale tier discounts (Bronze, Silver, Gold), tax calculations, and Minimum Order Quantity (MOQ) validation.
- 📦 **Distributor & Container Logistics Portal**: Real-time warehouse inventory tracking (US West, US East, Ningbo) and container loading status.
- 💬 **AI Sales Assistant Chatbot**: Interactive sales consultant widget providing product guidance, MOQ verification, and CRM lead capture.

---

## 🏗️ Architecture & Monorepo Structure

```
.
├── apps/
│   ├── api/             # FastAPI REST API (Python 3.12, SQLAlchemy 2.0 Async, Pydantic v2)
│   └── web/             # Next.js App Router (React, TypeScript, Tailwind CSS, Framer Motion)
├── packages/
│   ├── ai/              # AI Pipeline (Compositor, Wall Detector, Recommender, LLM Assistant)
│   ├── database/        # Database models (Repository Pattern & Async SQLite/PostgreSQL)
│   ├── config/          # Centralized configuration & settings management
│   └── shared/          # Shared Pydantic schemas, TypeScript definitions, and constants
├── docker/              # Dockerfiles for API & Web, and docker-compose.yml setup
├── AGENTS.md            # Multi-agent contribution guidelines
├── ARCHITECTURE.md      # High-level architecture documentation
├── DATABASE.md          # Database schema specification
├── API_SPEC.md          # REST API OpenAPI contracts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v22.0.0` or higher
- **Python**: `v3.12.0` or higher
- **npm**: `v10.0.0` or higher
- *(Optional)* **Docker & Docker Compose**

---

### Option 1: Running with Docker Compose (Recommended)

To launch the complete platform (FastAPI backend, Next.js frontend, and Redis) with Docker Compose:

**Build services:**
```bash
docker compose -f docker/docker-compose.yml build
```

**Start services in background:**
```bash
docker compose -f docker/docker-compose.yml up -d
```

**Build and start in one command:**
```bash
docker compose -f docker/docker-compose.yml up -d --build
```

**Rebuild a single service after code updates:**
```bash
docker compose -f docker/docker-compose.yml build web --no-cache
docker compose -f docker/docker-compose.yml up -d --build web
```

**Running with Docker Hub Compose:**
```bash
docker compose -f docker/docker-compose.hub.yml up -d
```

- **Frontend Application**: `http://localhost:3000`
- **FastAPI Backend**: `http://localhost:8000`
- **Swagger API Docs**: `http://localhost:8000/docs`

---

### Option 2: Running Locally

#### 1. Backend Setup (`apps/api`)

From the project root:

```bash
# Install Python dependencies
python3 -m pip install fastapi uvicorn pydantic pydantic-settings sqlalchemy aiosqlite httpx reportlab pillow ruff pytest pytest-asyncio email-validator

# Start FastAPI server
PYTHONPATH=. python3 -m uvicorn apps.api.app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

#### 2. Frontend Setup (`apps/web`)

In a separate terminal window:

```bash
cd apps/web

# Install frontend dependencies
npm install

# Start Next.js development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🧪 Running Tests

The backend test suite covers critical business logic including MOQ validation, Incoterms calculations, wholesale tier pricing, PDF document generation, product catalog API endpoints, and AI pipeline render execution.

To run the tests:

```bash
PYTHONPATH=. python3 -m pytest apps/api/tests
```

All 10 integration and unit tests should pass cleanly.

---

## 🛠️ Tech Stack Overview

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lucide Icons
- **Backend**: FastAPI, Python 3.12, Pydantic v2, SQLAlchemy 2.0 (Async), ReportLab PDF Engine, Pillow (PIL)
- **Database**: PostgreSQL / SQLite (via SQLAlchemy Repository Pattern), Alembic Migrations
- **DevOps**: Docker, Docker Compose, Traefik Reverse Proxy, GitHub Actions CI/CD

---

## 📄 License

Copyright © 2026 FramePro Ecosystem Inc. All rights reserved.
