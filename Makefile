# Opal — Next.js app + FastAPI (api-placeholder: CV Formatter + Job Clarity)
# Usage: make help | make dev | make api-dev

.PHONY: help install dev build start lint clean api-install api-dev

.DEFAULT_GOAL := help

NPM ?= npm
PY ?= python3
API_DIR := api-placeholder
API_PORT ?= 8001

help:
	@echo "Opal targets:"
	@echo "  make install      Install npm dependencies"
	@echo "  make dev          Run Next.js dev server (http://localhost:3000)"
	@echo "  make build        Production build"
	@echo "  make start        Run production server (run build first)"
	@echo "  make lint         Run ESLint"
	@echo "  make clean        Remove .next cache"
	@echo ""
	@echo "FastAPI ($(API_DIR)) — CV Formatter + Job Clarity (same process):"
	@echo "  make api-install  Create .venv and pip install -r requirements.txt"
	@echo "  make api-dev      uvicorn app:app on port $(API_PORT)"
	@echo "  Health: http://127.0.0.1:$(API_PORT)/health"
	@echo "  Job Clarity analyze: POST http://127.0.0.1:$(API_PORT)/api/analyze  body: {\"jd_text\":\"...\"}"
	@echo "Point Opal at the API (.env.local, no trailing slash; restart make dev after edits):"
	@echo "  FASTAPI_BACKEND_URL=http://127.0.0.1:$(API_PORT)"
	@echo "Job Rubric generate uses scripts/rubric/genrubric.py (not FastAPI). Run both:"
	@echo "  Terminal 1: make api-dev    Terminal 2: make dev"
	@echo "OPENAI_API_KEY: set in $(API_DIR)/.env (see $(API_DIR)/jobclaritybot/.env.example)."
	@echo ""
	@echo "Optional — standalone jobclaritybot (separate repo on another port):"
	@echo "  JOBCLARITYBOT_URL=http://127.0.0.1:8000   # Opal proxies /full here if FASTAPI_BACKEND_URL is unset"

install:
	$(NPM) install

dev:
	$(NPM) run dev

build:
	$(NPM) run build

start:
	$(NPM) run start

lint:
	$(NPM) run lint

clean:
	rm -rf .next

# Paths after `cd $(API_DIR)` must be relative (.venv/...), not $(API_DIR)/.venv/...
api-install:
	cd $(API_DIR) && $(PY) -m venv .venv && .venv/bin/python -m pip install -U pip && .venv/bin/python -m pip install -r requirements.txt

api-dev:
	@test -x "$(API_DIR)/.venv/bin/python" || test -x "$(API_DIR)/.venv/bin/python3" || (echo "Missing venv. Run: make api-install" && false)
	cd $(API_DIR) && (test -x .venv/bin/python && exec .venv/bin/python -m uvicorn app:app --host 127.0.0.1 --port $(API_PORT) || exec .venv/bin/python3 -m uvicorn app:app --host 127.0.0.1 --port $(API_PORT))
