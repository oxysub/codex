import { NextResponse } from 'next/server';

const MOCK_JOBS = [
  { id: 'TT20001', name: 'Senior Software Engineer', client: 'Petronas Digital Sdn Bhd' },
  { id: 'TT20002', name: 'Data Analyst', client: 'Maybank' },
  { id: 'TT20003', name: 'Product Manager', client: 'Grab' },
];

export async function GET() {
  return NextResponse.json({ jobs: MOCK_JOBS });
}
