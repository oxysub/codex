import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Upload a CV file before previewing." }, { status: 400 });
  }

  const fileName = typeof file === "object" && file && "name" in file ? String(file.name) : "cv";
  const ext = fileName.toLowerCase().split(".").pop() ?? "";

  const backendBase = process.env.FASTAPI_BACKEND_URL?.replace(/\/$/, "");
  if (backendBase) {
    const url = `${backendBase}/cv/original-preview`;
    try {
      const proxyForm = new FormData();
      proxyForm.append("file", file, fileName);

      const response = await fetch(url, {
        method: "POST",
        body: proxyForm
      });
      const text = await response.text();
      let data: unknown;
      try {
        data = JSON.parse(text) as Record<string, unknown>;
      } catch {
        return NextResponse.json(
          {
            error: `CV backend returned non-JSON at ${url} (HTTP ${response.status}). Is POST /cv/original-preview available?`,
            detail: text.slice(0, 300)
          },
          { status: 502 }
        );
      }
      return NextResponse.json(data, { status: response.status });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[cv-original-preview] proxy fetch failed:", url, msg);
      return NextResponse.json(
        {
          error: "Unable to reach CV original preview backend.",
          detail: msg,
          hint: `Tried ${url}. Start the API (e.g. uvicorn), or fix FASTAPI_BACKEND_URL.`
        },
        { status: 502 }
      );
    }
  }

  if (ext === "pdf") {
    const bytes = Buffer.from(await file.arrayBuffer());
    return NextResponse.json({
      previewType: "pdf",
      previewUrl: `data:application/pdf;base64,${bytes.toString("base64")}`
    });
  }

  return NextResponse.json(
    {
      error: "Original inline preview for DOC/DOCX needs the FastAPI backend endpoint /cv/original-preview."
    },
    { status: 501 }
  );
}
