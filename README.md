# Evolutionary Paradigm

FastAPI and React demos for genetic-programming symbolic regression and differential evolution.

## What it does

`backend/main.py` exposes these routes:

- `POST /run/gp` evolves expression trees against samples generated from `x^3 + 2x^2 + x`. The response includes the best expression, predictions, sample points, and convergence values.
- `POST /run/de` applies differential evolution to the two-variable sphere objective and returns the best vector and convergence values.
- `POST /run/all` runs both demos.
- `GET /health` reports API status.

The fitness values describe each generated demo request. They are not benchmark results or evidence of generalization.

## Run the API

From `backend/` in PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --reload
```

On macOS or Linux, use `.venv/bin/python` instead of `.\.venv\Scripts\python.exe`.

In a second PowerShell terminal, from `frontend/`:

```powershell
npm ci
$env:VITE_API_URL = "http://127.0.0.1:8000"
npm run dev
```

On macOS or Linux, start the client with `VITE_API_URL=http://127.0.0.1:8000 npm run dev`.

The commands match the source configuration. Installation and runtime behavior were not retested in this documentation pass.
