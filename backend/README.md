# ShiftDesk Backend (Flask + MongoDB)

## Setup

```bash
cd /home/runner/work/ShiftDesk/ShiftDesk/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and set:

- `MONGODB_URI` (required for goals storage)
- `MONGODB_DB_NAME` (optional, default is `shiftdesk`)

## Run

```bash
python app.py
```

## Quick API checks

Health:

```bash
curl http://localhost:5000/api/health
```

Create a goal:

```bash
curl -X POST http://localhost:5000/api/goals \
  -H "Content-Type: application/json" \
  -d '{"goal":"Revise Java loops","workspace":"Study","subject":"Java"}'
```

List goals:

```bash
curl http://localhost:5000/api/goals
curl "http://localhost:5000/api/goals?workspace=Project"
```

If MongoDB is not configured or unavailable, `/` and `/api/health` still work and goals endpoints return a clear error.
