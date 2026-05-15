import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    command?: string;
    description?: string;
  };

  const backendUrl = process.env.FASTAPI_BACKEND_URL;

  if (backendUrl) {
    try {
      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/jd-clarity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json({ error: "Backend JD analysis service is unavailable." }, { status: 502 });
    }
  }

  const trimmed = payload.description?.trim();
  const summary = trimmed
    ? `Command: ${payload.command}\n\nSummary\n- Focus area: ${trimmed.slice(0, 180)}${trimmed.length > 180 ? "..." : ""}\n\nScore\n- JD clarity: 7.8 / 10\n- Candidate signal: Strong for proactive sourcing\n\nRecommendations\n- Tighten must-have requirements\n- Add location, reporting line, and decision timeline\n- Clarify compensation and interview stages`
    : `Command: ${payload.command}\n\nPaste a job description to generate a fuller analysis.`;

  return NextResponse.json({ result: summary });
}
