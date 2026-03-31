import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Oxydata Tools API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MANATAL_API_KEY = os.getenv("MANATAL_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


class RubricRequest(BaseModel):
    job_id: str
    job_name: str
    client: str


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/generate-rubric")
async def generate_rubric(request: RubricRequest):
    # TODO: Integrate with OpenAI to generate actual rubric
    rubric_url = f"https://storage.example.com/rubrics/{request.job_id}_rubric.xlsx"
    return {
        "success": True,
        "rubric_url": rubric_url,
        "message": f"Rubric generated successfully for {request.job_name}",
    }


@app.post("/api/format-cv")
async def format_cv(
    candidate_name: str = Form(...),
    cv_file: UploadFile = File(...),
):
    # TODO: Integrate with OpenAI to format actual CV
    contents = await cv_file.read()
    docx_url = f"https://storage.example.com/cvs/CV_{candidate_name.replace(' ', '_')}_Formatted.docx"
    return {
        "success": True,
        "docx_url": docx_url,
        "message": f"CV formatted successfully for {candidate_name}",
    }
