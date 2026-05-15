"use client";

import { useWorkspaceTheme, WorkspaceThemeToggle } from "@/components/workspace-theme";
import JdRichTextEditor from "@/components/job-rubric/JdRichTextEditor";
import {
  formatForAirtableRichText,
  htmlToAirtableRichText,
  htmlToPlainText,
  jdContentToHtml
} from "@/components/job-rubric/jdContent";
import { AlertTriangle, ChevronDown, ChevronLeft, Clock, Minus, Plus, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

type Screen = "select" | "view" | "edit" | "schema" | "generate";
type RubricStatus = "draft" | "active";
type SchemaOrigin = "select" | "view";

type JobListItem = {
  job_id: string;
  job_name: string;
  client_name: string;
  has_rubric: boolean;
};

type SelectedJob = {
  job_id: string;
  job_name: string;
  client_name: string;
};

type MustHaveItem = {
  id: string;
  weight: number;
  requirement?: string;
  text?: string;
  name?: string;
  tier?: string;
  evidence_signals?: string[];
  negative_signals?: string[];
  category?: string;
};

type NiceToHaveItem = {
  id: string;
  weight?: number;
  skill?: string;
  text?: string;
  requirement?: string;
};

type RubricData = {
  metadata?: {
    rubric_version?: number;
    weight_last_modified?: string;
    weight_last_modified_by?: string;
  };
  requirements?: {
    must_have?: MustHaveItem[];
    nice_to_have?: NiceToHaveItem[];
  };
  compliance_requirements?: string[];
  gates?: Array<{ id: string; item?: string; description?: string; label?: string }>;
  semantic_ontology?: {
    normalized_terms?: string[];
    semantic_threshold_defaults?: {
      highest_confidence?: string | number;
      high_confidence?: string | number;
      medium_confidence?: string | number;
      min_acceptable?: string | number;
    };
  };
  bias_guardrails?: {
    enforcement?: string;
    protected_attributes?: string[];
  };
  scoring?: {
    pass_threshold?: string | number;
    score_mode?: string;
    nice_to_have_mode?: string;
    floor_rule?: string;
    scale?: Record<string, string>;
  };
};

const BADGE_STYLES = `
.jr-badge-mh { background: #FAECE7; color: #993C1D; }
.jr-badge-nh { background: #E1F5EE; color: #0F6E56; }
.jr-badge-comp { background: #E6F1FB; color: #185FA5; }
.jr-badge-gate { background: #FAEEDA; color: #854F0B; }
.jr-tag-ev { background: #E1F5EE; color: #0F6E56; }
.jr-tag-neg { background: #FCEBEB; color: #A32D2D; }
.jr-tag-ont { background: #EEEDFE; color: #534AB7; }
.jr-tier-critical { background: #FCEBEB; color: #A32D2D; }
.jr-tier-important { background: #FAEEDA; color: #854F0B; }
.jr-tier-foundational { background: #EAF3DE; color: #3B6D11; }
.jr-orange-bar { background: #D85A30; }
.opal-workspace-theme[data-theme="light"] .jr-badge-mh { background: #FDE8DC; color: #7C2D12; }
.opal-workspace-theme[data-theme="light"] .jr-badge-nh { background: #D1FAE5; color: #065F46; }
.opal-workspace-theme[data-theme="light"] .jr-badge-comp { background: #DBEAFE; color: #1E40AF; }
.opal-workspace-theme[data-theme="light"] .jr-badge-gate { background: #FEF3C7; color: #92400E; }
.opal-workspace-theme[data-theme="light"] .jr-tag-ev { background: #D1FAE5; color: #065F46; }
.opal-workspace-theme[data-theme="light"] .jr-tag-neg { background: #FEE2E2; color: #991B1B; }
.opal-workspace-theme[data-theme="light"] .jr-tag-ont { background: #EDE9FE; color: #5B21B6; }
.opal-workspace-theme[data-theme="light"] .jr-tier-critical { background: #FEE2E2; color: #991B1B; }
.opal-workspace-theme[data-theme="light"] .jr-tier-important { background: #FEF3C7; color: #92400E; }
.opal-workspace-theme[data-theme="light"] .jr-tier-foundational { background: #DCFCE7; color: #166534; }
`;

function mustHaveLabel(item: MustHaveItem): string {
  return item.requirement ?? item.text ?? item.name ?? item.id;
}

function niceToHaveLabel(item: NiceToHaveItem): string {
  return item.skill ?? item.text ?? item.requirement ?? item.id;
}

function gateLabel(item: { item?: string; description?: string; label?: string; id: string }): string {
  return item.item ?? item.description ?? item.label ?? item.id;
}

function tierClass(tier?: string): string {
  const key = (tier ?? "foundational").toLowerCase();
  if (key === "critical") return "jr-tier-critical";
  if (key === "important") return "jr-tier-important";
  return "jr-tier-foundational";
}

function formatMetaDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function TotalPill({ sum }: { sum: number }) {
  const isValid = sum === 100;
  const over = sum > 100;
  const pillClass = isValid
    ? "border border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
    : over
      ? "jr-tag-neg rounded-full border px-3 py-1 text-xs font-mono font-semibold"
      : "rounded-full border px-3 py-1 text-xs font-mono font-semibold";
  const pillStyle = isValid || over ? undefined : ({ borderColor: "var(--warning-border)", background: "var(--warning-bg)", color: "var(--warning)" } as const);

  return (
    <span className={pillClass} style={pillStyle}>
      Total {sum}/100%
    </span>
  );
}

function CollapsibleSection({
  label,
  defaultOpen,
  children
}: {
  label: string;
  defaultOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-[12px] border border-white/[0.07] bg-[var(--surface)]" style={{ borderColor: "var(--border)" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/[0.03]"
      >
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? <div className="border-t border-white/[0.07] px-4 py-3" style={{ borderColor: "var(--border)" }}>{children}</div> : null}
    </section>
  );
}

