import { execFile } from "child_process";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import { promisify } from "util";
import { NextRequest, NextResponse } from "next/server";

const execFileAsync = promisify(execFile);

const fallbackJobs = [
  { id: "JOB-1842", name: "Senior Data Engineer", client: "Aster Labs" },
  { id: "JOB-1879", name: "Founding Product Designer", client: "Northstar Health" },
  { id: "JOB-1913", name: "Commercial Strategy Lead", client: "Helio Ventures" },
  { id: "JOB-1944", name: "AI Solutions Architect", client: "Peakstack" }
];

/** Hiring pipeline / Job table — https://airtable.com/apppIY4F5XUKJzjuW/tblCV6w4fGex9VgzK/ */
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID ?? "apppIY4F5XUKJzjuW";
const JOB_TABLE_ID = process.env.AIRTABLE_TABLE_ID ?? "tblCV6w4fGex9VgzK";

const FIELD_JOB_ID = process.env.AIRTABLE_FIELD_JOB_ID ?? "job_id";
const FIELD_JOB_NAME = process.env.AIRTABLE_FIELD_JOB_NAME ?? "job_name";
const FIELD_CLIENT_NAME = process.env.AIRTABLE_FIELD_CLIENT_NAME ?? "client_name";
const FIELD_RUBRIC = process.env.AIRTABLE_FIELD_RUBRIC ?? "rubric_json";
const FIELD_JD = process.env.AIRTABLE_FIELD_JD ?? "jd";
const FIELD_RUBRIC_STATUS = process.env.AIRTABLE_FIELD_RUBRIC_STATUS ?? "rubric_status";

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

type RubricJson = {
  metadata?: {
    rubric_version?: number;
    weight_last_modified?: string;
    weight_last_modified_by?: string;
  };
  requirements?: {
    must_have?: Array<{ id: string; weight: number; [key: string]: unknown }>;
    nice_to_have?: Array<{ id: string; [key: string]: unknown }>;
  };
  compliance_requirements?: Array<{ id: string; item: string; required: boolean }>;
  gates?: Array<{ id: string; [key: string]: unknown }>;
  scoring?: Record<string, unknown>;
};

function airtableHeaders(): HeadersInit {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) {
    throw new Error("AIRTABLE_TOKEN is not configured");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

function listJobsFormula(): string {
  return `NOT({${FIELD_JOB_ID}}='')`;
}

function jobIdFormula(jobId: string): string {
  const trimmed = jobId.trim();
  if (/^\d+$/.test(trimmed)) {
    return `{${FIELD_JOB_ID}}=${trimmed}`;
  }
  return `{${FIELD_JOB_ID}}='${trimmed.replace(/'/g, "\\'")}'`;
}

function airtableFieldNames(extra: string[] = []): string[] {
  return [FIELD_JOB_ID, FIELD_JOB_NAME, FIELD_CLIENT_NAME, FIELD_RUBRIC, FIELD_JD, FIELD_RUBRIC_STATUS, ...extra];
}

function parseRubricStatus(raw: unknown): "draft" | "active" | null {
  if (raw === "draft" || raw === "active") return raw;
  if (typeof raw === "string") {
    const v = raw.trim().toLowerCase();
    if (v === "draft" || v === "active") return v;
  }
  return null;
}

function fieldText(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "string") return raw;
  return String(raw);
}

function genrubricPaths() {
  const rubricDir = process.env.GENRUBRIC_DIR ?? path.join(process.cwd(), "scripts", "rubric");
  const venvPython = path.join(rubricDir, ".venv", "bin", "python3");
  const python =
    process.env.GENRUBRIC_PYTHON ?? (existsSync(venvPython) ? venvPython : "python3");
  const script = path.join(rubricDir, "genrubric.py");
  const outDir = process.env.RUBRIC_OUTPUT_DIR
    ? path.isAbsolute(process.env.RUBRIC_OUTPUT_DIR)
      ? process.env.RUBRIC_OUTPUT_DIR
      : path.join(rubricDir, process.env.RUBRIC_OUTPUT_DIR)
    : path.join(rubricDir, "data", "rubrics");
  return { rubricDir, python, script, outDir };
}

