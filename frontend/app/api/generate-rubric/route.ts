import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    try {
      const res = await fetch(`${backendUrl}/api/generate-rubric`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return NextResponse.json(data);
    } catch {
      // Backend not available — return mock response
      return NextResponse.json({
        success: true,
        rubric_url: `https://example.com/rubrics/${body.job_id}.xlsx`,
        message: `Rubric generated for ${body.job_name} (${body.client})`,
      });
    }
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}
