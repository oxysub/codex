import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const candidateName = String(formData.get("candidateName") ?? "Candidate");
  const file = formData.get("file");
  const fileName = typeof file === "object" && file && "name" in file ? String(file.name) : `${candidateName}.docx`;

  const backendBase = process.env.FASTAPI_BACKEND_URL?.replace(/\/$/, "");
  if (backendBase) {
    const url = `${backendBase}/cv/format`;
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData
      });
      const text = await response.text();
      let data: unknown;
      try {
        data = JSON.parse(text) as Record<string, unknown>;
      } catch {
        return NextResponse.json(
          {
            error: `CV backend returned non-JSON at ${url} (HTTP ${response.status}). Is the FastAPI app running and does it define POST /cv/format?`,
            detail: text.slice(0, 300)
          },
          { status: 502 }
        );
      }
      return NextResponse.json(data, { status: response.status });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[cv-format] proxy fetch failed:", url, msg);
      return NextResponse.json(
        {
          error: "Unable to reach CV formatting backend.",
          detail: msg,
          hint: `Tried ${url}. Start the API (e.g. uvicorn), or fix FASTAPI_BACKEND_URL. To use the built-in mock instead, remove FASTAPI_BACKEND_URL from .env.local.`
        },
        { status: 502 }
      );
    }
  }

  const previewHtml = `
    <div class="min-h-[720px] bg-[#d6d9de]">
      <div class="flex items-center justify-between bg-[#2b579a] px-5 py-3 text-white">
        <div class="flex items-center gap-3">
          <div class="grid h-8 w-8 place-items-center rounded-[8px] bg-white/15 text-sm font-bold">W</div>
          <div>
            <div class="text-sm font-semibold">${fileName}</div>
            <div class="text-[11px] text-white/70">Word Preview</div>
          </div>
        </div>
        <div class="flex gap-2 text-[11px] font-semibold">
          <div class="rounded-[99px] border border-white/20 px-3 py-1">Edit</div>
          <div class="rounded-[99px] border border-white/20 px-3 py-1">Open</div>
        </div>
      </div>
      <div class="border-b border-[#cfd6e0] bg-[#f5f6f8] px-5 py-2 text-[11px] text-[#445468]">
        File&nbsp;&nbsp;Home&nbsp;&nbsp;Insert&nbsp;&nbsp;Layout&nbsp;&nbsp;Review&nbsp;&nbsp;View
      </div>
      <div class="border-b border-[#d8dde5] bg-[#eef1f5] px-5 py-3 text-[11px] text-[#66758a]">
        Clipboard | Font | Paragraph | Styles | Editing
      </div>
      <div class="flex min-h-[560px] items-start justify-center bg-[#d6d9de] px-6 py-8">
        <div class="word-preview-page w-full max-w-[794px] bg-white px-[72px] py-[64px] shadow-[0_20px_60px_rgba(15,23,42,0.18)]" style="font-family: Calibri, Arial, sans-serif;">
          <h1 style="font-size: 28px; font-weight: 700;">${candidateName}</h1>
          <p style="color:#4b5563; margin-bottom: 24px;">Singapore | +65 5555 1234 | ${candidateName.toLowerCase().replace(/\s+/g, ".")}@email.com | linkedin.com/in/${candidateName.toLowerCase().replace(/\s+/g, "-")}</p>
          <h2 style="font-size: 16px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;">Professional Summary</h2>
          <p>Strategic operator with experience translating complex briefs into structured candidate narratives, clear stakeholder communication, and polished client-ready documentation.</p>
          <h2 style="font-size: 16px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;">Core Competencies</h2>
          <p>Executive Search, Stakeholder Management, Talent Mapping, Interview Design, Reporting, Structured Writing</p>
          <h2 style="font-size: 16px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;">Experience</h2>
          <p><strong>Senior Talent Consultant</strong> | Oxydata Partners | 2022 - Present</p>
          <ul style="padding-left: 18px; margin: 0 0 20px;">
            <li>Led high-clarity candidate presentation workflows for retained and contingent searches.</li>
            <li>Standardized CV formatting outputs into a repeatable, client-facing document structure.</li>
            <li>Partnered with hiring teams to turn ambiguous briefs into actionable scorecards and assessments.</li>
          </ul>
          <h2 style="font-size: 16px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;">Education</h2>
          <p>Bachelor of Business Administration</p>
        </div>
      </div>
      <div class="flex items-center justify-between bg-[#2b579a] px-5 py-2 text-[11px] text-white/80">
        <span>Page 1 of 1</span>
        <span>English (Singapore)</span>
      </div>
    </div>
  `;

  const downloadUrl = `data:application/msword;charset=utf-8,${encodeURIComponent(`Oxydata formatted CV for ${candidateName}`)}`;

  return NextResponse.json({ previewHtml, downloadUrl });
}