async function runGenrubricCli(jobId: string): Promise<string> {
  const { rubricDir, python, script, outDir } = genrubricPaths();
  await execFileAsync(python, [script, jobId], {
    cwd: rubricDir,
    env: process.env as NodeJS.ProcessEnv,
    maxBuffer: 10 * 1024 * 1024
  });
  const outPath = path.join(outDir, `rubric_${jobId}.json`);
  return readFile(outPath, "utf8");
}

async function generateRubricJson(jobId: string, jdText: string): Promise<string> {
  const { script } = genrubricPaths();
  const useLocalGenrubric =
    process.env.RUBRIC_GENERATE_VIA !== "fastapi" && existsSync(script);

  // api-placeholder (make api-dev) serves CV Formatter + Job Clarity only — no /generate-rubric.
  // When scripts/rubric/genrubric.py exists, generate via CLI and keep FASTAPI_BACKEND_URL for other tabs.
  if (useLocalGenrubric) {
    return runGenrubricCli(jobId);
  }

  const base = process.env.FASTAPI_BACKEND_URL?.replace(/\/$/, "");
  if (base) {
    try {
      const response = await fetch(`${base}/generate-rubric`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, jd_text: jdText })
      });
      if (response.ok) {
        const data = (await response.json()) as { rubric?: string | RubricJson; rubric_json?: string };
        if (typeof data.rubric === "string") return data.rubric;
        if (typeof data.rubric_json === "string") return data.rubric_json;
        if (data.rubric && typeof data.rubric === "object") return JSON.stringify(data.rubric);
        throw new Error("Backend returned no rubric payload");
      }
      const detail = await response.text();
      throw new Error(detail || `Backend generate failed (${response.status})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (existsSync(script)) {
        return runGenrubricCli(jobId);
      }
      throw error instanceof Error ? error : new Error(message);
    }
  }

  if (existsSync(script)) {
    return runGenrubricCli(jobId);
  }

  return JSON.stringify(mockRubric(jobId));
}

async function handleRubricGenerate(body: { job_id: string; jd_text?: string; jd_markdown?: string }) {
  const jobId = body.job_id.trim();
  if (!jobId) {
    return NextResponse.json({ detail: "job_id is required" }, { status: 400 });
  }

  try {
    const records = await fetchAirtableRecords(jobIdFormula(jobId), airtableFieldNames());
    const record = records[0];
    if (!record) {
      return NextResponse.json({ detail: "Job not found" }, { status: 404 });
    }

    const jdFromRecord = fieldText(record.fields[FIELD_JD]);
    const jdText = (body.jd_text?.trim() || jdFromRecord).trim();
    if (!jdText) {
      return NextResponse.json({ detail: "Job description is required to generate a rubric" }, { status: 422 });
    }

    const rubricRaw = await generateRubricJson(jobId, jdText);
    const cleaned = rubricRaw.replace(/\\_/g, "_");
    const parsed = JSON.parse(cleaned) as RubricJson;
    const rubric = normalizeRubricForUi(parsed as RubricJson & Record<string, unknown>);

    const jdMarkdown = body.jd_markdown?.trim();
    const jdForAirtable =
      jdMarkdown && jdMarkdown.length > 0
        ? jdMarkdown.endsWith("\n")
          ? jdMarkdown
          : `${jdMarkdown}\n`
        : null;

    await patchAirtableRecord(record.id, {
      [FIELD_RUBRIC]: rubricFieldToString(rubric),
      [FIELD_RUBRIC_STATUS]: "draft",
      ...(jdForAirtable ? { [FIELD_JD]: jdForAirtable } : body.jd_text?.trim() ? { [FIELD_JD]: jdText } : {})
    });

    return NextResponse.json({
      job_id: String(record.fields[FIELD_JOB_ID] ?? jobId),
      job_name: String(record.fields[FIELD_JOB_NAME] ?? ""),
      client_name: String(record.fields[FIELD_CLIENT_NAME] ?? ""),
      rubric_status: "draft" as const,
      rubric
    });
  } catch (error) {
    if (!process.env.AIRTABLE_TOKEN) {
      const rubric = mockRubric(jobId);
      return NextResponse.json({
        job_id: jobId,
        job_name: `Mock role for ${jobId}`,
        client_name: "Demo Client",
        rubric_status: "draft" as const,
        rubric
      });
    }
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Failed to generate rubric" },
      { status: 502 }
    );
  }
}

async function handleJdUpdate(body: { job_id: string; jd_text: string }) {
  const jobId = body.job_id.trim();
  const jdMarkdown = body.jd_text ?? "";
  if (!jobId) {
    return NextResponse.json({ detail: "job_id is required" }, { status: 400 });
  }
  if (!jdMarkdown.trim()) {
    return NextResponse.json({ detail: "jd_text is required" }, { status: 400 });
  }

  try {
    const records = await fetchAirtableRecords(jobIdFormula(jobId), airtableFieldNames());
    const record = records[0];
    if (!record) {
      return NextResponse.json({ detail: "Job not found" }, { status: 404 });
    }

    const jdForAirtable = jdMarkdown.endsWith("\n") ? jdMarkdown : `${jdMarkdown}\n`;
    await patchAirtableRecord(record.id, { [FIELD_JD]: jdForAirtable });

    return NextResponse.json({
      job_id: String(record.fields[FIELD_JOB_ID] ?? jobId),
      jd_text: jdForAirtable,
      saved: true
    });
  } catch (error) {
    if (!process.env.AIRTABLE_TOKEN) {
      return NextResponse.json({ job_id: jobId, jd_text: jdMarkdown, saved: true });
    }
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Failed to update job description" },
      { status: 502 }
    );
  }
}

async function handleRubricStatus(body: { job_id: string; rubric_status: "draft" | "active" }) {
  const jobId = body.job_id.trim();
  const status = body.rubric_status;
  if (!jobId || (status !== "draft" && status !== "active")) {
    return NextResponse.json({ detail: "job_id and rubric_status (draft|active) are required" }, { status: 400 });
  }

  try {
    const records = await fetchAirtableRecords(jobIdFormula(jobId), airtableFieldNames([FIELD_RUBRIC_STATUS]));
    const record = records[0];
    if (!record) {
      return NextResponse.json({ detail: "Job not found" }, { status: 404 });
    }

    await patchAirtableRecord(record.id, { [FIELD_RUBRIC_STATUS]: status });

    return NextResponse.json({ job_id: jobId, rubric_status: status });
  } catch (error) {
    if (!process.env.AIRTABLE_TOKEN) {
      return NextResponse.json({ job_id: jobId, rubric_status: status });
    }
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Failed to update rubric status" },
      { status: 502 }
    );
  }
}

function parseRubricField(raw: unknown): RubricJson | null {
  if (raw == null || raw === "") {
    return null;
  }
  let parsed: RubricJson | null = null;
  if (typeof raw === "object") {
    parsed = raw as RubricJson;
  } else if (typeof raw === "string") {
    try {
      const cleaned = raw.replace(/\\_/g, "_");
      parsed = JSON.parse(cleaned) as RubricJson;
    } catch {
      return null;
    }
  }
  return parsed ? normalizeRubricForUi(parsed) : null;
}

/** Map hiring-pipeline rubric_json shape to what JobRubric UI expects */
function normalizeRubricForUi(raw: RubricJson & Record<string, unknown>): RubricJson {
  const rootVersion = raw.rubric_version;
  const metadata = {
    ...raw.metadata,
    rubric_version:
      raw.metadata?.rubric_version ??
      (rootVersion != null ? Number.parseFloat(String(rootVersion)) || 1 : 1),
    weight_last_modified: raw.metadata?.weight_last_modified,
    weight_last_modified_by: raw.metadata?.weight_last_modified_by
  };

  const mustHave = (raw.requirements?.must_have ?? []).map((item) => {
    const row = item as { tier?: string; importance_tier?: string };
    return {
      ...item,
      tier: row.tier ?? row.importance_tier?.toLowerCase() ?? "foundational"
    };
  });

  const scaleRaw = raw.scoring?.scale;
  let scale: Array<{ score: number; label: string }> | undefined;
  if (Array.isArray(scaleRaw)) {
    scale = scaleRaw as Array<{ score: number; label: string }>;
  } else if (scaleRaw && typeof scaleRaw === "object") {
    scale = Object.entries(scaleRaw as Record<string, string>)
      .map(([score, label]) => ({ score: Number(score), label }))
      .sort((a, b) => a.score - b.score);
  }

  return {
    ...raw,
    metadata,
    requirements: raw.requirements
      ? {
          ...raw.requirements,
          must_have: mustHave
        }
      : raw.requirements,
    scoring: raw.scoring
      ? {
          ...raw.scoring,
          scale
        }
      : raw.scoring
  };
}

function rubricFieldToString(rubric: RubricJson): string {
  return JSON.stringify(rubric);
}

async function fetchAirtableRecords(filterFormula: string, fields: string[]): Promise<AirtableRecord[]> {
  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams();
    params.set("filterByFormula", filterFormula);
    for (const field of fields) {
      params.append("fields[]", field);
    }
    if (offset) {
      params.set("offset", offset);
    }

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${JOB_TABLE_ID}?${params.toString()}`;
    const response = await fetch(url, { headers: airtableHeaders(), cache: "no-store" });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Airtable request failed (${response.status}): ${body}`);
    }

    const data = (await response.json()) as { records?: AirtableRecord[]; offset?: string };
    records.push(...(data.records ?? []));
    offset = data.offset;
  } while (offset);

  return records;
}

async function patchAirtableRecord(recordId: string, fields: Record<string, unknown>): Promise<void> {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${JOB_TABLE_ID}/${recordId}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: airtableHeaders(),
    body: JSON.stringify({ fields })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Airtable patch failed (${response.status}): ${body}`);
  }
}

