import base64
import html
import io
import logging

from docx import Document
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse

from .cv_formatter import format_cv
from .cv_parser import parse_cv


router = APIRouter()


def _escape_html(value: str) -> str:
    return html.escape(value, quote=True)


def docx_bytes_to_simple_html(docx_bytes: bytes) -> str:
    doc = Document(io.BytesIO(docx_bytes))
    chunks: list[str] = [
        '<div class="cv-preview-docx" style="font-family:Calibri,Arial,sans-serif;'
        'font-size:10pt;color:#1f2937;padding:16px;max-width:820px;margin:0 auto;">'
    ]

    for element in doc.element.body:
        if element.tag == qn("w:p"):
            para = Paragraph(element, doc)
            text = para.text.strip()
            style_name = (para.style and para.style.name) or ""
            if not text:
                chunks.append('<p style="margin:0.25em 0;line-height:1.4;">&nbsp;</p>')
                continue
            if "Heading" in style_name:
                chunks.append(
                    f'<p style="margin:0.65em 0 0.35em;font-weight:700;font-size:11pt;'
                    f'color:#1f3864;">{_escape_html(text)}</p>'
                )
            elif "List" in style_name:
                chunks.append(
                    f'<p style="margin:0.2em 0 0.35em 1.1em;line-height:1.4;">'
                    f'• {_escape_html(text)}</p>'
                )
            else:
                parts: list[str] = []
                for run in para.runs:
                    if not run.text:
                        continue
                    chunk = _escape_html(run.text)
                    if run.bold:
                        chunk = f"<strong>{chunk}</strong>"
                    if run.italic:
                        chunk = f"<em>{chunk}</em>"
                    parts.append(chunk)
                inner = "".join(parts) if parts else _escape_html(text)
                chunks.append(f'<p style="margin:0.35em 0;line-height:1.45;">{inner}</p>')
        elif element.tag == qn("w:tbl"):
            table = Table(element, doc)
            chunks.append(
                '<table style="border-collapse:collapse;width:100%;margin:0.75em 0;font-size:10pt;">'
            )
            for row in table.rows:
                chunks.append("<tr>")
                for cell in row.cells:
                    chunks.append(
                        '<td style="border:1px solid #ccc;padding:4px 8px;vertical-align:top;">'
                    )
                    for cell_para in cell.paragraphs:
                        cell_text = cell_para.text.strip()
                        if cell_text:
                            chunks.append(f"<div>{_escape_html(cell_text)}</div>")
                    chunks.append("</td>")
                chunks.append("</tr>")
            chunks.append("</table>")

    chunks.append("</div>")
    return "".join(chunks)


@router.post("/cv/original-preview")
async def cv_original_preview(file: UploadFile = File(...)):
    raw = await file.read()
    if not raw:
        return JSONResponse({"error": "Uploaded file is empty."}, status_code=400)

    filename = file.filename or "cv.pdf"
    lower = filename.lower()
    ext = lower.rsplit(".", 1)[-1] if "." in lower else ""
    if ext not in ("pdf", "doc", "docx"):
        return JSONResponse(
            {"error": f"Unsupported file type .{ext}. Use PDF or DOCX."},
            status_code=400,
        )

    if ext == "pdf":
        encoded = base64.b64encode(raw).decode("ascii")
        return {
            "previewType": "pdf",
            "previewUrl": f"data:application/pdf;base64,{encoded}",
        }

    try:
        preview_html = docx_bytes_to_simple_html(raw)
    except Exception as error:
        logging.exception("original preview conversion failed")
        return JSONResponse(
            {
                "error": (
                    "Unable to render this file as an inline preview. "
                    "Please upload a DOCX or PDF file."
                ),
                "detail": str(error),
            },
            status_code=400,
        )

    return {
        "previewType": "html",
        "previewHtml": preview_html,
    }


@router.post("/cv/format")
async def cv_format_for_opal(candidateName: str = Form(""), file: UploadFile = File(...)):
    name = candidateName.strip()
    if not name:
        return JSONResponse({"error": "Candidate name is required."}, status_code=400)

    raw = await file.read()
    if not raw:
        return JSONResponse({"error": "Uploaded file is empty."}, status_code=400)

    filename = file.filename or "cv.pdf"
    lower = filename.lower()
    ext = lower.rsplit(".", 1)[-1] if "." in lower else ""
    if ext not in ("pdf", "doc", "docx"):
        return JSONResponse(
            {"error": f"Unsupported file type .{ext}. Use PDF or DOCX."},
            status_code=400,
        )

    try:
        structured_data = parse_cv(raw, filename)
    except ValueError as error:
        return JSONResponse({"error": str(error)}, status_code=400)
    except Exception as error:
        logging.exception("parse_cv failed (Opal /cv/format)")
        return JSONResponse({"error": f"CV parsing failed: {error!s}"}, status_code=500)

    personal = structured_data.get("personal") or {}
    personal["name"] = name
    structured_data["personal"] = personal

    try:
        docx_bytes = format_cv(structured_data)
    except Exception as error:
        logging.exception("format_cv failed (Opal /cv/format)")
        return JSONResponse({"error": f"CV formatting failed: {error!s}"}, status_code=500)

    try:
        preview_html = docx_bytes_to_simple_html(docx_bytes)
    except Exception as error:
        logging.warning("docx preview HTML failed: %s", error)
        preview_html = "<p>Preview unavailable; use Download for the formatted document.</p>"

    encoded = base64.b64encode(docx_bytes).decode("ascii")
    download_url = (
        "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,"
        + encoded
    )

    return {"previewHtml": preview_html, "downloadUrl": download_url}