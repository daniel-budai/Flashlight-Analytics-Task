
# Flashlight Analytics

A fullstack vehicle import and analytics platform built with:

- React + Vite
- Flask
- SQLite
- Docker
- TanStack Query

---

# Quick Start (Docker)

Start the full application:

```bash
docker compose up --build
```

Open:

```txt
http://localhost:5173
```

> Stop local `python run.py` and `npm run dev` first — Docker uses the same ports (`5000` and `5173`).

Stop containers:

```bash
docker compose down
```

---

# Manual Setup

## Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate environment

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend
python run.py
```

Backend runs at:

```txt
http://127.0.0.1:5000
```

---

## Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

---

# Running Tests

## Backend Tests

```bash
cd backend

# Activate environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run tests
PYTHONPATH=. pytest
```

Run a single test file:

```bash
PYTHONPATH=. pytest tests/api/test_import_jobs.py -v
```

### Test Mode

Tests use:

```txt
SYNC_IMPORTS=True
```

Imports run synchronously during tests:

- `201 Created`
- No background job polling required

---

## Frontend Tests

```bash
cd frontend

npm install

# Run once
npm test -- --run
```

Watch mode:

```bash
npm test
```

---

# Sample Data

Use:

```txt
FA_test.csv
```

Upload it through the:

```txt
Import CSV
```

panel in the UI.

---

# Architecture

```txt
CSV Upload (React)
        │
        ▼
POST /api/import
        │
        ▼
Background Import Job
        │
 ┌──────┴──────────────┐
 │                     │
 ▼                     ▼
Validate CSV     Dedupe & Store
                        │
                        ▼
               SQLite Database
         (cars + price_history)
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
 GET /api/cars                  GET /api/stats
                                (cached 5 min)
        │
        ▼
 React UI
 (Table, Filters, Charts)
```

---

# Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React, Vite, TanStack Query, Recharts, Tailwind |
| Backend | Flask, SQLAlchemy, pandas |
| Database | SQLite |
| Optional | Flask-Caching, async imports |

---

# Data Model

## `cars`

Stores vehicle information:

- Brand
- Model
- Year
- Fuel type
- Mileage

---

## `price_history`

Stores historical price snapshots:

- Price
- Date
- Source

---

## `import_logs`

Stores summaries of completed imports:

- Filename
- Row counts
- Validation errors

---

## `import_jobs`

Tracks async import states:

```txt
pending → processing → completed / failed
```

---

# API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/import` | Upload CSV file |
| `GET` | `/api/imports/jobs/:id` | Poll import job status |
| `GET` | `/api/imports` | Fetch import history |
| `GET` | `/api/cars` | List cars with filters |
| `GET` | `/api/stats` | Aggregated statistics |

---

# Import Responses

## Async Import (Default)

`POST /api/import`

Response:

```http
202 Accepted
```

```json
{
  "job_id": 1,
  "status": "pending"
}
```

Poll:

```txt
GET /api/imports/jobs/1
```

---

## Completed Job Example

```json
{
  "id": 1,
  "filename": "FA_test.csv",
  "status": "completed",
  "created_at": "2026-05-24T19:00:00+00:00",
  "completed_at": "2026-05-24T19:00:01+00:00",
  "result": {
    "imported": 57,
    "skipped": 4,
    "duplicates": 0,
    "invalid_rows": [
      {
        "row": 4,
        "reason": "Missing price"
      }
    ],
    "duplicate_rows": []
  }
}
```

---

## Failed Job Example

```json
{
  "id": 2,
  "filename": "bad.csv",
  "status": "failed",
  "error": "Missing required columns: {'price'}",
  "created_at": "2026-05-24T19:05:00+00:00",
  "completed_at": "2026-05-24T19:05:00+00:00"
}
```

---

## Sync Import (Tests Only)

When enabled:

```txt
SYNC_IMPORTS=True
```

`POST /api/import` returns:

```http
201 Created
```

Result is returned immediately without polling.

---

# CSV Requirements

## Required Columns

| Column | Description |
|---|---|
| `brand` | Vehicle brand |
| `model` | Vehicle model |
| `price` | Numeric price (`>= 0`) |

---

## Optional Columns

| Column | Aliases | Description |
|---|---|---|
| `date` | `registration_date` | Price date |
| `year` | — | Model year |
| `fuel_type` | — | Petrol, diesel, etc |
| `mileage` | `mileage_km` | Odometer reading |
| `source` | — | Data source label |

---

# Validation Rules

## File-Level Validation

Missing required columns:

```txt
Job status → failed
```

---

## Row-Level Validation

Skipped rows include:

- Missing brand
- Missing model
- Missing price
- Negative price
- Invalid dates

---

## Supported Date Formats

```txt
YYYY-MM-DD
DD/MM/YYYY
MM/DD/YYYY
DD-MM-YYYY
YYYY/MM/DD
```

---

## Duplicate Detection

Duplicate key:

```txt
(car_id, date, price)
```

Prevents duplicate re-imports while still allowing:

- Same car
- Different dates
- Different prices

---

# Filters

Filters work on:

- `/api/cars`
- `/api/stats`

---

## Exact & Multi-Value Filters

```txt
brand=BMW,Audi
fuel_type=diesel
model=320
year=2020
latest_only=true
```

---

## Numeric Range Filters

```txt
price_min=10000
price_max=15000

mileage_min=10000
mileage_max=80000

year_min=2018
year_max=2022
```

---

## Pagination & Sorting

Available on:

```txt
/api/cars
```

### Pagination

```txt
page=1
per_page=20
```

### Sorting

```txt
sort=price
order=desc
```

Supported sort fields:

```txt
price
date
mileage
year
```

Supported order:

```txt
asc
desc
```

---

## Example Requests

```txt
GET /api/cars?brand=BMW,Audi&fuel_type=diesel&price_min=10000&price_max=15000&latest_only=true&page=1&per_page=20&sort=price&order=desc
```

```txt
GET /api/stats?brand=Toyota&latest_only=true
```

---

# Optional Features

| Feature | Description |
|---|---|
| Async imports | Background processing with polling |
| Stats caching | `/api/stats` cached for 5 minutes |
| Pagination | `/api/cars` supports paging |
| Automated tests | pytest + Vitest |
| Docker support | Full containerized setup |

---

# Docker Notes

- Backend runs on:

```txt
0.0.0.0:5000
```

- Upload temp files stored at:

```txt
/tmp/uploads
```

- SQLite persists via:

```txt
./backend:/app
```

- Frontend proxy:

```txt
VITE_API_PROXY=http://backend:5000
```

---

# Technical Decisions

## Normalized Schema

CSV rows are split into:

- `cars`
- `price_history`

Benefits:

- Historical price tracking
- `latest_only` support
- Future analytics support

---

## Two-Level Import Validation

### File-level errors

Fail the entire job.

### Row-level errors

Skip invalid rows while importing valid rows.

---

## Duplicate Detection Strategy

Duplicate key:

```txt
(car_id, date, price)
```

Allows:

- Same vehicle
- New prices
- Different dates

Without double-counting imports.

---

## Async Imports Without Celery

Uses:

- Thread pool
- DB-backed `ImportJob`

Chosen to keep the stack lightweight for the assignment.

Production alternative:

```txt
Celery + Redis + PostgreSQL
```

---

## Stats Caching Strategy

Only:

```txt
/api/stats
```

is cached.

Cache is cleared after successful imports instead of using per-key invalidation.