function mockRubric(jobId: string): RubricJson {
  return {
    metadata: { rubric_version: 1 },
    requirements: {
      must_have: [
        {
          id: "MH1",
          weight: 40,
          requirement: "Production-grade backend engineering",
          tier: "critical",
          evidence_signals: ["Led API design", "Owned services at scale"],
          negative_signals: ["Only coursework projects"],
          ontology: ["Node.js", "PostgreSQL"],
          category: "Technical"
        },
        {
          id: "MH2",
          weight: 35,
          requirement: "Stakeholder communication",
          tier: "important",
          evidence_signals: ["Presented to executives"],
          negative_signals: [],
          ontology: [],
          category: "Communication"
        },
        {
          id: "MH3",
          weight: 25,
          requirement: "Domain experience in B2B SaaS",
          tier: "foundational",
          evidence_signals: ["Shipped B2B features"],
          negative_signals: ["Consumer-only background"],
          ontology: ["SaaS"],
          category: "Domain"
        }
      ],
      nice_to_have: [
        { id: "NH1", weight: 0, skill: "Kubernetes exposure" },
        { id: "NH2", weight: 0, skill: "People management" }
      ]
    },
    compliance_requirements: [
      { id: "C1", item: "Eligible to work in Malaysia", required: true },
      { id: "C2", item: "Willing to work hybrid in KL", required: false }
    ],
    gates: [{ id: "G1", description: "Failed integrity screen" }],
    scoring: {
      pass_threshold: "70",
      score_mode: "Weighted must-have",
      nice_to_have_mode: "Flag only",
      floor_rule: "Any critical tier below 3 → fail",
      bias_guardrails: "Score evidence only. Ignore university prestige, age, and photo cues.",
      scale: [
        { score: 1, label: "No evidence" },
        { score: 2, label: "Weak" },
        { score: 3, label: "Adequate" },
        { score: 4, label: "Strong" },
        { score: 5, label: "Exceptional" },
        { score: 0, label: "N/A" }
      ]
    }
  };
}

