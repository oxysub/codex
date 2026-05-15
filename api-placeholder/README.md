# Opal FastAPI Placeholder

Standalone CV formatter backend for the Opal frontend.

## Files

- `app.py` exposes `/health` and mounts the CV formatter router.
- `cvformatter/routes.py` implements `POST /cv/format` returning `{ previewHtml, downloadUrl }`.
- `cvformatter/cv_parser.py` parses PDF or DOCX CVs with OpenAI.
- `cvformatter/cv_formatter.py` builds the Oxydata DOCX output.

## Run locally

```bash
cd api-placeholder
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app:app --host 127.0.0.1 --port 8000
```

Then keep Opal pointed at the local backend:

```bash
FASTAPI_BACKEND_URL=http://127.0.0.1:8000
```

## Notes

- The parser uses `OPENAI_API_KEY` and calls `gpt-4o-mini`.
- The frontend already posts multipart form data to `/cv/format` through `app/api/cv-format/route.ts`.