function highlightJson(json: string): string {
  return json.replace(
    /("(?:\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "color: var(--cyan);";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "color: var(--text);";
        } else {
          cls = "color: #86efac;";
        }
      } else if (/true|false/.test(match)) {
        cls = "color: #f97316;";
      } else if (/null/.test(match)) {
        cls = "color: var(--muted);";
      }
      return `<span style="${cls}">${match}</span>`;
    }
  );
}

function TagRow({ label, tags, tagClass }: { label: string; tags: string[]; tagClass: string }) {
  if (!tags.length) return null;
  return (
    <div className="mt-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tagClass}`}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function JobRubric() {
  const pathname = usePathname();
  const isStandaloneRoute = pathname === "/job-rubric";
  const { theme, persistTheme } = useWorkspaceTheme();

  const [screen, setScreen] = useState<Screen>("select");
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [rubric, setRubric] = useState<RubricData | null>(null);
  const [originalRubric, setOriginalRubric] = useState<RubricData | null>(null);
  const [selectedJob, setSelectedJob] = useState<SelectedJob | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingRubric, setLoadingRubric] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDiscardWarning, setShowDiscardWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedMustHave, setExpandedMustHave] = useState<Record<string, boolean>>({});
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [schemaOrigin, setSchemaOrigin] = useState<SchemaOrigin>("select");
  const [copied, setCopied] = useState(false);
  const [rubricStatus, setRubricStatus] = useState<RubricStatus | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [jdHtml, setJdHtml] = useState("");
  const [jdText, setJdText] = useState("");
  const [loadingJd, setLoadingJd] = useState(false);
  const [jdSavedMarkdown, setJdSavedMarkdown] = useState("");
  const [updatingJd, setUpdatingJd] = useState(false);
  const [jdUpdateError, setJdUpdateError] = useState<string | null>(null);
  const [jdUpdateSuccess, setJdUpdateSuccess] = useState(false);
  const [showRegenerateWarning, setShowRegenerateWarning] = useState(false);

  const mustHave = rubric?.requirements?.must_have ?? [];
  const niceToHave = rubric?.requirements?.nice_to_have ?? [];

  const mustHaveSum = mustHave.reduce((a, b) => a + (b.weight ?? 0), 0);
  const isValid = mustHaveSum === 100;

  const isDirty = useMemo(() => {
    const current = mustHave.map((i) => ({ id: i.id, weight: i.weight }));
    const original = (originalRubric?.requirements?.must_have ?? []).map((i) => ({ id: i.id, weight: i.weight }));
    return JSON.stringify(current) !== JSON.stringify(original);
  }, [mustHave, originalRubric]);

  const filteredJobs = useMemo(() => {
    const q = jobSearchQuery.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((job) => {
      const name = job.job_name.toLowerCase();
      const client = job.client_name.toLowerCase();
      const id = job.job_id.toLowerCase();
      return name.includes(q) || client.includes(q) || id.includes(q);
    });
  }, [jobs, jobSearchQuery]);

  const wrapClass = isStandaloneRoute
    ? "flex min-h-screen min-h-0 flex-col"
    : "flex min-h-0 flex-1 flex-col overflow-hidden";

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    setError(null);
    try {
      const res = await fetch("/api/rubric");
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Failed to load jobs");
      }
      const data = (await res.json()) as { jobs?: JobListItem[] };
      setJobs(data.jobs ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load jobs");
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  const loadRubric = useCallback(async (jobId: string) => {
    setLoadingRubric(true);
    setError(null);
    try {
      const res = await fetch(`/api/rubric?job_id=${encodeURIComponent(jobId)}`);
      if (!res.ok) {
        setError("Failed to load rubric");
        setLoadingRubric(false);
        return;
      }
      const data = (await res.json()) as {
        job_id: string;
        job_name: string;
        client_name: string;
        rubric: RubricData;
        rubric_status?: RubricStatus;
      };
      setRubric(data.rubric);
      setOriginalRubric(JSON.parse(JSON.stringify(data.rubric)) as RubricData);
      setRubricStatus(data.rubric_status ?? null);
      console.log("[JobRubric] loaded rubric", {
        job_id: data.job_id,
        job_name: data.job_name,
        client_name: data.client_name,
        rubric: data.rubric,
        first_must_have: data.rubric?.requirements?.must_have?.[0]
      });
      setSelectedJob({ job_id: data.job_id, job_name: data.job_name, client_name: data.client_name });
      const expanded: Record<string, boolean> = {};
      for (const item of data.rubric.requirements?.must_have ?? []) {
        expanded[item.id] = true;
      }
      setExpandedMustHave(expanded);
      setScreen("view");
    } catch {
      setError("Failed to load rubric");
    } finally {
      setLoadingRubric(false);
    }
  }, []);

  const applyJdContent = useCallback((raw: string) => {
    const trimmed = raw.trim();
    setJdHtml(jdContentToHtml(trimmed));
    setJdText(/<[a-z][\s\S]*>/i.test(trimmed) ? htmlToPlainText(trimmed) : trimmed);
    setJdSavedMarkdown(trimmed);
    setJdUpdateSuccess(false);
    setJdUpdateError(null);
  }, []);

  const jdDirty = useMemo(() => {
    if (!jdHtml.trim()) return false;
    const current = formatForAirtableRichText(htmlToAirtableRichText(jdHtml));
    const saved = formatForAirtableRichText(jdSavedMarkdown);
    return current !== saved;
  }, [jdHtml, jdSavedMarkdown]);

  const onJdEditorChange = useCallback((html: string, plainText: string) => {
    setJdHtml(html);
    setJdText(plainText);
    setJdUpdateSuccess(false);
  }, []);

  const prefillJdForJob = useCallback(
    async (jobId: string) => {
      setJdHtml("");
      setJdText("");
      setLoadingJd(true);
      try {
        const res = await fetch(`/api/rubric?job_id=${encodeURIComponent(jobId)}&field=jd_text`);
        if (res.ok) {
          const data = (await res.json()) as { jd_text?: string };
          applyJdContent(data.jd_text ?? "");
        }
      } catch {
        /* JD prefill is optional */
      } finally {
        setLoadingJd(false);
      }
    },
    [applyJdContent]
  );

  const openGenerateScreen = useCallback(
    async (job: JobListItem) => {
      setSelectedJob({ job_id: job.job_id, job_name: job.job_name, client_name: job.client_name });
      setGenerateError(null);
      setScreen("generate");
      await prefillJdForJob(job.job_id);
    },
    [prefillJdForJob]
  );

  const openGenerateFromView = useCallback(async () => {
    if (!selectedJob) return;
    setGenerateError(null);
    setScreen("generate");
    await prefillJdForJob(selectedJob.job_id);
  }, [selectedJob, prefillJdForJob]);

  const handleRegenerate = useCallback(() => {
    if (rubricStatus === "active") {
      setShowRegenerateWarning(true);
    } else {
      void openGenerateFromView();
    }
  }, [rubricStatus, openGenerateFromView]);

  const handleUpdateJd = useCallback(async () => {
    if (!selectedJob || !jdHtml.trim()) return;
    setUpdatingJd(true);
    setJdUpdateError(null);
    setJdUpdateSuccess(false);
    try {
      const jdMarkdown = formatForAirtableRichText(htmlToAirtableRichText(jdHtml));
      const res = await fetch("/api/rubric", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_jd",
          job_id: selectedJob.job_id,
          jd_text: jdMarkdown
        })
      });
      if (!res.ok) {
        const e = (await res.json().catch(() => ({}))) as { detail?: string; error?: string };
        throw new Error(e.detail ?? e.error ?? `HTTP ${res.status}`);
      }
      setJdSavedMarkdown(jdMarkdown.trimEnd());
      setJdUpdateSuccess(true);
    } catch (e) {
      setJdUpdateError(e instanceof Error ? e.message : "Failed to update job description");
    } finally {
      setUpdatingJd(false);
    }
  }, [selectedJob, jdHtml]);

  const handleGenerate = useCallback(async () => {
    if (!selectedJob) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      const jdMarkdown = formatForAirtableRichText(htmlToAirtableRichText(jdHtml));
      const res = await fetch("/api/rubric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: selectedJob.job_id,
          jd_text: jdText,
          jd_markdown: jdMarkdown
        })
      });
      if (!res.ok) {
        const e = (await res.json().catch(() => ({}))) as { detail?: string; error?: string };
        throw new Error(e.detail ?? e.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        rubric: RubricData;
        rubric_status?: RubricStatus;
        job_id: string;
        job_name: string;
        client_name: string;
      };
      setRubric(data.rubric);
      setOriginalRubric(JSON.parse(JSON.stringify(data.rubric)) as RubricData);
      setRubricStatus(data.rubric_status ?? "draft");
      setSelectedJob({
        job_id: data.job_id,
        job_name: data.job_name,
        client_name: data.client_name
      });
      const expanded: Record<string, boolean> = {};
      for (const item of data.rubric.requirements?.must_have ?? []) {
        expanded[item.id] = true;
      }
      setExpandedMustHave(expanded);
      setJobs((prev) =>
        prev.map((j) => (j.job_id === data.job_id ? { ...j, has_rubric: true } : j))
      );
      setJdSavedMarkdown(jdMarkdown.trimEnd());
      setScreen("view");
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : "Failed to generate rubric");
    } finally {
      setGenerating(false);
    }
  }, [selectedJob, jdText, jdHtml]);

  const handleApprove = useCallback(async () => {
    if (!selectedJob) return;
    try {
      const res = await fetch("/api/rubric", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: selectedJob.job_id, rubric_status: "active" })
      });
      if (res.ok) {
        setRubricStatus("active");
      }
    } catch {
      setError("Failed to activate rubric");
    }
  }, [selectedJob]);

  const prettyJson = useMemo(() => (rubric ? JSON.stringify(rubric, null, 2) : ""), [rubric]);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(prettyJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [prettyJson]);

  const handleDownload = useCallback(() => {
    if (!selectedJob) return;
    const blob = new Blob([prettyJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rubric_${selectedJob.job_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [prettyJson, selectedJob]);

  const updateWeight = (id: string, val: number) => {
    setRubric((prev) => {
      if (!prev?.requirements?.must_have) return prev;
      return {
        ...prev,
        requirements: {
          ...prev.requirements,
          must_have: prev.requirements.must_have.map((item) =>
            item.id === id ? { ...item, weight: Math.min(95, Math.max(1, val)) } : item
          )
        }
      };
    });
  };

  const handleSave = async () => {
    if (!isValid || saving || !selectedJob || !rubric?.requirements?.must_have) return;
    setSaving(true);
    setError(null);
    const weights: Record<string, number> = {};
    rubric.requirements.must_have.forEach((i) => {
      weights[i.id] = i.weight;
    });
    try {
      const res = await fetch("/api/rubric", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: selectedJob.job_id, weights, updated_by: "recruiter" })
      });
      if (res.ok) {
        await loadRubric(selectedJob.job_id);
        setJustSaved(true);
        setScreen("view");
      } else {
        setError("Save failed. Please try again.");
      }
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setRubric(JSON.parse(JSON.stringify(originalRubric)) as RubricData);
    setShowDiscardWarning(false);
    setScreen("view");
  };

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), 5000);
    return () => clearTimeout(t);
  }, [justSaved]);

  const shell = (
    <div className={`${wrapClass} job-rubric-root`}>
      <style>{BADGE_STYLES}</style>

      {screen === "select" ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
          <h2 className="mb-2 text-[15px] font-medium text-[var(--text)]">Select a job</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">Search by role name or client to find a job.</p>

          {!loadingJobs && jobs.length > 0 ? (
            <div className="relative mb-4">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                aria-hidden
              />
              <input
                type="search"
                value={jobSearchQuery}
                onChange={(e) => setJobSearchQuery(e.target.value)}
                placeholder="Search by role or client…"
                className="glass-input h-11 w-full py-2 pl-9 pr-9"
                aria-label="Search jobs by role or client"
              />
              {jobSearchQuery ? (
                <button
                  type="button"
                  onClick={() => setJobSearchQuery("")}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-white/[0.03] hover:text-[var(--text)]"
                  aria-label="Clear search"
                >
                  <X size={14} aria-hidden />
                </button>
              ) : null}
            </div>
          ) : null}

          {!loadingJobs && jobs.length > 0 && jobSearchQuery.trim() ? (
            <p className="mb-3 text-xs text-[var(--muted)]">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </p>
          ) : null}

          {error ? (
            <div
              className="mb-4 rounded-lg border px-4 py-3 text-sm"
              style={{
                borderColor: "var(--warning-border)",
                background: "var(--warning-bg)",
                color: "var(--warning)"
              }}
            >
              {error}
            </div>
          ) : null}

          {loadingJobs ? (
            <div className="flex flex-col items-center gap-3 py-12 text-sm text-[var(--muted)]">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--cyan)]" />
              Loading jobs…
            </div>
          ) : jobs.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--muted)]">No active jobs found.</p>
          ) : filteredJobs.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--muted)]">
              No jobs match &ldquo;{jobSearchQuery.trim()}&rdquo;. Try another role or client name.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {filteredJobs.map((job) => (
                <li
                  key={job.job_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border px-4 py-3"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-[var(--text)]">{job.job_name}</div>
                    <div className="font-mono text-xs text-[var(--muted)]">#{job.job_id}</div>
                    <div className="text-xs text-[var(--muted)]">{job.client_name}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {job.has_rubric ? (
                      <button
                        type="button"
                        disabled={loadingRubric}
                        onClick={() => void loadRubric(job.job_id)}
                        className="
                          px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                          border border-zinc-300 bg-zinc-200 text-black
                          hover:bg-zinc-300
                          dark:border-[#111] dark:bg-gradient-to-b dark:from-[#3a3a3a] dark:to-[#1a1a1a]
                          dark:font-semibold dark:text-white
                          dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.3)]
                          dark:hover:from-[#444] dark:hover:to-[#222]
                          disabled:opacity-40 disabled:cursor-not-allowed
                        "
                      >
                        View rubric
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={loadingRubric}
                        onClick={() => void openGenerateScreen(job)}
                        className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-sm font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Generate rubric
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {screen === "generate" && selectedJob ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div
            className="flex shrink-0 flex-wrap items-center gap-3 border-b px-4 py-3"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <button
              type="button"
              onClick={() => {
                setScreen("select");
                setSelectedJob(null);
                setGenerateError(null);
                setJdHtml("");
                setJdText("");
              }}
              className="flex items-center gap-1 rounded-lg border border-white/[0.07] px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:bg-white/[0.03]"
              style={{ borderColor: "var(--border)" }}
            >
              <ChevronLeft size={16} aria-hidden />
              Jobs
            </button>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-[var(--text)]">{selectedJob.job_name}</div>
              <div className="font-mono text-xs text-[var(--muted)]">#{selectedJob.job_id}</div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-3xl flex-1 p-4 md:p-6">
            <div
              className="rounded-[12px] border p-4 md:p-5"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              <label className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Job description
              </label>
              {loadingJd ? (
                <p className="mt-2 text-sm text-[var(--muted)]">Loading job description…</p>
              ) : (
                <JdRichTextEditor
                  value={jdHtml}
                  onChange={onJdEditorChange}
                  editorKey={`${selectedJob.job_id}-${theme}`}
                  placeholder="Paste or edit the job description..."
                />
              )}
              {!loadingJd && jdText.length > 0 ? (
                <p className="mt-1 text-right text-xs text-[var(--muted)]">{jdText.length} characters</p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={updatingJd || !jdText.trim() || !jdDirty}
                  onClick={() => void handleUpdateJd()}
                  className="rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                >
                  {updatingJd ? "Saving…" : "Update JD"}
                </button>
                <button
                  type="button"
                  disabled={generating || updatingJd || !jdText.trim()}
                  onClick={() => void handleGenerate()}
                  className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {generating ? "Generating... (~15 seconds)" : "Generate rubric"}
                </button>
              </div>
              {jdUpdateSuccess ? (
                <p className="mt-2 text-sm text-cyan-400">Job description saved to Airtable.</p>
              ) : null}
              {jdUpdateError ? (
                <div
                  className="mt-3 rounded-lg border px-3 py-2 text-sm"
                  style={{
                    borderColor: "var(--warning-border)",
                    background: "var(--warning-bg)",
                    color: "var(--warning)"
                  }}
                >
                  {jdUpdateError}
                </div>
              ) : null}
              {generateError ? (
                <div
                  className="mt-3 rounded-lg border px-3 py-2 text-sm"
                  style={{
                    borderColor: "var(--warning-border)",
                    background: "var(--warning-bg)",
                    color: "var(--warning)"
                  }}
                >
                  {generateError}
                </div>
              ) : null}
              <p className="mt-3 text-xs text-[var(--muted)]">
                Generated rubric will be saved as a draft. You can review and edit weights before activating.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {screen === "view" && rubric && selectedJob ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div
            className="flex shrink-0 flex-wrap items-center gap-3 border-b px-4 py-3"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <button
              type="button"
              onClick={() => {
                setShowRegenerateWarning(false);
                setScreen("select");
                setRubric(null);
                setSelectedJob(null);
                setRubricStatus(null);
                setJobSearchQuery("");
              }}
              className="flex items-center gap-1 rounded-lg border border-white/[0.07] px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:bg-white/[0.03]"
              style={{ borderColor: "var(--border)" }}
            >
              <ChevronLeft size={16} aria-hidden />
              Jobs
            </button>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-[var(--text)]">{selectedJob.job_name}</div>
              <div className="font-mono text-xs text-[var(--muted)]">#{selectedJob.job_id}</div>
            </div>
            {(rubric.metadata?.rubric_version ?? 1) > 1 ? (
              <span
                className="rounded-full border px-2.5 py-1 text-[11px] text-[var(--muted)]"
                style={{ borderColor: "var(--border)", background: "var(--card)" }}
              >
                v{rubric.metadata?.rubric_version} · {formatMetaDate(rubric.metadata?.weight_last_modified)}
              </span>
            ) : null}
            {justSaved ? (
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-400">
                Weights updated ✓
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setShowRegenerateWarning(false);
                setSchemaOrigin("view");
                setScreen("schema");
              }}
              className="rounded-lg border px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-white/[0.03]"
              style={{ borderColor: "var(--border)" }}
            >
              View Schema
            </button>
            <button
              type="button"
              onClick={() => void handleRegenerate()}
              className="rounded-lg border px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-white/[0.03]"
              style={{ borderColor: "var(--border)" }}
            >
              Regenerate
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRegenerateWarning(false);
                setScreen("edit");
              }}
              className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/20"
            >
              Edit weights
            </button>
          </div>

          {showRegenerateWarning ? (
            <div
              className="mx-4 mt-3 flex flex-wrap items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] md:mx-6"
              style={{
                background: "var(--warning-bg)",
                borderColor: "var(--warning-border)",
                color: "var(--warning)"
              }}
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <strong>This rubric is active.</strong> Regenerating will create a new draft. All CVs for this job
                will need to be re-scored after you approve the new rubric.
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegenerateWarning(false)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-white/[0.03]"
                  style={{ borderColor: "var(--border)" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRegenerateWarning(false);
                    void openGenerateFromView();
                  }}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                  style={{
                    borderColor: "var(--warning-border)",
                    background: "var(--warning-bg)",
                    color: "var(--warning)"
                  }}
                >
                  Yes, regenerate
                </button>
              </div>
            </div>
          ) : null}

          <div className="space-y-4 p-4 md:p-6">
            {rubricStatus === "draft" ? (
              <div
                className="flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px]"
                style={{
                  background: "var(--warning-bg)",
                  borderColor: "var(--warning-border)",
                  color: "var(--warning)"
                }}
              >
                <Clock size={16} className="mt-0.5 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1">
                  <strong>Draft — pending your review.</strong> Review the rubric below. Edit weights if needed,
                  then approve to activate candidate scoring.
                </div>
                <button
                  type="button"
                  onClick={() => void handleApprove()}
                  className="shrink-0 whitespace-nowrap rounded-lg border px-3.5 py-1.5 text-xs font-medium"
                  style={{
                    borderColor: "#1D9E75",
                    background: "rgba(29,158,117,0.10)",
                    color: "#1D9E75"
                  }}
                >
                  Approve & activate
                </button>
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Pass threshold", value: String(rubric.scoring?.pass_threshold ?? "—") },
                { label: "Score mode", value: String(rubric.scoring?.score_mode ?? "—") },
                { label: "Nice-to-have", value: String(rubric.scoring?.nice_to_have_mode ?? "—") },
                {
                  label: "Floor rule",
                  value: String(rubric.scoring?.floor_rule ?? "—"),
                  warn: true
                }
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-[12px] border p-3"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">{card.label}</div>
                  <div
                    className="mt-1 text-base font-medium"
                    style={{ color: card.warn ? "var(--warning)" : "var(--text)" }}
                  >
                    {card.value}
                  </div>
                </div>
              ))}
            </div>

            <CollapsibleSection label="Must-have requirements" defaultOpen>
              <ul className="space-y-2">
                {mustHave.map((item) => {
                  const open = expandedMustHave[item.id] ?? true;
                  return (
                    <li
                      key={item.id}
                      className="overflow-hidden rounded-[10px] border"
                      style={{ borderColor: "var(--border)", background: "var(--card)" }}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedMustHave((prev) => ({ ...prev, [item.id]: !open }))}
                        className="flex w-full flex-wrap items-center gap-2 px-3 py-2.5 text-left hover:bg-white/[0.03]"
                      >
                        <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold jr-badge-mh`}>{item.id}</span>
                        <span className="min-w-0 flex-1 font-medium text-[var(--text)]">{mustHaveLabel(item)}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${tierClass(item.tier)}`}>
                          {item.tier ?? "foundational"}
                        </span>
                        <span className="font-mono text-sm text-[var(--text)]">{item.weight}%</span>
                        <ChevronDown size={14} className={`text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`} />
                      </button>
                      {open ? (
                        <div className="border-t px-3 py-3" style={{ borderColor: "var(--border)" }}>
                          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
                            <div className="jr-orange-bar h-full rounded-full" style={{ width: `${item.weight}%` }} />
                          </div>
                          <TagRow label="Evidence signals" tags={item.evidence_signals ?? []} tagClass="jr-tag-ev" />
                          <TagRow label="Negative signals" tags={item.negative_signals ?? []} tagClass="jr-tag-neg" />
                          {item.category ? (
                            <div className="mt-2 text-sm">
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">Category </span>
                              <span className="text-[var(--text)]">{item.category}</span>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </CollapsibleSection>

            <CollapsibleSection label="Nice-to-have (flag only)" defaultOpen={false}>
              <ul className="space-y-2">
                {(rubric.requirements?.nice_to_have ?? []).map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold jr-badge-nh`}>{item.id}</span>
                    <span className="text-[var(--text)]">{niceToHaveLabel(item)}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            <CollapsibleSection label="Compliance requirements" defaultOpen={false}>
              <ul className="space-y-2">
                {(rubric.compliance_requirements ?? []).map((item, index) => (
                  <li key={`C${index + 1}`} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold jr-badge-comp`}>C{index + 1}</span>
                    <span className="text-[var(--text)]">{item}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            {(rubric.gates?.length ?? 0) > 0 ? (
              <CollapsibleSection label="Gates — hard disqualifiers" defaultOpen={false}>
                <ul className="space-y-2">
                  {(rubric.gates ?? []).map((item) => (
                    <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold jr-badge-gate`}>{item.id}</span>
                        <span className="text-[var(--text)]">{gateLabel(item)}</span>
                      </div>
                      <span
                        className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          borderColor: "var(--warning-border)",
                          background: "var(--warning-bg)",
                          color: "var(--warning)"
                        }}
                      >
                        Hard gate
                      </span>
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            ) : null}

            {(rubric.semantic_ontology?.normalized_terms?.length ?? 0) > 0 ? (
              <CollapsibleSection label="Semantic Ontology" defaultOpen={false}>
                <div className="flex flex-wrap gap-1.5">
                  {rubric.semantic_ontology!.normalized_terms!.map((term) => (
                    <span key={term} className="jr-tag-ont rounded-full px-2 py-0.5 text-[11px] font-medium">
                      {term}
                    </span>
                  ))}
                </div>
                {rubric.semantic_ontology?.semantic_threshold_defaults ? (
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(
                      [
                        ["Highest confidence", rubric.semantic_ontology.semantic_threshold_defaults.highest_confidence],
                        ["High confidence", rubric.semantic_ontology.semantic_threshold_defaults.high_confidence],
                        ["Medium confidence", rubric.semantic_ontology.semantic_threshold_defaults.medium_confidence],
                        ["Min acceptable", rubric.semantic_ontology.semantic_threshold_defaults.min_acceptable]
                      ] as const
                    ).map(([label, value]) =>
                      value != null && value !== "" ? (
                        <div key={label} className="text-sm">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</div>
                          <div className="font-mono text-[var(--text)]">{String(value)}</div>
                        </div>
                      ) : null
                    )}
                  </div>
                ) : null}
              </CollapsibleSection>
            ) : null}

            {rubric.bias_guardrails?.enforcement ? (
              <div
                className="rounded-[12px] border px-4 py-3 text-sm"
                style={{
                  borderColor: "var(--warning-border)",
                  background: "var(--warning-bg)",
                  color: "var(--warning)"
                }}
              >
                <div className="flex gap-2">
                  <span aria-hidden>⚠</span>
                  <span>{rubric.bias_guardrails.enforcement}</span>
                </div>
                {(rubric.bias_guardrails.protected_attributes?.length ?? 0) > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5 pl-6">
                    {rubric.bias_guardrails.protected_attributes!.map((attr) => (
                      <span
                        key={attr}
                        className="rounded-full border px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          borderColor: "var(--warning-border)",
                          background: "var(--surface)",
                          color: "var(--text)"
                        }}
                      >
                        {attr}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {screen === "edit" && rubric && selectedJob ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div
            className="flex shrink-0 flex-wrap items-center gap-3 border-b px-4 py-3"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <button
              type="button"
              onClick={() => {
                if (!isDirty) {
                  setScreen("view");
                  return;
                }
                setShowDiscardWarning(true);
              }}
              className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:bg-white/[0.03]"
              style={{ borderColor: "var(--border)" }}
            >
              <ChevronLeft size={16} aria-hidden />
              Back
            </button>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-[var(--text)]">{selectedJob.job_name}</div>
              <div className="font-mono text-xs text-[var(--muted)]">#{selectedJob.job_id}</div>
            </div>
            <TotalPill sum={mustHaveSum} />
            <button
              type="button"
              disabled={!isValid || saving}
              onClick={() => void handleSave()}
              className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Saving…" : !isValid ? "Fix weights first" : "Save & re-score"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-white/[0.03]"
              style={{ borderColor: "var(--border)" }}
            >
              Cancel
            </button>
          </div>

          {showDiscardWarning ? (
            <div
              className="mx-4 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm"
              style={{
                borderColor: "var(--warning-border)",
                background: "var(--warning-bg)",
                color: "var(--warning)"
              }}
            >
              <span>You have unsaved changes. Go back and discard?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleCancel();
                  }}
                  className="rounded-md border px-3 py-1 text-xs font-semibold"
                  style={{ borderColor: "var(--warning-border)" }}
                >
                  Discard & go back
                </button>
                <button
                  type="button"
                  onClick={() => setShowDiscardWarning(false)}
                  className="rounded-md border px-3 py-1 text-xs font-semibold"
                  style={{ borderColor: "var(--warning-border)" }}
                >
                  Keep editing
                </button>
              </div>
            </div>
          ) : null}

          <div className="space-y-6 p-4 md:p-6">
            <section>
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Must-have requirements
                </h3>
                <span className="text-xs text-[var(--muted)]">Must sum to exactly 100%</span>
                <TotalPill sum={mustHaveSum} />
              </div>
              <ul className="mt-3 space-y-3">
                {mustHave.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-[12px] border p-3"
                    style={{ borderColor: "var(--border)", background: "var(--card)" }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="min-w-0 flex-1 font-medium text-[var(--text)]">{mustHaveLabel(item)}</span>
                      <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold jr-badge-mh`}>{item.id}</span>
                      <button
                        type="button"
                        aria-label={`Decrease weight for ${item.id}`}
                        onClick={() => updateWeight(item.id, item.weight - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-md border text-[var(--text)] hover:bg-white/[0.03]"
                        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={95}
                        value={item.weight}
                        onChange={(e) => updateWeight(item.id, Number(e.target.value) || 1)}
                        className="w-14 rounded-md border px-2 py-1 text-center font-mono text-sm focus:outline-none"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--surface)",
                          color: "var(--text)"
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "var(--cyan)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      />
                      <button
                        type="button"
                        aria-label={`Increase weight for ${item.id}`}
                        onClick={() => updateWeight(item.id, item.weight + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-md border text-[var(--text)] hover:bg-white/[0.03]"
                        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                      >
                        <Plus size={14} />
                      </button>
                      <span className="font-mono text-sm text-[var(--muted)]">%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
                      <div className="jr-orange-bar h-full rounded-full" style={{ width: `${item.weight}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="opacity-60">
              <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Nice-to-have — read-only
              </h3>
              <ul className="mt-3 space-y-2">
                {niceToHave.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold jr-badge-nh`}>{item.id}</span>
                    <span className="text-[var(--text)]">{niceToHaveLabel(item)}</span>
                    <span className="font-mono text-[var(--muted)]">{item.weight ?? 0}%</span>
                  </li>
                ))}
              </ul>
            </section>

            <div
              className={`rounded-[12px] border px-4 py-3 text-sm ${
                isValid ? "border-cyan-500/40 bg-cyan-500/[0.08] text-cyan-400" : "jr-tag-neg"
              }`}
              style={
                isValid
                  ? undefined
                  : { borderColor: "transparent", background: undefined, color: undefined }
              }
            >
              {isValid
                ? "Weights balanced — ready to save."
                : `Total is ${mustHaveSum}% — ${Math.abs(mustHaveSum - 100)}% ${mustHaveSum > 100 ? "over" : "under"}. Adjust until total equals exactly 100%.`}
            </div>
          </div>
        </div>
      ) : null}

      {screen === "schema" && rubric && selectedJob ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div
            className="flex shrink-0 flex-wrap items-center gap-3 border-b px-4 py-3"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <button
              type="button"
              onClick={() => setScreen(schemaOrigin)}
              className="flex items-center gap-1 rounded-lg border border-white/[0.07] px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:bg-white/[0.03]"
              style={{ borderColor: "var(--border)" }}
            >
              <ChevronLeft size={16} aria-hidden />
              Back
            </button>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-[var(--text)]">{selectedJob.job_name}</div>
              <div className="font-mono text-xs text-[var(--muted)]">#{selectedJob.job_id}</div>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg border px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-white/[0.03]"
              style={{ borderColor: "var(--border)" }}
            >
              {copied ? "Copied!" : "Copy JSON"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-lg border px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-white/[0.03]"
              style={{ borderColor: "var(--border)" }}
            >
              Download
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
            <pre
              className="m-0 flex-1 overflow-auto rounded-[12px] border p-5 font-mono text-[13px] leading-relaxed"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
                color: "var(--text)",
                minHeight: "calc(100vh - 120px)"
              }}
              dangerouslySetInnerHTML={{ __html: highlightJson(prettyJson) }}
            />
          </div>
        </div>
      ) : null}

      {loadingRubric ? (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-[var(--bg)]/60">
          <span className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--cyan)]" />
        </div>
      ) : null}
    </div>
  );

  if (isStandaloneRoute) {
    return (
      <div className="opal-workspace-theme flex h-screen min-h-0 flex-col overflow-hidden" data-theme={theme}>
        <header
          className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <span className="opal-heading-panel text-[15px]">Job Rubric</span>
          <WorkspaceThemeToggle theme={theme} onChange={persistTheme} />
        </header>
        {shell}
      </div>
    );
  }

  return shell;
}