function mockJobList() {
  return [
    {
      job_id: "JOB-1842",
      job_name: "Senior Data Engineer",
      client_name: "Aster Labs",
      has_rubric: true
    },
    {
      job_id: "JOB-1879",
      job_name: "Founding Product Designer",
      client_name: "Northstar Health",
      has_rubric: false
    },
    {
      job_id: "JOB-1913",
      job_name: "Commercial Strategy Lead",
      client_name: "Helio Ventures",
      has_rubric: true
    }
  ].sort((a, b) => a.job_name.localeCompare(b.job_name));
}

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("job_id");
  const field = request.nextUrl.searchParams.get("field");
  const legacyQuery = request.nextUrl.searchParams.get("query");

  if (jobId) {
    try {
      const records = await fetchAirtableRecords(jobIdFormula(jobId), airtableFieldNames());
      const record = records[0];
      if (!record) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      const job_id = String(record.fields[FIELD_JOB_ID] ?? jobId);
      const job_name = String(record.fields[FIELD_JOB_NAME] ?? "");
      const client_name = String(record.fields[FIELD_CLIENT_NAME] ?? "");
      const rubric_status = parseRubricStatus(record.fields[FIELD_RUBRIC_STATUS]);

      if (field === "jd_text") {
        return NextResponse.json({
          job_id,
          job_name,
          client_name,
          jd_text: fieldText(record.fields[FIELD_JD])
        });
      }

      const rubric = parseRubricField(record.fields[FIELD_RUBRIC]);
      if (!rubric) {
        return NextResponse.json({ error: "Rubric not found for this job" }, { status: 404 });
      }

      return NextResponse.json({
        job_id,
        job_name,
        client_name,
        airtable_record_id: record.id,
        rubric_status: rubric_status ?? "active",
        rubric
      });
    } catch (error) {
      if (process.env.AIRTABLE_TOKEN) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Failed to load rubric" },
          { status: 502 }
        );
      }

      if (field === "jd_text") {
        return NextResponse.json({
          job_id: jobId,
          job_name: `Mock role for ${jobId}`,
          client_name: "Demo Client",
          jd_text: "Sample job description for local development."
        });
      }

      const rubric = mockRubric(jobId);
      return NextResponse.json({
        job_id: jobId,
        job_name: `Mock role for ${jobId}`,
        client_name: "Demo Client",
        airtable_record_id: "mock",
        rubric_status: "active" as const,
        rubric
      });
    }
  }

  if (legacyQuery !== null) {
    const query = legacyQuery.toLowerCase();
    const jobs = fallbackJobs.filter((job) =>
      [job.id, job.name, job.client].some((value) => value.toLowerCase().includes(query))
    );
    return NextResponse.json({ jobs });
  }

  try {
    const records = await fetchAirtableRecords(listJobsFormula(), airtableFieldNames());

    const jobs = records
      .map((record) => {
        const id = String(record.fields[FIELD_JOB_ID] ?? "").trim();
        const name = String(record.fields[FIELD_JOB_NAME] ?? "").trim();
        const client = String(record.fields[FIELD_CLIENT_NAME] ?? "").trim();
        const rubricRaw = record.fields[FIELD_RUBRIC];
        const hasRubric =
          typeof rubricRaw === "string"
            ? rubricRaw.trim().length > 0
            : rubricRaw != null && rubricRaw !== "";

        return {
          job_id: id,
          job_name: name,
          client_name: client,
          has_rubric: hasRubric
        };
      })
      .filter((j) => j.job_id)
      .sort((a, b) => a.job_name.localeCompare(b.job_name));

    return NextResponse.json({ jobs });
  } catch (error) {
    if (process.env.AIRTABLE_TOKEN) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to load jobs" },
        { status: 502 }
      );
    }

    return NextResponse.json({ jobs: mockJobList() });
  }
}

