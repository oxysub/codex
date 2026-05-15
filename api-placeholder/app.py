from fastapi import FastAPI

from cvformatter import router as cv_formatter_router


app = FastAPI(title="Opal CV Formatter", version="0.1.0")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(cv_formatter_router)