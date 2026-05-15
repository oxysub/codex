import { NextRequest, NextResponse } from "next/server";

const fallbackJobs = [
  { id: "JOB-1842", name: "Senior Data Engineer", client: "Aster Labs" },
  { id: "JOB-1879", name: "Founding Product Designer", client: "Northstar Health" },
  { id: "JOB-1913", name: "Commercial Strategy Lead", client: "Helio Ventures" },
  { id: "JOB-1944", name: "AI Solutions Architect", client: "Peakstack" }
];

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.toLowerCase() ?? "";
  const jobs = fallbackJobs.filter((job) =>
    [job.id, job.name, job.client].some((value) => value.toLowerCase().includes(query))
  );

  return NextResponse.json({ jobs });
}

export async function POST() {
  if (process.env.FASTAPI_BACKEND_URL) {
    try {
      const response = await fetch(`${process.env.FASTAPI_BACKEND_URL.replace(/\/$/, "")}/rubric/jobs/refresh`, {
        method: "POST"
      });
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json({ error: "Unable to reach backend refresh endpoint." }, { status: 502 });
    }
  }

  return NextResponse.json({ message: "Fallback job cache refreshed from local mock data." });
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as { jobId?: string };

  if (process.env.FASTAPI_BACKEND_URL) {
    try {
      const response = await fetch(`${process.env.FASTAPI_BACKEND_URL.replace(/\/$/, "")}/rubric/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json({ error: "Unable to reach rubric generation endpoint." }, { status: 502 });
    }
  }

  return NextResponse.json({
    rubric: `Rubric for ${payload.jobId}\n\n1. Technical depth: 30%\n2. Stakeholder communication: 20%\n3. Domain experience: 20%\n4. Problem solving: 15%\n5. Leadership signal: 15%`
  });
}