export async function PATCH(request: Request) {
  let body: {
    action?: string;
    job_id?: string;
    jd_text?: string;
    weights?: Record<string, number>;
    updated_by?: string;
    rubric_status?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action === "update_jd" && body.job_id?.trim()) {
    return handleJdUpdate({
      job_id: body.job_id.trim(),
      jd_text: typeof body.jd_text === "string" ? body.jd_text : ""
    });
  }

  const status = parseRubricStatus(body.rubric_status);
  if (status && body.job_id?.trim()) {
    return handleRubricStatus({ job_id: body.job_id.trim(), rubric_status: status });
  }

  const jobId = body.job_id?.trim();
  const weights = body.weights;
  const updatedBy = body.updated_by?.trim() || "recruiter";

  if (!jobId || !weights || typeof weights !== "object") {
    return NextResponse.json({ error: "job_id and weights are required" }, { status: 400 });
  }

  const weightEntries = Object.entries(weights);
  if (weightEntries.length < 2) {
    return NextResponse.json({ error: "At least 2 criteria are required" }, { status: 422 });
  }

  for (const [, value] of weightEntries) {
    if (!Number.isInteger(value) || value <= 0) {
      return NextResponse.json({ error: "All weights must be positive integers" }, { status: 422 });
    }
  }

  const sum = weightEntries.reduce((acc, [, v]) => acc + v, 0);
  if (sum !== 100) {
    return NextResponse.json({ error: `Weights must sum to 100 (got ${sum})` }, { status: 422 });
  }

  try {
    const records = await fetchAirtableRecords(jobIdFormula(jobId), airtableFieldNames());
    const record = records[0];
    if (!record) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const rubric = parseRubricField(record.fields[FIELD_RUBRIC]);
    if (!rubric?.requirements?.must_have?.length) {
      return NextResponse.json({ error: "Rubric has no must-have requirements" }, { status: 404 });
    }

    const mustHave = rubric.requirements.must_have;
    const mustHaveIds = new Set(mustHave.map((item) => item.id));

    for (const id of Object.keys(weights)) {
      if (!mustHaveIds.has(id)) {
        return NextResponse.json({ error: `Unknown requirement id: ${id}` }, { status: 422 });
      }
    }

    for (const item of mustHave) {
      if (!(item.id in weights)) {
        return NextResponse.json({ error: `Missing weight for ${item.id}` }, { status: 422 });
      }
    }

    const nextRubric: RubricJson = {
      ...rubric,
      metadata: {
        ...rubric.metadata,
        rubric_version: (rubric.metadata?.rubric_version ?? 1) + 1,
        weight_last_modified: new Date().toISOString(),
        weight_last_modified_by: updatedBy
      },
      requirements: {
        ...rubric.requirements,
        must_have: mustHave.map((item) => ({
          ...item,
          weight: weights[item.id]!
        }))
      }
    };

    await patchAirtableRecord(record.id, { [FIELD_RUBRIC]: rubricFieldToString(nextRubric) });

    return NextResponse.json({
      status: "accepted",
      job_id: jobId,
      rubric_version: nextRubric.metadata?.rubric_version
    });
  } catch (error) {
    if (!process.env.AIRTABLE_TOKEN) {
      return NextResponse.json({
        status: "accepted",
        job_id: jobId,
        rubric_version: 2
      });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save weights" },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as { job_id?: string; jd_text?: string; jd_markdown?: string };
      if (body.job_id?.trim()) {
        return handleRubricGenerate({
          job_id: body.job_id.trim(),
          jd_text: typeof body.jd_text === "string" ? body.jd_text : undefined,
          jd_markdown: typeof body.jd_markdown === "string" ? body.jd_markdown : undefined
        });
      }
    } catch {
      return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
    }
  }

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
