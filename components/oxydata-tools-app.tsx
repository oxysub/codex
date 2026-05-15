"use client";

import { JdClarityTab } from "@/components/job-clarity/JdClarityTab";
import { RecruiterCopilotTab } from "@/components/recruiter-copilot/RecruiterCopilotTab";
import { OutputPanel } from "@/components/hiring-strategy/OutputPanel";
import { GemIcon } from "@/components/GemIcon";
import { OpalLoginWordmark } from "@/components/OpalLoginWordmark";
import {
  NavIconAiScoring,
  NavIconAirtable,
  NavIconAlerts,
  NavIconAnalytics,
  NavIconCvFormatter,
  NavIconHiringStrategy,
  NavIconJobClarity,
  NavIconJobPosting,
  NavIconRecruiterCopilot,
  NavIconRubric,
  NavIconSettings,
  NavIconUpload,
  NavIconViewScoring,
  SidebarGemIcon
} from "@/components/sidebar-gem-icon";
import JobRubric from "@/components/job-rubric/JobRubric";
import { useWorkspaceTheme, WorkspaceThemeToggle } from "@/components/workspace-theme";
import { BookOpen, Upload } from "lucide-react";
import { Orbitron } from "next/font/google";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

const orbitronWordmark = Orbitron({
  subsets: ["latin"],
  weight: ["800"]
});

type TabKey =
  | "jd"
  | "rubric"
  | "uploadCv"
  | "aiScoring"
  | "recruiterCopilot"
  | "hiringStrategy"
  | "viewScoring"
  | "viewAirtable"
  | "cv"
  | "jobPosting"
  | "jobRubric"
  | "alerts"
  | "analytics"
  | "setup";
type StatusState = "loading" | "success" | "error";

type JobRecord = {
  id: string;
  name: string;
  client: string;
};

type StatusMessage = {
  state: StatusState;
  message: string;
} | null;

const APP_VERSION = "v1.2";
const AIRTABLE_EMBED_URL = "https://airtable.com/embed/app285aKVVr7JYL43/shrrAnsUsfhMC5xG1";

const TAB_TOPBAR: Record<TabKey, { title: string; subtitle: string }> = {
  jd: {
    title: "Job clarity",
    subtitle: "Optimize Job Descriptions"
  },
  rubric: {
    title: "Rubric generator",
    subtitle: "Setup · generate AI scoring rubrics"
  },
  jobPosting: {
    title: "Job posting",
    subtitle: "Setup · create and publish job posts"
  },
  jobRubric: {
    title: "Job Rubric",
    subtitle: "View and manage job rubric weights"
  },
  uploadCv: {
    title: "Upload to ATS",
    subtitle: "Bulk upload CVs to upload to Manatal pipeline"
  },
  aiScoring: {
    title: "Run AI scoring",
    subtitle: "Generate AI Score and Reasoning on Candidate CVs"
  },
  recruiterCopilot: {
    title: "Interview Copilot",
    subtitle: "Process · interview probes, blended score, HM assess"
  },
  cv: {
    title: "CV formatter",
    subtitle: "Format Candidate CV into Oxy standard template"
  },
  hiringStrategy: {
    title: "Hiring Strategy",
    subtitle: "Setup · plan channels, roles, and sourcing priorities"
  },
  viewScoring: {
    title: "View scoring",
    subtitle: "Process · browse candidate scores and reports"
  },
  viewAirtable: {
    title: "View Airtable",
    subtitle: "Process · view live Airtable recruitment data"
  },
  alerts: {
    title: "Alerts",
    subtitle: "Intelligence · hiring and pipeline notifications"
  },
  analytics: {
    title: "Analytics",
    subtitle: "Intelligence · dashboards and hiring metrics"
  },
  setup: {
    title: "Settings",
    subtitle: "Configure integrations and workspace preferences"
  }
};

const DEMO_LOGIN_EMAIL = "recruiter@oxydata.my";

function normalizeDemoEmail(raw: string): string {
  try {
    return raw
      .normalize("NFKC")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/＠/g, "@")
      .trim()
      .toLowerCase()
      .replace(/\s/g, "");
  } catch {
    return raw.trim().toLowerCase().replace(/\s/g, "");
  }
}

export function OxydataToolsApp() {
  const [activeTab, setActiveTab] = useState<TabKey>("jd");
  const { theme: workspaceTheme, persistTheme: persistWorkspaceTheme } = useWorkspaceTheme();
  const [authenticated, setAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState(DEMO_LOGIN_EMAIL);
  const [loginPassword, setLoginPassword] = useState("******");
  const [loginError, setLoginError] = useState(false);

  const handleLogin = () => {
    const normalized = normalizeDemoEmail(loginEmail);
    if (normalized === DEMO_LOGIN_EMAIL) {
      setLoginError(false);
      setAuthenticated(true);
      return;
    }
    setLoginError(true);
  };

  if (!authenticated) {
    return (
      <main className="login-page">
        <div className="login-page__card">
          <div className="login-page__hero">
            <div className="login-gem-wrap">
              <span className="login-gem-tooltip">Optimised People Acquisition &amp; Lifecycle</span>
              <GemIcon idPrefix="login" />
            </div>
            <OpalLoginWordmark />
          </div>
          <div className="login-page__by-oxydata">
            <img src="/oxydata_logo.webp" alt="Oxydata" className="login-page__oxydata-logo" width={120} height={16} />
          </div>
          <div className="login-page__divider" aria-hidden />
          <p className="login-page__tagline">AI Recruiter — sign in</p>
          <form
            className="login-page__form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="login-page__field">
              <label className="login-page__label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  setLoginError(false);
                }}
                className="login-page__input"
              />
            </div>
            <div className="login-page__field login-page__field--spaced">
              <label className="login-page__label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="login-page__input"
                placeholder="******"
              />
            </div>
            {loginError ? (
              <p className="login-page__error" role="alert">
                Demo sign-in needs email{" "}
                <span style={{ fontFamily: "ui-monospace, monospace" }}>{DEMO_LOGIN_EMAIL}</span> (any
                password).
              </p>
            ) : null}
            <button type="submit" className="login-page__btn">
              Login
            </button>
          </form>
          <p className="login-page__hint">
            Opal demo: use email recruiter@oxydata.my and any password (e.g. ******).
          </p>
        </div>
      </main>
    );
  }

  const top = TAB_TOPBAR[activeTab];

  return (
    <div className="opal-app-shell">
      <aside className="opal-sidebar" aria-label="Primary navigation">
        <div className="opal-sidebar-logo">
          <button
            type="button"
            className="opal-sidebar-logo-btn"
            onClick={() => setAuthenticated(false)}
            title="Sign out"
          >
            <SidebarGemIcon />
            <div className="opal-sidebar-logo-text">
              <span className={`opal-sidebar-wordmark ${orbitronWordmark.className}`}>OPAL</span>
              <span className="opal-sidebar-version">{APP_VERSION}</span>
            </div>
          </button>
        </div>

        <div className="opal-nav-section">
          <div className="opal-nav-section-label">Setup</div>
          <button
            type="button"
            className={`opal-nav-item ${activeTab === "hiringStrategy" ? "opal-nav-item--active" : ""}`}
            onClick={() => setActiveTab("hiringStrategy")}
          >
            <NavIconHiringStrategy />
            <span className="opal-nav-label">Hiring Strategy</span>
          </button>
          <button
            type="button"
            className={`opal-nav-item ${activeTab === "jd" ? "opal-nav-item--active" : ""}`}
            onClick={() => setActiveTab("jd")}
          >
            <NavIconJobClarity />
            <span className="opal-nav-label">Job clarity</span>
          </button>
          <button
            type="button"
            className={`opal-nav-item ${activeTab === "jobPosting" ? "opal-nav-item--active" : ""}`}
            onClick={() => setActiveTab("jobPosting")}
          >
            <NavIconJobPosting />
            <span className="opal-nav-label">Job posting</span>
          </button>
          <button
            type="button"
            className={`opal-nav-item ${activeTab === "jobRubric" ? "opal-nav-item--active" : ""}`}
            onClick={() => setActiveTab("jobRubric")}
          >
            <BookOpen size={18} />
            <span className="opal-nav-label">Job Rubric</span>
          </button>
        </div>

        <div className="opal-nav-divider" aria-hidden />

        <div className="opal-nav-section">
          <div className="opal-nav-section-label">Sourcing</div>
          <button
            type="button"
            className={`opal-nav-item ${activeTab === "uploadCv" ? "opal-nav-item--active" : ""}`}
            onClick={() => setActiveTab("uploadCv")}
          >
            <NavIconUpload />
            <span className="opal-nav-label">Upload to ATS</span>
          </button>
        </div>

        <div className="opal-nav-divider" aria-hidden />

        <div className="opal-nav-section">
          <div className="opal-nav-section-label">Process</div>
          <button
            type="button"
            className={`opal-nav-item ${activeTab === "aiScoring" ? "opal-nav-item--active" : ""}`}
            onClick={() => setActiveTab("aiScoring")}
          >
            <NavIconAiScoring />
            <span className="opal-nav-label">Run AI scoring</span>
          </button>
          <button
            type="button"
            className={`opal-nav-item ${activeTab === "recruiterCopilot" ? "opal-nav-item--active" : ""}`}
            onClick={() => setActiveTab("recruiterCopilot")}
          >
            <NavIconRecruiterCopilot />
            <span className="opal-nav-label">Interview Copilot</span>
          </button>
          <button
            type="button"
            className={`opal-nav-item ${activeTab === "viewScoring" ? "opal-nav-item--active" : ""}`}
            onClick={() => setActiveTab("viewScoring")}
          >
            <NavIconViewScoring />
            <span className="opal-nav-label">View scoring</span>
          </button>
          <button
            type="button"
            className={`opal-nav-item ${activeTab === "viewAirtable" ? "opal-nav-item--active" : ""}`}
            onClick={() => setActiveTab("viewAirtable")}
          >
            <NavIconAirtable />
            <span className="opal-nav-label">View Airtable</span>
          </button>
          <button
            type="button"
            className={`opal-nav-item ${activeTab === "cv" ? "opal-nav-item--active" : ""}`}
            onClick={() => setActiveTab("cv")}
          >
            <NavIconCvFormatter />
            <span className="opal-nav-label">CV formatter</span>
          </button>
        </div>

        <div className="opal-nav-divider" aria-hidden />

        <div className="opal-nav-section">
          <div className="opal-nav-section-label">Intelligence</div>
          <button
            type="button"
            className={`opal-nav-item ${activeTab === "alerts" ? "opal-nav-item--active" : ""}`}
            onClick={() => setActiveTab("alerts")}
          >
            <NavIconAlerts />
            <span className="opal-nav-label">Alerts</span>
          </button>
          <button
            type="button"
            className={`opal-nav-item ${activeTab === "analytics" ? "opal-nav-item--active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <NavIconAnalytics />
            <span className="opal-nav-label">Analytics</span>
          </button>
        </div>

        <div className="opal-sidebar-footer">
          <button
            type="button"
            className={`opal-nav-item ${activeTab === "rubric" ? "opal-nav-item--active" : ""}`}
            onClick={() => setActiveTab("rubric")}
          >
            <NavIconRubric />
            <span className="opal-nav-label">Rubric generator</span>
          </button>
          <button type="button" className="opal-util-item" onClick={() => setActiveTab("setup")}>
            <NavIconSettings />
            <span className="opal-util-label">Settings</span>
          </button>
        </div>
      </aside>

      <div className="opal-main opal-workspace-theme" data-theme={workspaceTheme}>
        <header className="opal-topbar flex-none">
          <div className="opal-topbar-text">
            <h1 className="opal-topbar-title">{top.title}</h1>
            <div className="opal-topbar-sub-row">
              <p
                className={`opal-topbar-sub${activeTab === "jd" || activeTab === "cv" || activeTab === "aiScoring" || activeTab === "uploadCv" ? " italic" : ""}`}
              >
                {top.subtitle}
              </p>
              <WorkspaceThemeToggle theme={workspaceTheme} onChange={persistWorkspaceTheme} />
            </div>
          </div>
        </header>
        <div className="opal-main-content">
          {activeTab === "jd" ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <JdClarityTab />
            </div>
          ) : null}
          {activeTab === "rubric" ? <RubricGeneratorTab /> : null}
          {activeTab === "uploadCv" ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <UploadCvTab />
            </div>
          ) : null}
          {activeTab === "aiScoring" ? <AiCandidateScoringTab /> : null}
          {activeTab === "recruiterCopilot" ? <RecruiterCopilotTab /> : null}
          {activeTab === "hiringStrategy" ? <HiringStrategyTab /> : null}
          {activeTab === "viewScoring" ? <ViewScoringTab /> : null}
          {activeTab === "viewAirtable" ? <ViewAirtableTab /> : null}
          {activeTab === "cv" ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <CvFormatterTab />
            </div>
          ) : null}
          {activeTab === "jobPosting" ? <JobPostingTab /> : null}
          {activeTab === "jobRubric" ? <JobRubric /> : null}
          {activeTab === "alerts" ? <AlertsTab /> : null}
          {activeTab === "analytics" ? <AnalyticsTab /> : null}
          {activeTab === "setup" ? <SetupTab /> : null}
        </div>
      </div>
    </div>
  );
}

function UploadCvTab() {
  type UploadRow = {
    name: string;
    jobId: string;
    jobName: string;
    clientName: string;
    source: string;
    cvFileName: string;
  };

  const [jobId, setJobId] = useState("");
  const [jobName, setJobName] = useState("");
  const [clientName, setClientName] = useState("");
  const [jobQuery, setJobQuery] = useState("");
  const [jobSuggestions, setJobSuggestions] = useState<JobRecord[]>([]);
  const [isJobDropdownOpen, setIsJobDropdownOpen] = useState(false);
  const [source, setSource] = useState("");
  const [bulkCvFiles, setBulkCvFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isAddingToQueue, setIsAddingToQueue] = useState(false);
  const [rows, setRows] = useState<UploadRow[]>([]);

  const canAddToQueue = Boolean(jobId && jobName && clientName && source && bulkCvFiles.length > 0);
  const canUploadToManatal = rows.length > 0;

  const inferCandidateNameFromFile = (fileName: string) => {
    const withoutExt = fileName.replace(/\.[^/.]+$/, "");
    const normalized = withoutExt
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const cleaned = normalized
      .replace(/\b(cv|resume|curriculum vitae|profile|updated)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    const fallback = cleaned || normalized || "Unknown Candidate";
    return fallback
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const toTitleCaseName = (rawName: string) =>
    rawName
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");

  const extractNameFromParagraph = (paragraph: string) => {
    const firstSegment = paragraph
      .replace(/\s+/g, " ")
      .split(/[|\n,•]/)[0]
      .trim();
    const alphaText = firstSegment
      .replace(/[^a-zA-Z\s'-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const words = alphaText.split(" ").filter((word) => word.length > 1);
    if (words.length < 2) return "";
    return `${words[0]} ${words[1]}`
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const extractCandidateNameFromCv = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);

      const response = await fetch("/api/cv-original-preview", {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        return inferCandidateNameFromFile(file.name);
      }

      const data = (await response.json()) as { previewHtml?: string };
      const previewHtml = data.previewHtml;
      if (!previewHtml) {
        return inferCandidateNameFromFile(file.name);
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(previewHtml, "text/html");
      const firstParagraph = Array.from(doc.querySelectorAll("p"))
        .map((node) => node.textContent?.trim() ?? "")
        .find((value) => value.length > 0);

      if (!firstParagraph) {
        return inferCandidateNameFromFile(file.name);
      }

      return toTitleCaseName(extractNameFromParagraph(firstParagraph)) || inferCandidateNameFromFile(file.name);
    } catch {
      return inferCandidateNameFromFile(file.name);
    }
  };

  useEffect(() => {
    if (!jobQuery.trim()) {
      setJobSuggestions([]);
      setIsJobDropdownOpen(false);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(`/api/rubric?query=${encodeURIComponent(jobQuery)}`, {
          signal: controller.signal
        });
        const data = (await response.json()) as { jobs?: JobRecord[] };
        setJobSuggestions(data.jobs ?? []);
        setIsJobDropdownOpen((data.jobs ?? []).length > 0);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setJobSuggestions([]);
          setIsJobDropdownOpen(false);
        }
      }
    })();

    return () => controller.abort();
  }, [jobQuery]);

  function resetLeftFormAfterQueue() {
    setJobQuery("");
    setJobId("");
    setJobName("");
    setClientName("");
    setSource("");
    setBulkCvFiles([]);
    setFileInputKey((k) => k + 1);
    setIsJobDropdownOpen(false);
  }

  function clearIntakeForm() {
    resetLeftFormAfterQueue();
    setRows([]);
  }

  async function addToQueue() {
    if (!canAddToQueue || isAddingToQueue) return;
    const pendingFiles = [...bulkCvFiles];
    const pendingJobId = jobId;
    const pendingJobName = jobName;
    const pendingClientName = clientName;
    const pendingSource = source;

    setIsAddingToQueue(true);
    try {
      const names = await Promise.all(
        pendingFiles.map(async (file) => ({
          file,
          name: toTitleCaseName(await extractCandidateNameFromCv(file))
        }))
      );

      const nextRows: UploadRow[] = names.map(({ file, name: extractedName }) => ({
        name: extractedName,
        jobId: pendingJobId,
        jobName: pendingJobName,
        clientName: pendingClientName,
        source: pendingSource,
        cvFileName: file.name
      }));

      setRows((prev) => [...prev, ...nextRows]);
      resetLeftFormAfterQueue();
    } finally {
      setIsAddingToQueue(false);
    }
  }

  const onManatalCvDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onManatalCvDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const list = Array.from(e.dataTransfer.files).filter(
      (f) =>
        /\.pdf$/i.test(f.name) ||
        /\.docx?$/i.test(f.name) ||
        f.type === "application/pdf" ||
        f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        f.type === "application/msword"
    );
    if (list.length > 0) {
      setBulkCvFiles(list);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <section className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[340px_1fr]">
        <div className="surface-card flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-5">
          <div>
            <SectionLabel className="!text-[color:var(--muted)]">Upload Candidate CV *</SectionLabel>
            <label
              className="cv-intake-upload-label cv-intake-drop-zone panel-border mt-3 flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[16px] bg-white/[0.02] px-5 py-4 text-center transition-colors duration-200 hover:border-cyan-400/35 hover:bg-cyan-400/[0.04]"
              onDragOver={onManatalCvDragOver}
              onDrop={onManatalCvDrop}
            >
              <div className="cv-intake-upload-icon grid h-12 w-12 shrink-0 place-items-center rounded-[14px] border border-cyan-400/25 bg-cyan-400/12 text-cyan-300">
                <Upload className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </div>
              {bulkCvFiles.length > 0 ? (
                <>
                  <div className="text-[13px] font-semibold text-[color:var(--text)]">
                    {bulkCvFiles.length} CV file{bulkCvFiles.length === 1 ? "" : "s"} selected
                  </div>
                  <div className="text-[12px] leading-relaxed text-[color:var(--muted)]">
                    Drop to replace, or browse to change selection.
                  </div>
                </>
              ) : (
                <>
                  <div className="max-w-[280px] text-[15px] font-bold leading-snug text-[color:var(--text)]">
                    <span className="block">Drop PDF or DOCX here, or browse to</span>
                    <span className="block">upload</span>
                  </div>
                  <div className="text-[12px] text-[color:var(--muted)]">Accepted formats: PDF or DOCX</div>
                </>
              )}
              <input
                key={fileInputKey}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                className="hidden"
                onChange={(e) => setBulkCvFiles(Array.from(e.target.files ?? []))}
              />
            </label>
            <p className="cv-intake-helper-text mt-3 text-center text-xs text-[color:var(--muted)]">
              Candidate names are inferred from the first paragraph of each CV when you add to the queue.
            </p>
          </div>

          <div className="relative">
            <SectionLabel className="!text-[color:var(--muted)]">Job ID *</SectionLabel>
            <input
              value={jobQuery}
              onChange={(e) => {
                setJobQuery(e.target.value);
                setJobId("");
                setJobName("");
                setClientName("");
              }}
              onFocus={() => setIsJobDropdownOpen(jobSuggestions.length > 0)}
              required
              aria-required="true"
              className="glass-input mt-3 h-12 w-full px-4"
              placeholder="Type to search — Job ID or Job Name"
            />
            {isJobDropdownOpen && jobSuggestions.length > 0 ? (
              <ul className="cv-intake-job-dropdown absolute left-0 right-0 top-[calc(100%+10px)] z-30 max-h-44 overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface)] p-1 text-sm text-[color:var(--text)] shadow-lg">
                {jobSuggestions.map((job) => (
                  <li
                    key={job.id}
                    onClick={() => {
                      setJobId(job.id);
                      setJobName(job.name);
                      setClientName(job.client);
                      setJobQuery(`${job.id} — ${job.name}`);
                      setIsJobDropdownOpen(false);
                    }}
                    className="cursor-pointer rounded px-2 py-2 text-[color:var(--text)] hover:bg-cyan-500/15"
                  >
                    <span className="font-medium text-cyan-400">{job.id}</span>
                    <span className="text-[color:var(--muted)]"> · </span>
                    <span>{job.name}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div>
            <SectionLabel className="!text-[color:var(--muted)]">Client Name</SectionLabel>
            <input
              value={clientName}
              readOnly
              className="glass-input mt-3 h-12 w-full px-4"
              placeholder="Auto-filled when you select a job"
            />
          </div>

          <div>
            <SectionLabel className="!text-[color:var(--muted)]">Source *</SectionLabel>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
              aria-required="true"
              className="glass-input mt-3 h-12 w-full px-4 text-[color:var(--text)]"
            >
              <option value="">Select source</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="JobStreet">JobStreet</option>
              <option value="Indeed">Indeed</option>
              <option value="Referral">Referral</option>
              <option value="Direct">Direct</option>
              <option value="Monster">Monster</option>
            </select>
          </div>

          <div className="flex min-h-[54px] gap-3">
            <button
              type="button"
              onClick={() => void addToQueue()}
              disabled={!canAddToQueue || isAddingToQueue}
              className="primary-button flex min-h-[54px] min-w-0 flex-1 items-center justify-center rounded-[14px] px-5 text-[13px] font-semibold disabled:pointer-events-none disabled:!opacity-50"
            >
              {isAddingToQueue ? "Adding…" : "Add to Queue"}
            </button>
            <button
              type="button"
              onClick={clearIntakeForm}
              disabled={isAddingToQueue}
              className="glass-button flex min-h-[54px] shrink-0 items-center justify-center rounded-[14px] px-4 text-[12px] font-semibold disabled:pointer-events-none disabled:opacity-55"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="surface-card flex h-full min-h-0 flex-col overflow-hidden p-5">
          <div className="mb-3 flex shrink-0 items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
              {rows.length} candidate{rows.length !== 1 ? "s" : ""} queued
            </span>
            <button
              type="button"
              onClick={() => {
                if (!canUploadToManatal) return;
                alert(`Uploaded ${rows.length} candidate${rows.length === 1 ? "" : "s"} to Manatal.`);
              }}
              disabled={!canUploadToManatal || isAddingToQueue}
              className="primary-button rounded-[10px] px-5 py-2 text-[13px] disabled:pointer-events-none disabled:!opacity-50"
            >
              Upload to Manatal
            </button>
          </div>

          <div className="panel-border flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px]">
            <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
              <table className="cv-intake-table w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-300">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Job ID</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">CV</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="cv-intake-table-empty text-center text-slate-400">
                        No candidates queued yet
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={`${row.jobId}-${row.cvFileName}-${idx}`} className="border-y border-white/10">
                        <td className="px-3 py-2">{row.name}</td>
                        <td className="px-3 py-2">{row.jobId}</td>
                        <td className="px-3 py-2">{row.source}</td>
                        <td className="px-3 py-2" title={row.cvFileName}>
                          {row.cvFileName}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RubricGeneratorTab() {
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobRecord | null>(null);
  const [status, setStatus] = useState<StatusMessage>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [rubric, setRubric] = useState("");

  async function searchJobs(nextQuery: string) {
    setQuery(nextQuery);
    setSelectedJob(null);
    setRubric("");

    if (!nextQuery.trim()) {
      setJobs([]);
      setIsDropdownOpen(false);
      return;
    }

    try {
      const response = await fetch(`/api/rubric?query=${encodeURIComponent(nextQuery)}`);
      const data = (await response.json()) as { jobs?: JobRecord[] };
      setJobs(data.jobs ?? []);
      setIsDropdownOpen(true);
    } catch {
      setJobs([]);
      setIsDropdownOpen(false);
    }
  }

  async function refreshFromManatal() {
    setStatus({ state: "loading", message: "Refreshing job index from Manatal through the backend..." });

    try {
      const response = await fetch("/api/rubric", { method: "POST" });
      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to refresh Manatal jobs.");
      }

      setStatus({ state: "success", message: data.message ?? "Job list refreshed successfully." });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Unexpected refresh error."
      });
    }
  }

  async function generateRubric() {
    if (!selectedJob) {
      setStatus({ state: "error", message: "Select a job from the dropdown before generating a rubric." });
      return;
    }

    setStatus({ state: "loading", message: `Generating rubric for ${selectedJob.name}...` });

    try {
      const response = await fetch("/api/rubric", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJob.id })
      });
      const data = (await response.json()) as { rubric?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Rubric generation failed.");
      }

      setRubric(data.rubric ?? "");
      setStatus({ state: "success", message: "Rubric generated successfully." });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Unexpected rubric generation error."
      });
    }
  }

  return (
    <section className="rubric-generator-tab mx-auto w-full max-w-[700px]">
      <div className="surface-card flex flex-col gap-6 p-8">
        <h2 className="opal-heading-panel mb-4 text-[15px] font-bold tracking-[0.12em] uppercase">Rubric Generator</h2>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(event) => void searchJobs(event.target.value)}
              onFocus={() => setIsDropdownOpen(jobs.length > 0)}
              placeholder="Search Job ID, Job Name, or Client"
              required
              aria-required="true"
              className="glass-input h-12 w-full px-4"
            />

            {isDropdownOpen && jobs.length > 0 ? (
              <div className="rubric-job-dropdown panel-border absolute left-0 right-0 top-[calc(100%+10px)] z-20 overflow-hidden rounded-[16px] bg-[var(--card)] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
                <div className="grid grid-cols-[120px_1fr_1fr] gap-3 border-b border-white/8 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <span>Job ID</span>
                  <span>Job Name</span>
                  <span>Client</span>
                </div>
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => {
                      setSelectedJob(job);
                      setQuery(job.id);
                      setIsDropdownOpen(false);
                    }}
                    className="grid w-full grid-cols-[120px_1fr_1fr] gap-3 border-t border-white/6 px-4 py-3 text-left transition-colors duration-200 hover:bg-cyan-400/8"
                  >
                    <span className="rubric-job-id font-medium">{job.id}</span>
                    <span className="opal-text-body">{job.name}</span>
                    <span className="opal-text-muted">{job.client}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button type="button" onClick={refreshFromManatal} className="glass-button rounded-[10px] px-4 py-3 text-[11px] font-semibold">
            Refresh from Manatal
          </button>
        </div>

        {selectedJob ? (
          <div className="flex flex-wrap gap-3">
            <DetailPill label="Job Name" value={selectedJob.name} />
            <DetailPill label="Client" value={selectedJob.client} />
          </div>
        ) : null}

        {status ? <StatusBox status={status} /> : null}

        <button type="button" onClick={generateRubric} className="primary-button min-h-[54px] w-full rounded-[14px] px-5">
          Generate Rubric
        </button>

        {rubric ? (
          <div className="panel-border rounded-[16px] bg-white/[0.02] p-5">
            <pre className="opal-text-body whitespace-pre-wrap font-sans leading-7">{rubric}</pre>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CvFormatterTab() {
  type PreviewTab = "original" | "formatted";

  const [candidateName, setCandidateName] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<StatusMessage>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [rightPanelTab, setRightPanelTab] = useState<PreviewTab>("original");
  const [originalFileUrl, setOriginalFileUrl] = useState("");
  const [originalPreviewHtml, setOriginalPreviewHtml] = useState("");
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState("");
  const [originalPreviewError, setOriginalPreviewError] = useState("");
  const [isOriginalPreviewLoading, setIsOriginalPreviewLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const originalPreviewRef = useRef<HTMLDivElement | null>(null);
  const formatAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!file) {
      return;
    }
    const ac = new AbortController();
    const fd = new FormData();
    fd.append("file", file);

    void fetch("/api/cv-suggest-name", { method: "POST", body: fd, signal: ac.signal })
      .then((r) => r.json())
      .then((d: { suggestedName?: string | null }) => {
        const suggested = (d.suggestedName ?? "").trim();
        if (!suggested) {
          return;
        }
        setCandidateName((prev) => (prev.trim() ? prev : suggested));
      })
      .catch(() => {});

    return () => ac.abort();
  }, [file]);

  function renderWordPreview(html: string) {
    if (previewRef.current) {
      previewRef.current.innerHTML = html;
    }
  }

  useEffect(() => {
    renderWordPreview(previewHtml);
  }, [previewHtml]);

  useEffect(() => {
    if (originalPreviewRef.current) {
      originalPreviewRef.current.innerHTML = originalPreviewHtml;
    }
  }, [originalPreviewHtml]);

  useEffect(() => {
    if (!file) {
      setOriginalFileUrl("");
      setOriginalPreviewHtml("");
      setOriginalPreviewUrl("");
      setOriginalPreviewError("");
      setIsOriginalPreviewLoading(false);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    let isCancelled = false;
    setOriginalFileUrl(objectUrl);

    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    setOriginalPreviewHtml("");
    setOriginalPreviewUrl("");
    setOriginalPreviewError("");

    if (!isPdf) {
      setIsOriginalPreviewLoading(true);

      const requestBody = new FormData();
      requestBody.append("file", file);

      fetch("/api/cv-original-preview", {
        method: "POST",
        body: requestBody
      })
        .then(async (response) => {
          const data = (await response.json()) as {
            previewType?: "html" | "pdf";
            previewHtml?: string;
            previewUrl?: string;
            error?: string;
          };

          if (!response.ok) {
            throw new Error(data.error ?? "Unable to build original CV preview.");
          }

          if (isCancelled) {
            return;
          }

          if (data.previewType === "pdf" && data.previewUrl) {
            setOriginalPreviewUrl(data.previewUrl);
            setOriginalPreviewHtml("");
            return;
          }

          setOriginalPreviewHtml(data.previewHtml ?? "");
          setOriginalPreviewUrl("");
        })
        .catch((error) => {
          if (isCancelled) {
            return;
          }
          setOriginalPreviewError(
            error instanceof Error ? error.message : "Unable to build original CV preview."
          );
        })
        .finally(() => {
          if (isCancelled) {
            return;
          }
          setIsOriginalPreviewLoading(false);
        });
    } else {
      setIsOriginalPreviewLoading(false);
    }

    return () => {
      isCancelled = true;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  function cancelFormatRequest() {
    formatAbortRef.current?.abort();
  }

  async function formatCv() {
    if (!file || !candidateName.trim()) {
      setStatus({ state: "error", message: "Add a candidate name and attach a PDF or DOCX before formatting." });
      return;
    }

    formatAbortRef.current?.abort();
    const ac = new AbortController();
    formatAbortRef.current = ac;

    setStatus({ state: "loading", message: "Formatting…" });
    const formData = new FormData();
    formData.append("candidateName", candidateName.trim());
    formData.append("file", file);

    try {
      const response = await fetch("/api/cv-format", {
        method: "POST",
        body: formData,
        signal: ac.signal
      });
      const data = (await response.json()) as {
        previewHtml?: string;
        downloadUrl?: string;
        error?: string;
        detail?: string;
        hint?: string;
      };

      if (!response.ok) {
        const parts = [data.error, data.detail, data.hint].filter(Boolean);
        throw new Error(parts.length > 0 ? parts.join(" — ") : "Unable to format CV.");
      }

      setPreviewHtml(data.previewHtml ?? "");
      setDownloadUrl(data.downloadUrl ?? "");
      setRightPanelTab("formatted");
      setStatus({ state: "success", message: "Formatted CV preview generated successfully." });
    } catch (error) {
      const aborted =
        (error instanceof DOMException && error.name === "AbortError") ||
        (typeof error === "object" &&
          error !== null &&
          "name" in error &&
          (error as { name: string }).name === "AbortError");
      if (aborted) {
        setStatus({ state: "error", message: "Formatting was cancelled." });
      } else {
        setStatus({
          state: "error",
          message: error instanceof Error ? error.message : "Unexpected CV formatting error."
        });
      }
    } finally {
      if (formatAbortRef.current === ac) {
        formatAbortRef.current = null;
      }
    }
  }

  const selectedFileLabel = useMemo(() => {
    if (!file) {
      return "Drop PDF or DOCX here, or browse to upload";
    }

    return `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  }, [file]);

  const isFormatting = status?.state === "loading";

  function clearCvFormatter() {
    setCandidateName("");
    setFile(null);
    setFileInputKey((k) => k + 1);
    setStatus(null);
    setPreviewHtml("");
    setDownloadUrl("");
    setRightPanelTab("original");
  }

  const hasOriginalFile = Boolean(file && originalFileUrl);
  const isOriginalPdf = Boolean(file && file.name.toLowerCase().endsWith(".pdf"));
  const outputIsPaper = rightPanelTab === "formatted" && Boolean(previewHtml);

  return (
    <div className="cv-formatter-root flex h-full min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <section className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[340px_1fr]">
      <div className="surface-card flex h-full min-h-0 flex-col gap-5 overflow-y-auto p-5">
        <div>
          <SectionLabel className="!text-[color:var(--muted)]">Upload Candidate CV *</SectionLabel>
          <label className="cv-formatter-upload-label panel-border mt-3 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[16px] px-5 py-6 text-center transition-colors duration-200">
            <div className="cv-formatter-upload-icon grid h-12 w-12 place-items-center rounded-[14px]">
              <UploadIcon />
            </div>
            <div className="mt-4 text-[13px] font-semibold text-[color:var(--text)]">{selectedFileLabel}</div>
            <div className="mt-2 text-[11px] text-[color:var(--muted)]">Accepted formats: PDF or DOCX</div>
            <input
              key={fileInputKey}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setRightPanelTab("original");
              }}
              required
              aria-required="true"
            />
          </label>
        </div>

        <div>
          <SectionLabel className="!text-[color:var(--muted)]">Candidate Name *</SectionLabel>
          <input
            value={candidateName}
            onChange={(event) => setCandidateName(event.target.value)}
            placeholder="Enter full candidate name"
            required
            aria-required="true"
            className="glass-input mt-3 h-12 w-full px-4"
          />
        </div>

        <div className="flex min-h-[54px] gap-3">
          <button
            type="button"
            onClick={formatCv}
            disabled={isFormatting}
            className="primary-button flex min-h-[54px] min-w-0 flex-1 items-center justify-center rounded-[14px] px-5 text-[13px] font-semibold disabled:pointer-events-none disabled:opacity-55"
          >
            {isFormatting ? "Formatting…" : "Format CV"}
          </button>
          <button
            type="button"
            onClick={isFormatting ? cancelFormatRequest : clearCvFormatter}
            className="glass-button flex min-h-[54px] shrink-0 items-center justify-center rounded-[14px] px-4 text-[12px] font-semibold disabled:pointer-events-none disabled:opacity-55"
          >
            {isFormatting ? "Cancel" : "Clear"}
          </button>
        </div>

        {status?.state === "loading" ? (
          <div
            className="cv-formatter-status panel-border flex flex-col gap-3 rounded-[10px] px-4 py-3 status-loading"
            role="status"
            aria-busy="true"
            aria-label="Formatting CV in progress"
          >
            <div className="flex items-center gap-2 text-[13px] font-medium text-[color:var(--cyan)]">
              <ClockIcon />
              <span>Formatting CV…</span>
            </div>
            <div className="cv-format-progress-track cv-formatter-progress w-full max-w-full">
              <div className="cv-format-progress-bar cv-formatter-progress-bar" />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[color:var(--muted)]">
              Use Cancel to stop — otherwise keep this tab open
            </p>
          </div>
        ) : status ? (
          <StatusBox status={status} className="cv-formatter-status" />
        ) : null}
      </div>

      <div className="surface-card flex h-full min-h-0 flex-col overflow-y-auto p-5">
        <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              id="cvDot"
              className={`h-2.5 w-2.5 rounded-full ${
                isFormatting
                  ? "animate-pulse bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.55)]"
                  : previewHtml
                    ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]"
                    : "cv-formatter-dot-idle"
              }`}
            />
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
              CV Format
            </span>
            <div className="cv-formatter-seg-wrap inline-flex p-1">
              <button
                type="button"
                onClick={() => setRightPanelTab("original")}
                className="cv-formatter-seg-btn"
                data-active={rightPanelTab === "original" ? "true" : "false"}
              >
                Ori Format
              </button>
              <button
                type="button"
                onClick={() => setRightPanelTab("formatted")}
                className="cv-formatter-seg-btn"
                data-active={rightPanelTab === "formatted" ? "true" : "false"}
              >
                Oxy Format
              </button>
            </div>
          </div>
          {rightPanelTab === "formatted" ? (
            <a
              id="btnDownload"
              href={downloadUrl || "#"}
              download={downloadUrl ? `${candidateName || "candidate"}-oxydata.doc` : undefined}
              onClick={(event) => {
                if (!downloadUrl) {
                  event.preventDefault();
                }
              }}
              className={`cv-formatter-download glass-button rounded-lg px-3 py-1.5 text-xs ${!downloadUrl ? "pointer-events-none opacity-30" : ""}`}
              aria-disabled={!downloadUrl}
            >
              Download
            </a>
          ) : null}
        </div>

        <div
          id="cvOutputBox"
          aria-busy={rightPanelTab === "formatted" ? isFormatting : false}
          className={`panel-border flex min-h-0 flex-1 flex-col rounded-[16px] ${outputIsPaper ? "cv-formatter-output--paper" : "cv-formatter-output--chrome"} ${
            rightPanelTab === "formatted" ? "overflow-y-auto overflow-x-hidden" : "overflow-hidden"
          }`}
        >
          {rightPanelTab === "original" && !hasOriginalFile ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-8">
              <div className="cv-formatter-empty-wrap">
                <EmptyState
                  title="No CV loaded yet"
                  subtitle="Upload a CV file to preview the original document in this panel."
                  icon={<DocumentIcon />}
                  iconClassName="cv-formatter-empty-icon"
                />
              </div>
            </div>
          ) : null}

          {rightPanelTab === "original" && hasOriginalFile && isOriginalPdf ? (
            <iframe
              title="Original CV preview"
              src={originalFileUrl}
              className="min-h-0 w-full flex-1 border-0 bg-white"
            />
          ) : null}

          {rightPanelTab === "original" && hasOriginalFile && !isOriginalPdf && isOriginalPreviewLoading ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="cv-formatter-empty-icon grid h-12 w-12 place-items-center rounded-[14px]">
                <ClockIcon />
              </div>
              <p className="text-[14px] font-semibold text-[color:var(--text)]">Building original preview</p>
              <p className="max-w-sm text-[12px] leading-relaxed text-[color:var(--muted)]">
                Converting the uploaded file to an inline preview format.
              </p>
            </div>
          ) : null}

          {rightPanelTab === "original" && hasOriginalFile && !isOriginalPdf && !isOriginalPreviewLoading && originalPreviewError ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-8">
              <div className="cv-formatter-empty-wrap">
                <EmptyState
                  title="Original preview unavailable"
                  subtitle={originalPreviewError}
                  icon={<DocumentIcon />}
                  iconClassName="cv-formatter-empty-icon"
                />
              </div>
            </div>
          ) : null}

          {rightPanelTab === "original" && hasOriginalFile && !isOriginalPdf && !isOriginalPreviewLoading && Boolean(originalPreviewUrl) ? (
            <iframe
              title="Original CV preview"
              src={originalPreviewUrl}
              className="min-h-0 w-full flex-1 border-0 bg-white"
            />
          ) : null}

          <div
            ref={originalPreviewRef}
            className={
              rightPanelTab === "original" &&
              hasOriginalFile &&
              !isOriginalPdf &&
              !isOriginalPreviewLoading &&
              !originalPreviewError &&
              Boolean(originalPreviewHtml)
                ? "min-h-0 flex-1 overflow-y-auto bg-white p-4 text-slate-800 sm:p-6"
                : "hidden"
            }
          />

          {rightPanelTab === "formatted" && isFormatting ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
              <div className="cv-formatter-empty-icon grid h-14 w-14 place-items-center rounded-[16px]">
                <ClockIcon />
              </div>
              <div className="w-full max-w-md">
                <p className="text-[15px] font-semibold text-[color:var(--text)]">Converting your CV</p>
                <div className="cv-format-progress-track cv-formatter-progress mt-4 w-full max-w-full">
                  <div className="cv-format-progress-bar cv-formatter-progress-bar" />
                </div>
                <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-[color:var(--muted)]">
                  Parsing the document and building the Oxydata Word layout. This can take up to a minute.
                </p>
              </div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--muted)]">
                Use Cancel in the left panel to stop
              </p>
            </div>
          ) : null}
          {rightPanelTab === "formatted" && !previewHtml && !isFormatting ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-8">
              <div className="cv-formatter-empty-wrap">
                <EmptyState
                  title="No formatted CV yet"
                  subtitle="Upload a CV and run the formatter to generate a Word-style preview here."
                  icon={<DocumentIcon />}
                  iconClassName="cv-formatter-empty-icon"
                />
              </div>
            </div>
          ) : null}
          <div
            ref={previewRef}
            className={rightPanelTab === "formatted" && previewHtml ? "min-h-0 flex-1 overflow-y-auto p-4 sm:p-6" : "hidden"}
          />
        </div>
      </div>
    </section>
    </div>
  );
}

function AiCandidateScoringTab() {
  const [pipelineStage, setPipelineStage] = useState("New Candidates");
  const [tierThreshold, setTierThreshold] = useState("65");

  type JobIdField = { query: string; selectedId: string; selectedName: string };
  const [jobIdFields, setJobIdFields] = useState<JobIdField[]>([{ query: "", selectedId: "", selectedName: "" }]);
  const [jobSuggestions, setJobSuggestions] = useState<Record<number, JobRecord[]>>({});
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

  const [isTechnicalLogVisible, setIsTechnicalLogVisible] = useState(false);
  const [progressEntries, setProgressEntries] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const updates: Record<number, JobRecord[]> = {};
      
      for (let i = 0; i < jobIdFields.length; i++) {
        const query = jobIdFields[i].query.trim();
        if (!query) {
          updates[i] = [];
          continue;
        }

        try {
          const response = await fetch(`/api/rubric?query=${encodeURIComponent(query)}`);
          const data = (await response.json()) as { jobs?: JobRecord[] };
          updates[i] = (data.jobs ?? []).slice(0, 6);
        } catch (error) {
          updates[i] = [];
        }
      }

      setJobSuggestions(updates);
    };

    fetchSuggestions();
  }, [jobIdFields]);

  const addJobIdField = () => {
    setJobIdFields((prev) => [...prev, { query: "", selectedId: "", selectedName: "" }]);
  };

  const removeJobIdField = (index: number) => {
    setJobIdFields((prev) => prev.filter((_, i) => i !== index));
  };

  const updateJobIdQuery = (index: number, query: string) => {
    setJobIdFields((prev) => {
      const updated = [...prev];
      updated[index] = { query, selectedId: "", selectedName: "" };
      return updated;
    });
    setOpenDropdownIndex(index);
  };

  const selectJobIdSuggestion = (index: number, job: JobRecord) => {
    setJobIdFields((prev) => {
      const updated = [...prev];
      updated[index] = { query: `${job.id} - ${job.name}`, selectedId: job.id, selectedName: job.name };
      return updated;
    });
    setOpenDropdownIndex(null);
  };

  const runScoring = async () => {
    const filledJobIds = jobIdFields.filter((field) => field.selectedId.trim());
    if (!filledJobIds.length) {
      setProgressEntries((prev) => [...prev, "❗ Add at least one Job ID before running scoring."]);
      return;
    }

    setIsRunning(true);
    setProgressEntries([`▶ Started candidate AI scoring for ${filledJobIds.length} job ID(s)`]);

    for (const field of filledJobIds) {
      setProgressEntries((prev) => [...prev, `⏳ Scoring candidates for ${field.selectedId}...`]);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setProgressEntries((prev) => [...prev, `✅ Completed ${field.selectedId} at quick score threshold ${tierThreshold}%`]);
    }

    setProgressEntries((prev) => [...prev, `✔ Pipeline stage set to ${pipelineStage}.`]);
    setIsRunning(false);
  };

  return (
    <section className="surface-card p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Pipeline Stage</label>
          <input value={pipelineStage} onChange={(e) => setPipelineStage(e.target.value)} className="glass-input h-11 w-full px-3" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Quick Score Threshold (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={tierThreshold}
            onChange={(e) => setTierThreshold(e.target.value)}
            className="glass-input h-11 w-full px-3"
          />
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {jobIdFields.map((field, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1 relative">
              <label className="mb-1 block text-sm font-medium text-slate-300">Job ID (search)</label>
              <input
                value={field.query}
                onChange={(e) => updateJobIdQuery(index, e.target.value)}
                onFocus={() => (jobSuggestions[index]?.length ?? 0) > 0 && setOpenDropdownIndex(index)}
                placeholder="Start typing job id or name..."
                required
                aria-required="true"
                className="glass-input h-11 w-full px-3"
              />
              {openDropdownIndex === index && (jobSuggestions[index]?.length ?? 0) > 0 ? (
                <div className="panel-border absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-[16px] bg-[var(--surface)] shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 border-b border-white/8 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <span>Job ID</span>
                    <span>Job Name</span>
                    <span>Client</span>
                  </div>
                  {jobSuggestions[index]?.map((job) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => selectJobIdSuggestion(index, job)}
                      className="grid w-full grid-cols-[120px_1fr_1fr] gap-3 border-t border-[var(--border)] px-4 py-3 text-left transition-colors duration-200 hover:bg-cyan-400/8"
                    >
                      <span className="text-cyan-400">{job.id}</span>
                      <span className="text-slate-100">{job.name}</span>
                      <span className="text-slate-400">{job.client}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {jobIdFields.length > 1 && (
              <button
                onClick={() => removeJobIdField(index)}
                className="glass-button rounded-lg px-3 py-2 text-sm"
                style={{ marginTop: "24px" }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button 
          onClick={addJobIdField} 
          disabled={!jobIdFields[jobIdFields.length - 1]?.selectedId}
          className="primary-button rounded-[10px] px-4 py-2 disabled:opacity-50"
        >
          + Add more Job IDs
        </button>
        <button onClick={runScoring} className="glass-button rounded-[10px] px-20 py-2 font-semibold">
          ▶ AI Scoring
        </button>
      </div>

      <div className="pipeline-progress-box mt-5 rounded-[10px] border border-white/20 bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">Pipeline Progress</h3>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={isTechnicalLogVisible}
              onChange={(e) => setIsTechnicalLogVisible(e.target.checked)}
              className="h-4 w-4 rounded border border-white/30 bg-black/30"
            />
            Show technical log
          </label>
        </div>

        {progressEntries.length === 0 ? (
          <p className="text-sm text-slate-400">Progress will appear here once you start a run.</p>
        ) : (
          <ul className="max-h-40 space-y-1 overflow-y-auto text-sm text-slate-200">
            {progressEntries.map((entry, idx) => (
              <li key={`${entry}-${idx}`}>{entry}</li>
            ))}
          </ul>
        )}

        {isTechnicalLogVisible ? (
          <div className="technical-log-strip mt-3 rounded-lg border border-white/10 bg-black/20 p-2 text-xs text-slate-300">
            Technical log active (details are currently mock data for UI).
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ViewScoringTab() {
  const [sortBy, setSortBy] = useState<"t1_score" | "t2_score" | "name">("t1_score");
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedJobId, setSelectedJobId] = useState("all");

  const scoringRecords = [
    {
      id: "rec001",
      clientName: "TechCorp Inc",
      jobId: "JOB001",
      jobName: "Senior Engineer",
      fullName: "Irene Ong",
      t1Score: 85,
      t2Score: 100,
      trafficLight: "green",
      aiSummary: "Irene Ong is a highly qualified candidate with extensive experience in B2B sales, consultative selling, and AI solutions. She meets all critical criteria.",
      aiStrengths: "B2B sales experience, consultative selling, communication skills, AI solutions expertise",
      aiGaps: "none"
    },
    {
      id: "rec002",
      clientName: "TechCorp Inc",
      jobId: "JOB001",
      jobName: "Senior Engineer",
      fullName: "Kantesh Guttal",
      t1Score: 95,
      t2Score: 91,
      trafficLight: "green",
      aiSummary: "Kantesh Guttal is highly qualified with extensive Salesforce experience and certifications. Strong expertise in Sales Cloud and Flow Builder.",
      aiStrengths: "Salesforce expertise, certifications, functional analysis, Flow Builder, Sales Cloud",
      aiGaps: "none identified"
    },
    {
      id: "rec003",
      clientName: "TechCorp Inc",
      jobId: "JOB001",
      jobName: "Senior Engineer",
      fullName: "Benny Murdani",
      t1Score: 95,
      t2Score: 87,
      trafficLight: "yellow",
      aiSummary: "Benny Murdani is highly qualified with extensive Salesforce experience and certifications. He excels in Sales Cloud and Flow Builder delivery.",
      aiStrengths: "Extensive Salesforce experience, Sales Cloud expertise, Flow Builder expertise, certifications",
      aiGaps: "No experience with Sales Einstein"
    },
    {
      id: "rec004",
      clientName: "InnovateLabs",
      jobId: "JOB002",
      jobName: "Product Manager",
      fullName: "Romil Srivastava",
      t1Score: 85,
      t2Score: 87,
      trafficLight: "green",
      aiSummary: "Romil Srivastava is a strong product candidate with structured delivery exposure and relevant cross-functional leadership experience.",
      aiStrengths: "Stakeholder management, product delivery, documentation, roadmap alignment",
      aiGaps: "Limited analytics tooling depth"
    },
    {
      id: "rec005",
      clientName: "InnovateLabs",
      jobId: "JOB002",
      jobName: "Product Manager",
      fullName: "Jasjeet Singh Siddhu",
      t1Score: 85,
      t2Score: 86,
      trafficLight: "red",
      aiSummary: "Jasjeet Singh Siddhu shows strong technical engineering fundamentals but is a weaker direct fit for the target product profile.",
      aiStrengths: "FastAPI, React.js, CI/CD pipelines, Python proficiency",
      aiGaps: "Limited product ownership experience"
    },
    {
      id: "rec006",
      clientName: "SecureOps",
      jobId: "JOB003",
      jobName: "Security Engineer",
      fullName: "Jonathan Eusebio Yang",
      t1Score: 95,
      t2Score: 85,
      trafficLight: "green",
      aiSummary: "Jonathan Yang is a highly experienced security engineer with strong SOC and SIEM expertise, particularly in Microsoft environments.",
      aiStrengths: "SOC experience, SIEM expertise, endpoint protection, cloud security",
      aiGaps: "Limited scripting experience"
    },
    {
      id: "rec007",
      clientName: "SecureOps",
      jobId: "JOB003",
      jobName: "Security Engineer",
      fullName: "Alisha Nagarkar",
      t1Score: 85,
      t2Score: 85,
      trafficLight: "yellow",
      aiSummary: "The candidate meets core compliance requirements and demonstrates relevant systems administration and support strengths.",
      aiStrengths: "Administration, process discipline, platform support, certifications",
      aiGaps: "Hands-on SIEM depth"
    }
  ];

  const clientOptions = Array.from(new Set(scoringRecords.map((record) => record.clientName))).sort();
  const jobIdOptions = Array.from(new Set(scoringRecords.map((record) => record.jobId))).sort();

  const filteredRecords = scoringRecords.filter((record) => {
    const matchesClient = selectedClient === "all" || record.clientName === selectedClient;
    const matchesJobId = selectedJobId === "all" || record.jobId === selectedJobId;
    return matchesClient && matchesJobId;
  });

  const groupedRecords = Object.values(
    filteredRecords.reduce<Record<string, { clientName: string; jobId: string; jobName: string; records: typeof filteredRecords }>>((groups, record) => {
      const key = `${record.clientName}|||${record.jobId}|||${record.jobName}`;
      if (!groups[key]) {
        groups[key] = {
          clientName: record.clientName,
          jobId: record.jobId,
          jobName: record.jobName,
          records: []
        };
      }
      groups[key].records.push(record);
      return groups;
    }, {})
  ).map((group) => ({
    ...group,
    records: [...group.records].sort((a, b) => {
      if (sortBy === "t1_score") return b.t1Score - a.t1Score;
      if (sortBy === "t2_score") return b.t2Score - a.t2Score;
      return a.fullName.localeCompare(b.fullName);
    })
  }));

  const getTrafficLightColor = (light: string) => {
    if (light === "green") return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
    if (light === "yellow") return "bg-amber-500 shadow-[0_0_8px_rgba(217,119,6,0.6)]";
    return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]";
  };

  return (
    <section className="surface-card p-5">
      <h2 className="mb-4 text-[15px] font-bold tracking-[0.12em] uppercase text-cyan-300">View Scoring</h2>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-300">Client</label>
          <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="glass-input h-10 rounded-lg bg-[#0f172a] px-3 py-2 text-sm text-white">
            <option value="all">All Clients</option>
            {clientOptions.map((client) => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-300">Job ID</label>
          <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)} className="glass-input h-10 rounded-lg bg-[#0f172a] px-3 py-2 text-sm text-white">
            <option value="all">All Job IDs</option>
            {jobIdOptions.map((jobId) => (
              <option key={jobId} value={jobId}>{jobId}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-300">Sort by</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "t1_score" | "t2_score" | "name")} className="glass-input h-10 rounded-lg bg-[#0f172a] px-3 py-2 text-sm text-white">
            <option value="t1_score">Tier 1 Score</option>
            <option value="t2_score">Tier 2 Score</option>
            <option value="name">Candidate Name</option>
          </select>
        </div>
      </div>

      <div className="space-y-5">
        {groupedRecords.map((group) => (
          <div key={`${group.clientName}-${group.jobId}-${group.jobName}`} className="overflow-hidden rounded-[16px] border border-white/10 bg-white/[0.02]">
            <div className="grid gap-4 border-b border-white/10 bg-white/[0.04] px-4 py-4 md:grid-cols-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Client Name</div>
                <div className="mt-1 text-sm font-semibold text-slate-100">{group.clientName}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Job ID</div>
                <div className="mt-1 text-sm font-semibold text-cyan-300">{group.jobId}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Job Name</div>
                <div className="mt-1 text-sm font-semibold text-slate-100">{group.jobName}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-left text-sm text-slate-200">
                <thead className="bg-white/[0.02] text-[11px] uppercase tracking-[0.12em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3 text-right">T1 Score</th>
                    <th className="px-4 py-3 text-right">T2 Score</th>
                    <th className="px-4 py-3 text-center">Traffic</th>
                    <th className="px-4 py-3 min-w-[320px]">AI Summary</th>
                    <th className="px-4 py-3 min-w-[280px]">AI Strengths</th>
                    <th className="px-4 py-3 min-w-[220px]">AI Gaps</th>
                  </tr>
                </thead>
                <tbody>
                  {group.records.map((record) => (
                    <tr key={record.id} className="border-t border-white/10 transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium text-slate-100">{record.fullName}</td>
                      <td className="px-4 py-3 text-right font-semibold text-cyan-300">{record.t1Score}</td>
                      <td className="px-4 py-3 text-right font-semibold text-cyan-300">{record.t2Score}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block h-4 w-4 rounded-full ${getTrafficLightColor(record.trafficLight)}`} />
                      </td>
                      <td className="px-4 py-3 text-xs leading-5 text-slate-300">{record.aiSummary}</td>
                      <td className="px-4 py-3 text-xs leading-5 text-slate-300">{record.aiStrengths}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{record.aiGaps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {groupedRecords.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center text-sm text-slate-400">
            No scoring records match the selected filters.
          </div>
        ) : null}
      </div>

      <div className="mt-4 text-xs text-slate-400">
        Showing {filteredRecords.length} records across {groupedRecords.length} group{groupedRecords.length === 1 ? "" : "s"}.
      </div>
    </section>
  );
}

function ViewAirtableTab() {
  return (
    <section className="surface-card p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-bold uppercase tracking-[0.12em] text-cyan-300">View Airtable</h2>
        </div>
        <a
          href={AIRTABLE_EMBED_URL.replace("/embed/", "/")}
          target="_blank"
          rel="noreferrer"
          className="glass-button rounded-[10px] px-4 py-2 text-xs font-semibold"
        >
          Open in Airtable
        </a>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-white/10 bg-white">
        <iframe
          src={AIRTABLE_EMBED_URL}
          title="Airtable Embedded View"
          className="h-[706px] w-full border-0"
          loading="lazy"
        />
      </div>
    </section>
  );
}

export function HiringStrategyTab({ mode = "embedded" }: { mode?: "embedded" | "standalone" }) {
  type OutputType = "Full Playbook" | "Sourcing Strings Only" | "Channel Plan Only" | "Foundit Boolean";
  type HistoryItem = {
    id: string;
    role: string;
    outputType: OutputType;
    generatedAt: string;
    rawOutput: string;
  };

  const ALL_NATIONALITIES = ["Malaysian", "Indian", "Pakistani", "Sri Lankan", "Filipino", "Indonesian"];
  const SOURCE_LOCATIONS = ["Malaysia", "India", "Pakistan", "Sri Lanka", "Philippines", "Indonesia"];
  const CONSTRAINT_OPTIONS = ["Malaysian only", "Contract (no JobStreet DB)", "Prefer immediate joiners"];

  const [role, setRole] = useState("Data Engineer");
  const [roleType, setRoleType] = useState<"Permanent" | "Contract">("Permanent");
  const [workLocation, setWorkLocation] = useState("Malaysia");
  const [sourceLocation, setSourceLocation] = useState<string[]>(["Malaysia"]);
  const [nationalityOpen, setNationalityOpen] = useState(true);
  const [nationality, setNationality] = useState<string[]>([]);
  const [monthlySalary, setMonthlySalary] = useState(14000);
  const [currency, setCurrency] = useState<"MYR" | "USD" | "SGD" | "INR">("MYR");
  const [yearsMin, setYearsMin] = useState(3);
  const [yearsMax, setYearsMax] = useState(6);
  const [mustHaveSkills, setMustHaveSkills] = useState("Python, Azure Machine Learning, React.JS");
  const [noticePeriod, setNoticePeriod] = useState("30 days");
  const [excludeKeywords, setExcludeKeywords] = useState("");
  const [constraints, setConstraints] = useState<string[]>([]);
  const [outputType, setOutputType] = useState<OutputType>("Full Playbook");

  const [rawOutput, setRawOutput] = useState("");
  const [playbookGeneratedAt, setPlaybookGeneratedAt] = useState<string | null>(null);
  const [historyViewRole, setHistoryViewRole] = useState<string | null>(null);
  const [historyViewOutputType, setHistoryViewOutputType] = useState<OutputType | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showYaml, setShowYaml] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedExample, setSelectedExample] = useState<"example1" | "example2">("example1");
  const [dividerX, setDividerX] = useState(50);
  const [dragging, setDragging] = useState(false);
  const hiringGridRef = useRef<HTMLElement | null>(null);

  const expandedNationality = nationalityOpen ? ALL_NATIONALITIES : nationality;
  const isMalaysianOnly = !nationalityOpen && nationality.length === 1 && nationality[0] === "Malaysian";
  const isTechnicalRole = /(engineer|developer|architect|data|cloud|devops|qa|security|analyst|ai|ml)/i.test(role);
  const showNoLinkedinAdsWarning = isMalaysianOnly && isTechnicalRole;
  const showContractMalaysiaWarning = roleType === "Contract" && workLocation === "Malaysia";

  useEffect(() => {
    try {
      const stored = localStorage.getItem("opal.hiring.strategy.history");
      if (!stored) return;
      const parsed = JSON.parse(stored) as HistoryItem[];
      setHistory(
        Array.isArray(parsed)
          ? parsed.slice(0, 10).map((entry) => ({
              id: entry.id,
              role: entry.role,
              outputType: entry.outputType,
              generatedAt: entry.generatedAt,
              rawOutput: entry.rawOutput
            }))
          : []
      );
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("opal.hiring.strategy.history", JSON.stringify(history.slice(0, 10)));
  }, [history]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const el = hiringGridRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setDividerX(Math.max(22, Math.min(78, pct)));
    };
    const onUp = () => setDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const asList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const yamlText = `role: "${role}"
role_type: "${roleType}"
work_location: "${workLocation}"
source_location:
${sourceLocation.map((item) => `  - ${item}`).join("\n")}
nationality: ${nationalityOpen ? '"Open"' : `\n${expandedNationality.map((item) => `  - ${item}`).join("\n")}`}
monthly_salary: ${monthlySalary}
currency: "${currency}"
years_experience:
  min: ${yearsMin}
  max: ${yearsMax}
must_have_skills:
${asList(mustHaveSkills).map((item) => `  - ${item}`).join("\n")}
notice_period: "${noticePeriod}"
exclude_keywords:
${asList(excludeKeywords).length ? asList(excludeKeywords).map((item) => `  - ${item}`).join("\n") : "  -"}
constraints:
${constraints.length ? constraints.map((item) => `  - ${item}`).join("\n") : "  -"}
`;

  const trigger =
    outputType === "Full Playbook"
      ? "/playbook"
      : outputType === "Sourcing Strings Only"
        ? "/sourcing"
        : outputType === "Channel Plan Only"
          ? "/channel"
          : "/foundit";

  const copyText = async (text: string, label = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("success");
      setStatusMessage(`${label} to clipboard.`);
    } catch {
      setStatus("error");
      setStatusMessage("Unable to copy to clipboard.");
    }
  };

  const buildMockOutput = (requestedType: OutputType) => {
    const skills = asList(mustHaveSkills);
    const excludes = asList(excludeKeywords);
    const founditBoolean = `("${role}" OR "${role.replace(/\bSenior\b/gi, "Lead")}" OR "${role.replace(/\bEngineer\b/gi, "Developer")}") AND (${skills.slice(0, 3).map((s) => `"${s}"`).join(" OR ")})${excludes.length ? ` NOT (${excludes.map((e) => `"${e}"`).join(" OR ")})` : ""}`;
    if (requestedType === "Foundit Boolean") {
      return `## 1. Boolean String
${founditBoolean}

## 2. Filters to Apply
- Location: ${sourceLocation.join(", ")}
- Experience: ${yearsMin}-${yearsMax} years
- Salary: up to ${currency} ${monthlySalary}

## 3. Execution Steps
1. Start in Manatal ATS and match existing applicants first.
2. Run Foundit Boolean with filters.
3. Capture shortlisted candidates into Manatal with source tags.`;
    }
    if (requestedType === "Channel Plan Only") {
      return `## 1. Recommended Channels by Geography
- ${workLocation}: Manatal + Foundit + LinkedIn Recruiter Lite
- Source markets: ${sourceLocation.join(", ")}

## 2. Channel Allocation Notes
- Owned tools first: Foundit/Monster before new spend
- Expand to paid channels only when shortlist volume is below target

## 3. Priority Order
1. Manatal ATS matching
2. Foundit/Monster sourcing
3. LinkedIn Recruiter Lite sourcing
4. Paid ads only if pipeline is below target`;
    }
    if (requestedType === "Sourcing Strings Only") {
      return `## 1. Foundit Boolean + Filters
${founditBoolean}

## 2. LinkedIn Search String + Filters
("${role}" OR "${role.replace(/\bSenior\b/gi, "Lead")}") AND (${skills.map((s) => `"${s}"`).join(" OR ")})

## 3. JobStreet Execution Note
Use posting first; database usage depends on role type and country constraints.

## 4. Naukri Execution Note
${sourceLocation.includes("India") ? "India in source market: use Resdex + nvite before posting." : "Not required for current source markets."}

## 5. Optional Widen-Search Version
Broaden years range to ${Math.max(0, yearsMin - 1)}-${yearsMax + 2} and remove one narrow skill.`;
    }
    return `## 1. Executive Summary
Start in Manatal ATS (matching + talent pool) before external sourcing. Role: ${role}, ${roleType}, ${workLocation}.

## 2. Role and Market Snapshot
Monthly salary: ${currency} ${monthlySalary}
Source markets: ${sourceLocation.join(", ")}

## 3. Talent Availability
Primary source markets: ${sourceLocation.join(", ")}.
Target experience: ${yearsMin}-${yearsMax} years.

## 4. Channel Plan
Owned/prepaid first (Foundit/Monster), then LinkedIn Recruiter Lite sourcing, then paid ads only if needed.

## 5. Sourcing Actions
1) Manatal ATS search and rediscovery
2) Foundit Boolean + filters
3) LinkedIn sourcing sequence
4) Outreach cadence and follow-up

## 6. Search Strings
Foundit: ${founditBoolean}
LinkedIn: ("${role}" OR "${role.replace(/\bSenior\b/gi, "Lead")}") AND (${skills.map((s) => `"${s}"`).join(" OR ")})

## 7. Outreach Templates
Short intro + role fit + CTA to schedule.

## 8. 7-Day Execution Timeline
Day 1-2 source list build, Day 3-4 outreach, Day 5-6 screening, Day 7 shortlist review.`;
  };

  const saveHistory = (nextRaw: string) => {
    const item: HistoryItem = {
      id: crypto.randomUUID(),
      role,
      outputType,
      generatedAt: new Date().toISOString(),
      rawOutput: nextRaw
    };
    setHistory((prev) => [item, ...prev].slice(0, 10));
  };

  const generate = async () => {
    if (!role.trim() || !workLocation || !sourceLocation.length || !mustHaveSkills.trim()) {
      setStatus("error");
      setStatusMessage("Complete required fields before generating.");
      return;
    }
    if (yearsMin > yearsMax) {
      setStatus("error");
      setStatusMessage("Years of experience min cannot exceed max.");
      return;
    }
    setStatus("loading");
    setStatusMessage("Generating...");
    const raw = `Trigger: ${trigger}\n\nYAML:\n${yamlText}\n\n${buildMockOutput(outputType)}`;
    setRawOutput(raw);
    setPlaybookGeneratedAt(new Date().toISOString());
    setHistoryViewRole(null);
    setHistoryViewOutputType(null);
    setStatus("success");
    setStatusMessage(`Generated at ${new Date().toLocaleTimeString()}`);
    saveHistory(raw);
  };

  const generateGuide = () => {
    const raw = `## 1. Core Recruiting Flow
Manatal-first: ATS matching, sourcing hub, outreach, activity tracking.

## 2. Channel Rules by Geography
Apply location-specific channel rules before spend.

## 3. Platform Usage (Foundit, LinkedIn, JobStreet, Naukri)
Use owned tools before paid channels.

## 4. Boolean vs Filter Logic
Keep Boolean concise; push location/experience into filters.

## 5. ATS Capture Rules
Every sourced profile must be captured in Manatal with source tags.

## 6. Outreach Standards
Operator-level and concise outreach with clear CTA.

## 7. Daily Activity Targets
Daily sourcing, outreach, follow-up, and shortlist checkpoints.`;
    setRawOutput(raw);
    setPlaybookGeneratedAt(new Date().toISOString());
    setHistoryViewRole(null);
    setHistoryViewOutputType(null);
    setStatus("success");
    setStatusMessage("Guide generated.");
  };

  const applyExample = (id: "example1" | "example2") => {
    setSelectedExample(id);
    if (id === "example1") {
      setRole("Mid-level Data Engineer");
      setRoleType("Permanent");
      setWorkLocation("Malaysia");
      setSourceLocation(["Malaysia"]);
      setNationalityOpen(true);
      setNationality([]);
      setMonthlySalary(14000);
      setCurrency("MYR");
      setYearsMin(3);
      setYearsMax(6);
      setMustHaveSkills("Python, Azure Machine Learning, React.JS");
      setNoticePeriod("30 days");
      setExcludeKeywords("Intern, Junior, QA");
      setConstraints([]);
      return;
    }
    setRole("Senior DBA");
    setRoleType("Permanent");
    setWorkLocation("Malaysia");
    setSourceLocation(["Malaysia", "India"]);
    setNationalityOpen(false);
    setNationality(["Malaysian", "Indian"]);
    setMonthlySalary(16000);
    setCurrency("MYR");
    setYearsMin(6);
    setYearsMax(12);
    setMustHaveSkills("Oracle DBA, SQL Performance Tuning, Backup Recovery");
    setNoticePeriod("60 days");
    setExcludeKeywords("Intern");
    setConstraints(["Prefer immediate joiners"]);
  };

  const panelRole = historyViewRole ?? role;
  const panelOutputType = historyViewOutputType ?? outputType;
  const panelGeneratedAtLabel = playbookGeneratedAt ? new Date(playbookGeneratedAt).toLocaleString() : null;

  const isStandalone = mode === "standalone";

  const intakeForm = (
    <div className="hiring-strategy-form space-y-3">
          <div className="mb-1">
            <h2 className="text-[15px] font-medium text-slate-100">Hiring Strategy</h2>
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">Section A: Role Details</div>
          <div className="grid gap-2 md:grid-cols-12">
            <div className="flex flex-col gap-1 md:col-span-6">
              <label className="text-xs text-slate-300">Role *</label>
              <input value={role} onChange={(e) => setRole(e.target.value)} className="glass-input h-10 px-3 text-sm" />
            </div>
            <div className="flex flex-col gap-1 md:col-span-3">
              <label className="text-xs text-slate-300">Role Type *</label>
              <select value={roleType} onChange={(e) => setRoleType(e.target.value as "Permanent" | "Contract")} className="glass-input h-10 bg-[#0f172a] px-3 text-sm text-white">
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-3">
              <label className="text-xs text-slate-300">Work Location *</label>
              <select value={workLocation} onChange={(e) => setWorkLocation(e.target.value)} className="glass-input h-10 bg-[#0f172a] px-3 text-sm text-white">
                {SOURCE_LOCATIONS.map((loc) => <option key={loc}>{loc}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-6">
              <label className="text-xs text-slate-300">Source Location *</label>
              <div className="hiring-chip-grid grid grid-cols-4 gap-1 rounded-[10px] border border-white/10 bg-black/20 p-1.5">
                {SOURCE_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setSourceLocation((prev) => (prev.includes(loc) ? prev.filter((v) => v !== loc) : [...prev, loc]))}
                    className={`hiring-loc-chip w-full rounded-full px-1.5 py-0.5 text-center text-[10px] font-medium leading-tight whitespace-nowrap ${sourceLocation.includes(loc) ? "bg-cyan-500/20 text-cyan-200" : "border border-white/15 text-slate-300"}`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1 md:col-span-6">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300">Nationality *</label>
                <button type="button" onClick={() => setNationalityOpen((prev) => !prev)} className="glass-button rounded-[10px] px-3 py-1 text-xs">
                  {nationalityOpen ? "Open" : "Select"}
                </button>
              </div>
              {nationalityOpen ? (
                <div
                  className="hiring-chip-grid grid grid-cols-4 gap-1 rounded-[10px] border border-white/10 bg-black/20 p-1.5"
                  role="group"
                  aria-label="Nationality open to all listed"
                >
                  {ALL_NATIONALITIES.map((item) => (
                    <div
                      key={item}
                      className={`hiring-loc-chip flex w-full items-center justify-center rounded-full text-center font-medium leading-tight whitespace-nowrap bg-cyan-500/20 text-cyan-200 ${
                        selectedExample === "example1" ? "px-2 py-1 text-xs" : "px-1.5 py-0.5 text-[10px]"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="hiring-chip-grid grid grid-cols-4 gap-1 rounded-[10px] border border-white/10 bg-black/20 p-1.5">
                  {ALL_NATIONALITIES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setNationality((prev) => (prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]))}
                      className={`hiring-loc-chip w-full rounded-full px-1.5 py-0.5 text-center text-[10px] font-medium leading-tight whitespace-nowrap ${nationality.includes(item) ? "bg-cyan-500/20 text-cyan-200" : "border border-white/15 text-slate-300"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 md:col-span-6">
              <label className="text-xs text-slate-300">Monthly Salary *</label>
              <input type="number" value={monthlySalary} onChange={(e) => setMonthlySalary(Number(e.target.value || 0))} className="glass-input h-10 px-3 text-sm" />
            </div>
            <div className="flex flex-col gap-1 md:col-span-6">
              <label className="text-xs text-slate-300">Currency *</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as "MYR" | "USD" | "SGD" | "INR")} className="glass-input h-10 bg-[#0f172a] px-3 text-sm text-white">
                <option value="MYR">MYR</option>
                <option value="USD">USD</option>
                <option value="SGD">SGD</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>

          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">Section B: Candidate Profile</div>
          <div className="grid gap-2 md:grid-cols-12">
            <div className="space-y-1 md:col-span-7">
              <label className="text-xs text-slate-300">Years Experience * ({yearsMin} - {yearsMax})</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-[10px] border border-white/10 bg-black/20 px-2 py-1.5">
                  <span className="text-[11px] text-slate-400">Min</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={yearsMin}
                    onChange={(e) => setYearsMin(Number(e.target.value || 0))}
                    className="glass-input h-8 w-full px-2 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-[10px] border border-white/10 bg-black/20 px-2 py-1.5">
                  <span className="text-[11px] text-slate-400">Max</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={yearsMax}
                    onChange={(e) => setYearsMax(Number(e.target.value || 0))}
                    className="glass-input h-8 w-full px-2 text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 md:col-span-5">
              <label className="text-xs text-slate-300">Notice Period</label>
              <select value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)} className="glass-input h-10 bg-[#0f172a] px-3 text-sm text-white">
                <option>Immediate</option>
                <option>30 days</option>
                <option>60 days</option>
                <option>90 days</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-12">
              <label className="text-xs text-slate-300">Must Have Skills *</label>
              <input value={mustHaveSkills} onChange={(e) => setMustHaveSkills(e.target.value)} className="glass-input h-10 px-3 text-sm" />
            </div>
          </div>

          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">Section C: Constraints</div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm">Exclude Keywords</label>
              <input value={excludeKeywords} onChange={(e) => setExcludeKeywords(e.target.value)} className="glass-input h-11 px-3" placeholder="Intern, Junior, QA" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm">Constraints</label>
              <div className="flex flex-col gap-2 rounded-[12px] border border-white/10 bg-black/20 p-3">
                {CONSTRAINT_OPTIONS.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={constraints.includes(item)}
                      onChange={() =>
                        setConstraints((prev) => (prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]))
                      }
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300" htmlFor="hiring-output-type">
              Section D: Output Mode
            </label>
            <div className="flex gap-2">
              <select
                id="hiring-output-type"
                value={outputType}
                onChange={(e) => setOutputType(e.target.value as OutputType)}
                className="glass-input h-10 min-w-0 flex-1 bg-[#0f172a] px-3 text-sm text-white"
              >
                {(["Full Playbook", "Sourcing Strings Only", "Channel Plan Only", "Foundit Boolean"] as OutputType[]).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={generate}
                className="flex h-10 min-w-[8.5rem] shrink-0 items-center justify-center rounded-lg bg-cyan-500 px-4 text-sm font-bold text-black transition-all hover:bg-cyan-400"
              >
                Execute
              </button>
            </div>
          </div>

          {showContractMalaysiaWarning ? (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
              Contract + Malaysia: JobStreet database access is restricted (posting only).
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-500">Examples:</span>
            <button type="button" onClick={() => applyExample("example1")} className={`rounded-full px-3 py-1 text-xs ${selectedExample === "example1" ? "bg-violet-500/20 text-violet-200" : "border border-white/15 text-slate-300"}`}>Example 1</button>
            <button type="button" onClick={() => applyExample("example2")} className={`rounded-full px-3 py-1 text-xs ${selectedExample === "example2" ? "bg-violet-500/20 text-violet-200" : "border border-white/15 text-slate-300"}`}>Example 2</button>
          </div>
    </div>
  );

  const yamlBlock =
    showYaml ? (
        <div className="surface-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">YAML Preview</h4>
            <button type="button" onClick={() => copyText(yamlText, "YAML copied")} className="glass-button rounded-[8px] px-3 py-1 text-xs">Copy</button>
          </div>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-[10px] border border-white/10 bg-black/30 p-3 text-xs text-slate-300">{yamlText}</pre>
        </div>
      ) : null;

  const historyBlock =
    showHistory ? (
        <div className="surface-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">History (Last 10)</h4>
          </div>
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="text-sm text-slate-400">No history yet.</div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-white/10 bg-black/20 px-3 py-2">
                  <div className="text-xs text-slate-200">
                    <div className="font-semibold">{item.role}</div>
                    <div className="text-slate-400">{item.outputType} · {new Date(item.generatedAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRawOutput(item.rawOutput);
                        setPlaybookGeneratedAt(item.generatedAt);
                        setHistoryViewRole(item.role);
                        setHistoryViewOutputType(item.outputType);
                        setStatus("success");
                        setStatusMessage("Loaded from history.");
                      }}
                      className="glass-button rounded-[8px] px-3 py-1 text-xs"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistory((prev) => prev.filter((entry) => entry.id !== item.id))}
                      className="glass-button rounded-[8px] px-3 py-1 text-xs text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null;

  const playbookOutput = (
    <>
      {showNoLinkedinAdsWarning ? (
        <div className="mb-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
          Malaysian-only technical role: no LinkedIn job ads; use LinkedIn Recruiter Lite for sourcing only.
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-hidden">
        <OutputPanel
          rawOutput={rawOutput}
          role={panelRole}
          outputType={panelOutputType}
          generatedAt={panelGeneratedAtLabel}
          status={status}
          statusMessage={statusMessage}
        />
      </div>
    </>
  );

  const hiringSplitGrid = (
    <section
      ref={hiringGridRef}
      className="grid min-h-0 flex-1 gap-0 self-stretch"
      style={{ gridTemplateColumns: `calc(${dividerX}% - 1cm) 18px 1fr` }}
    >
      <div className="opal-split-panel min-h-0 overflow-y-auto">{intakeForm}</div>
      <div
        aria-hidden="true"
        className="relative flex w-full cursor-col-resize select-none items-center justify-center"
        onMouseDown={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
      >
        <div className="opal-resize-handle rounded-[2px]" data-active={dragging ? "true" : undefined} />
      </div>
      <div className="opal-split-panel opal-split-panel--tall flex min-h-0 flex-col overflow-hidden">
        {playbookOutput}
      </div>
    </section>
  );

  return (
    <section
      className={`hiring-strategy-tab flex min-h-0 flex-1 flex-col gap-4 ${isStandalone ? "w-full min-h-0 flex-1 overflow-hidden" : ""}`}
    >
      <div className="flex min-h-0 flex-1 flex-col self-stretch">
        {hiringSplitGrid}
      </div>
      {yamlBlock}
      {historyBlock}
      {showHelp ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-[16px] border border-white/15 bg-[#0f172a] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-cyan-300">Oxy Hiring — Available Triggers</h4>
              <button type="button" onClick={() => setShowHelp(false)} className="glass-button rounded-[8px] px-3 py-1 text-xs">Close</button>
            </div>
            <div className="space-y-1 text-sm text-slate-300">
              <div>1. /sourcing → Multi-platform sourcing strategy</div>
              <div>2. /playbook → Full hiring execution plan</div>
              <div>3. /channel → Channel strategy only</div>
              <div>4. /foundit → Foundit Boolean + filters</div>
              <div>5. /guide → Complete recruiter guide</div>
              <div>6. /example → 2 YAML examples</div>
            </div>
            <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              Notes: Manatal-first always applies. Owned tools prioritized before paid. YAML is source of truth.
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function AlertsTab() {
  return (
    <section className="surface-card p-5">
      <h2 className="text-[15px] font-bold uppercase tracking-[0.12em] text-cyan-300">Alerts</h2>
      <p className="mt-3 max-w-xl text-sm text-slate-400">
        Notification center for hiring events, SLA breaches, and pipeline changes. Connect webhooks or email digests
        here when ready.
      </p>
    </section>
  );
}

function AnalyticsTab() {
  return (
    <section className="surface-card p-5">
      <h2 className="text-[15px] font-bold uppercase tracking-[0.12em] text-cyan-300">Analytics</h2>
      <p className="mt-3 max-w-xl text-sm text-slate-400">
        Dashboards for funnel conversion, time-to-hire, and source effectiveness. Wire charts and data sources here when
        ready.
      </p>
    </section>
  );
}

const ATS_NAME_OPTIONS = ["Workday", "Manatal", "Greenhouse", "Workable", "Deel", "Breezy HR"] as const;

function SetupTab() {
  const [openAiKey, setOpenAiKey] = useState("********************");
  const [atsName, setAtsName] = useState<string>("Manatal");
  const [atsApiKey, setAtsApiKey] = useState("********************");
  const [tableName, setTableName] = useState("Master AI Screener v2");
  const [defaultPipelineStage, setDefaultPipelineStage] = useState("New Candidates");
  const [tier1Threshold, setTier1Threshold] = useState("65");
  const [tier2Threshold, setTier2Threshold] = useState("80");
  const [autoUploadToAts, setAutoUploadToAts] = useState(true);
  const [autoSyncToDatabase, setAutoSyncToDatabase] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [statusBanner, setStatusBanner] = useState("All systems operational");
  const [lastSavedAt, setLastSavedAt] = useState("31 Mar 2026, 10:42 AM");

  const saveSettings = () => {
    setStatusBanner("Settings saved successfully");
    setLastSavedAt("31 Mar 2026, 10:45 AM");
  };

  const testConnections = () => {
    setStatusBanner("Connection test passed for OpenAI, ATS, and Database");
  };

  const toggleClass = (enabled: boolean) =>
    enabled
      ? "primary-button rounded-full px-4 py-2 text-xs"
      : "glass-button rounded-full px-4 py-2 text-xs";

  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="surface-card p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-bold uppercase tracking-[0.12em] text-cyan-300">Setup</h2>
            <p className="mt-2 text-sm text-slate-400">
              Configure integrations, thresholds, automation, and default workflow behaviour.
            </p>
          </div>
          <div className="rounded-[14px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium text-emerald-300">
            {statusBanner}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300">OpenAI API Key</label>
            <input value={openAiKey} onChange={(e) => setOpenAiKey(e.target.value)} className="glass-input h-11 w-full px-3" placeholder="Enter API key" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300">ATS Name</label>
            <select value={atsName} onChange={(e) => setAtsName(e.target.value)} className="glass-input h-11 w-full bg-[#0f172a] px-3 text-white">
              {ATS_NAME_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300">ATS API Key</label>
            <input value={atsApiKey} onChange={(e) => setAtsApiKey(e.target.value)} className="glass-input h-11 w-full px-3" placeholder="Enter ATS API key" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300">Table Name</label>
            <input value={tableName} onChange={(e) => setTableName(e.target.value)} className="glass-input h-11 w-full px-3" placeholder="Enter table name" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <label className="text-xs text-slate-300 sm:text-sm">Default Pipeline Stage</label>
            <select
              value={defaultPipelineStage}
              onChange={(e) => setDefaultPipelineStage(e.target.value)}
              className="glass-input h-10 w-full min-w-0 bg-[#0f172a] px-2 text-sm text-white sm:h-11 sm:px-3"
            >
              <option>New Candidates</option>
              <option>Shortlisted</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Placed</option>
            </select>
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <label className="text-xs text-slate-300 sm:text-sm">Quick Score Pass Threshold (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={tier1Threshold}
              onChange={(e) => setTier1Threshold(e.target.value)}
              className="glass-input h-10 w-full min-w-0 px-2 text-sm sm:h-11 sm:px-3"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <label className="text-xs text-slate-300 sm:text-sm">Final Score Pass Threshold (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={tier2Threshold}
              onChange={(e) => setTier2Threshold(e.target.value)}
              className="glass-input h-10 w-full min-w-0 px-2 text-sm sm:h-11 sm:px-3"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="panel-border flex items-center justify-between rounded-[16px] bg-white/[0.02] px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-100">Auto Upload to ATS</div>
              <div className="text-xs text-slate-400">Push uploaded candidates into your ATS automatically after validation.</div>
            </div>
            <button type="button" onClick={() => setAutoUploadToAts((prev) => !prev)} className={toggleClass(autoUploadToAts)}>
              {autoUploadToAts ? "Enabled" : "Disabled"}
            </button>
          </div>
          <div className="panel-border flex items-center justify-between rounded-[16px] bg-white/[0.02] px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-100">Auto Sync to Database</div>
              <div className="text-xs text-slate-400">Mirror candidate scoring results into the database automatically.</div>
            </div>
            <button type="button" onClick={() => setAutoSyncToDatabase((prev) => !prev)} className={toggleClass(autoSyncToDatabase)}>
              {autoSyncToDatabase ? "Enabled" : "Disabled"}
            </button>
          </div>
          <div className="panel-border flex items-center justify-between rounded-[16px] bg-white/[0.02] px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-100">Email Alerts</div>
              <div className="text-xs text-slate-400">Send alerts when a scoring batch completes or fails.</div>
            </div>
            <button type="button" onClick={() => setEmailAlerts((prev) => !prev)} className={toggleClass(emailAlerts)}>
              {emailAlerts ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={saveSettings} className="primary-button rounded-[10px] px-5 py-2">Save Settings</button>
          <button type="button" onClick={testConnections} className="glass-button rounded-[10px] px-5 py-2">Test Connections</button>
        </div>

        <div className="mt-5 text-xs text-slate-500">Last saved: {lastSavedAt}</div>
      </div>

      <div className="space-y-6">
        <div className="surface-card p-5">
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[0.12em] text-cyan-300">Integration Health</h3>
          <div className="space-y-3">
            <div className="panel-border rounded-[16px] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-100">OpenAI</div>
                  <div className="text-xs text-slate-400">Generation and scoring services</div>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">Connected</span>
              </div>
            </div>
            <div className="panel-border rounded-[16px] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-100">ATS</div>
                  <div className="text-xs text-slate-400">Candidate sync and job lookup</div>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">Connected</span>
              </div>
            </div>
            <div className="panel-border rounded-[16px] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-100">Database</div>
                  <div className="text-xs text-slate-400">Scoring result mirror and reporting</div>
                </div>
                <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">Warning</span>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[0.12em] text-cyan-300">Recent Audit Log</h3>
          <div className="space-y-3 text-sm">
            <div className="rounded-[14px] border border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="text-slate-100">Threshold updated to 65 / 80</div>
              <div className="mt-1 text-xs text-slate-500">31 Mar 2026, 10:45 AM</div>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="text-slate-100">Database connection test returned warning</div>
              <div className="mt-1 text-xs text-slate-500">31 Mar 2026, 10:43 AM</div>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="text-slate-100">Auto upload to ATS enabled</div>
              <div className="mt-1 text-xs text-slate-500">31 Mar 2026, 10:41 AM</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function JobPostingTab() {
  const [jdText, setJdText] = useState("");
  const [commandInput, setCommandInput] = useState("");
  const [outputText, setOutputText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [dividerX, setDividerX] = useState(50);
  const [dragging, setDragging] = useState(false);
  const gridRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const el = gridRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setDividerX(Math.max(22, Math.min(78, pct)));
    };
    const onUp = () => setDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const helpRows = [
    {
      command: "/help",
      description: "Shows the available Job Posting commands"
    },
    {
      command: "/question",
      description: "Highlights missing information and clarifications before generation"
    },
    {
      command: "/companyintro <website>",
      description: "Generates a company intro block using the website you provide"
    },
    {
      command: "/manatal",
      description: "Builds the Manatal-ready job posting output"
    },
    {
      command: "/linkedin",
      description: "Builds the LinkedIn-ready job posting output"
    }
  ];
  const commands = helpRows.map((row) => row.command);
  const commandButtons = [
    {
      command: "/question",
      emoji: "①",
      label: "Question",
      tooltip: "Highlights missing information and clarifications before generation"
    },
    {
      command: "/companyintro",
      emoji: "②",
      label: "Company Intro",
      tooltip: "Generates a company intro block using the website you provide"
    },
    {
      command: "/manatal",
      emoji: "③",
      label: "Manatal",
      tooltip: "Builds the Manatal-ready job posting output"
    },
    {
      command: "/linkedin",
      emoji: "④",
      label: "LinkedIn",
      tooltip: "Builds the LinkedIn-ready job posting output"
    }
  ];
  const activeCommand = commandInput.trim().split(/\s+/)[0];

  const extractField = (keyword: string) => {
    const lines = jdText.split("\n");
    const found = lines.find((line) => line.toLowerCase().startsWith(keyword.toLowerCase()));
    if (!found) return "";
    return found.split(":").slice(1).join(":").trim();
  };

  const inferJobId = () => {
    const id = extractField("job id") || "";
    if (id) return id;
    const match = jdText.match(/\b(JOB[-_\d]+|\d{6,})\b/i);
    return match ? match[0] : "QX999999";
  };

  const inferLocation = () => extractField("location") || "Malaysia";
  const inferWorkMode = () => extractField("work mode") || "Hybrid";
  const inferEmploymentType = () => {
    const val = extractField("employment type");
    if (val) return val;
    if (/permanent/i.test(jdText)) return "Permanent";
    if (/contract-to-perm/i.test(jdText)) return "Contract-to-Perm";
    if (/contract/i.test(jdText)) return "Contract";
    return "";
  };

  const hasRequirementsSplit = () => /must[- ]have/i.test(jdText) && /nice[- ]to[- ]have/i.test(jdText);

  const parseList = (heading: string) => {
    const regex = new RegExp(`${heading}[:]?\\s*\\n([\\s\\S]*?)(?=(\\n\\S|$))`, "i");
    const match = jdText.match(regex);
    if (!match) return [];
    return match[1]
      .split(/\n|\r/) 
      .map((line) => line.replace(/^[-*•\s]*/, "").trim())
      .filter((item) => item);
  };

  const inferBenefits = () => {
    const benefits = parseList("benefits");
    if (benefits.length > 0) return benefits;
    return [
      "(Inferred — please review: competitive compensation aligned with market standards)",
      "(Inferred — please review: learning and development support with exposure to enterprise cloud suites)"
    ];
  };

  const companyIntroOxydata = "Oxydata Software Sdn Bhd, a 100% Malaysian-owned IT company established in 2006, is a trusted technology partner specializing in Microsoft, Java, SAP, and Oracle platforms, delivering IT Managed Services, DevOps, Outsourcing, and Enterprise Application Development to drive digital transformation for global clients.";

  const companyIntroFromJD = () => {
    const m = jdText.match(/\bOur client\b[\s\S]*/i);
    if (m) return m[0].split('\n').slice(0, 2).join(' ').trim();
    return "";
  };

  const runQuestion = () => {
    const issues: string[] = [];
    if (!jdText.trim()) {
      issues.push("Please paste a job description first.");
    }

    if (!hasRequirementsSplit()) {
      issues.push("(action required — cannot generate until resolved) Requirements must be split into Must-have and Nice-to-have.");
    }

    if (!/benefits/i.test(jdText)) {
      issues.push("(Inferred — please review: add at least 2 benefit bullets.");
    }

    const employmentType = inferEmploymentType();
    if (!employmentType) {
      issues.push("Employment Type missing: please specify Permanent / Contract / Contract-to-Perm.");
    }

    const companyIntro = companyIntroFromJD();
    if (!companyIntro) {
      issues.push("Company intro missing: provide one or use /companyintro <website>.");
    }

    if (issues.length === 0) {
      setOutputText("No clarifications needed. Which format? /manatal /linkedin /Both");
      setErrorMessage("");
      return;
    }

    setOutputText(issues.map((i) => `• ${i}`).join("\n"));
    setErrorMessage("");
  };

  const runCompanyIntro = (website: string) => {
    const sanitized = website.trim();
    if (!sanitized) {
      setErrorMessage("Provide a website with /companyintro <website>.");
      return;
    }

    const intro = `Our client is a large-scale technology enterprise with global presence, serving hundreds of clients across multiple countries with a strong team of experienced professionals and innovative solutions that lead the market.`;
    setOutputText(`${intro}\n\nUse this intro or adjust?`);
    setErrorMessage("");
  };

  const generateManatal = () => {
    const jobId = inferJobId();
    const location = inferLocation();
    const workMode = inferWorkMode();
    const employmentType = inferEmploymentType() || "Permanent";
    const companyIntro = companyIntroFromJD() || companyIntroOxydata;

    const opening = jdText.split("\n").find((line) => line.trim()) || "";
    const must = parseList("must[- ]have") || parseList("responsibilities") || [];
    const nice = parseList("nice[- ]to[- ]have") || [];

    const benefits = inferBenefits();

    let text = `${opening}\n\nJob ID: ${jobId}\nLocation: ${location}\nWork Mode: ${workMode}\nJob Type: ${employmentType}\n\n${companyIntro}\n\n${opening}\n\nResponsibilities\n`;
    must.slice(0, 8).forEach((line) => { text += `- ${line}\n`; });
    text += `\nRequirements\nMust-have:\n`;
    must.forEach((line) => { text += `- ${line}\n`; });
    if (nice.length > 0) {
      text += `\nNice-to-have:\n`;
      nice.forEach((line) => { text += `- ${line}\n`; });
    }
    text += `\nWhy Join Us\n`;
    benefits.forEach((line) => { text += `- ${line}\n`; });

    setOutputText(text);
    setErrorMessage("");
  };

  const generateLinkedin = () => {
    const jobId = inferJobId();
    const location = inferLocation();
    const workMode = inferWorkMode();
    const employmentType = inferEmploymentType() || "Permanent";
    const companyIntro = companyIntroFromJD() || companyIntroOxydata;
    const opening = jdText.split("\n").find((line) => line.trim()) || "";

    const must = parseList("must[- ]have") || parseList("responsibilities") || [];
    const nice = parseList("nice[- ]to[- ]have") || [];
    const benefits = inferBenefits();

    const lines = [`🚀 We're Hiring: ${opening || "[Job Title]"}`, ``, `📍 Location: ${location}`, `🏢 Work Mode: ${workMode}`, `📄 Job Type: ${employmentType}`, ``, `About the Company`, `${companyIntro}`, ``, `${opening}`, ``, `🔧 What You'll Do`];
    must.forEach((b) => lines.push(`• ${b}`));
    lines.push(``, `🎯 What You Bring`, `Must-have:`);
    must.forEach((b) => lines.push(`• ${b}`));
    if (nice.length > 0) {
      lines.push(``, `Nice-to-have:`);
      nice.forEach((b) => lines.push(`• ${b}`));
    }
    lines.push(``, `🌟 Why Join Us`);
    benefits.forEach((b) => lines.push(`• ${b}`));
    lines.push(``, `📌 Apply Now: http://www.careers-page.com/oxy/job/${jobId}`, `📧 Reach out: recruiter@oxydata.my | +60XXXXXXXX`, `🌐 Explore more roles: https://oxydata.my/jobs/`, ``, `#Oxydata #KualaLumpurJobs #Recruitment #AIRecruiting #Hiring`);

    setOutputText(lines.join("\n"));
    setErrorMessage("");
  };

  const executeCommand = () => {
    const input = commandInput.trim();
    if (!input) {
      setErrorMessage("Enter a command first.");
      return;
    }

    if (input.startsWith("/companyintro")) {
      const parts = input.split(" ").slice(1);
      return runCompanyIntro(parts.join(" ").trim());
    }

    if (input === "/question") {
      return runQuestion();
    }

    if (input === "/help") {
      setOutputText(`Command list:\n${commands.join("\n")}\n\nExamples:\n/question\n/companyintro https://company.com\n/manatal\n/linkedin`);
      setErrorMessage("");
      return;
    }

    if (input === "/manatal") {
      if (!hasRequirementsSplit()) {
        setErrorMessage("Cannot run /manatal before requirements are split into Must-have and Nice-to-have.");
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        generateManatal();
        setIsLoading(false);
      }, 300);
      return;
    }

    if (input === "/linkedin") {
      if (!hasRequirementsSplit()) {
        setErrorMessage("Cannot run /linkedin before requirements are split into Must-have and Nice-to-have.");
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        generateLinkedin();
        setIsLoading(false);
      }, 300);
      return;
    }

    setErrorMessage("Unknown command. Use /help to list available commands.");
  };

  const clearAll = () => {
    setJdText("");
    setCommandInput("");
    setOutputText("");
    setErrorMessage("");
    setIsLoading(false);
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col self-stretch">
        <section
          ref={gridRef}
          className="grid min-h-0 flex-1 gap-0 self-stretch"
          style={{ gridTemplateColumns: `calc(${dividerX}% - 1cm) 18px 1fr` }}
        >
          <div className="opal-split-panel min-h-0 overflow-y-auto">
            <div className="mb-4">
              <h2 className="opal-heading-panel">Job Posting</h2>
            </div>
            <SectionLabel>Job Description *</SectionLabel>

            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste job description here..."
              required
              aria-required="true"
              className="glass-input mt-3 h-[446px] w-full resize-none px-4 py-4"
            />

            <div className="mt-4 grid grid-cols-4 gap-2">
              {commandButtons.map((button) => {
                const isActive = activeCommand === button.command;

                return (
                  <button
                    type="button"
                    key={button.command}
                    onClick={() => setCommandInput(button.command)}
                    data-active={isActive}
                    className="command-button group relative glass-button min-h-11 rounded-[8px] px-4 py-2 text-left text-[12px] font-semibold tracking-[0.02em] opal-text-muted"
                  >
                    <span className={isActive ? "drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] text-cyan-400" : ""}>
                      <span className="text-[18px]">{button.emoji}</span>{" "}
                      {button.label}
                    </span>
                    <span className="opal-tooltip pointer-events-none absolute -top-11 left-1/2 z-20 hidden w-max max-w-[240px] -translate-x-1/2 rounded-md px-3 py-2 text-center text-[11px] font-medium normal-case leading-4 group-hover:block group-focus-visible:block">
                      {button.tooltip}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              <button type="button" onClick={executeCommand} className="primary-button col-span-3 min-h-11 rounded-lg px-10 py-2">
                Execute
              </button>
              <button type="button" onClick={clearAll} className="glass-button min-h-11 rounded-lg px-6 py-2">
                Clear
              </button>
            </div>

            {errorMessage ? <div className="mt-3 text-sm text-rose-300">{errorMessage}</div> : null}
            {isLoading ? <div className="mt-3 text-sm text-[var(--muted)]">Running...</div> : null}
          </div>

          <div
            aria-hidden="true"
            className="relative flex w-full cursor-col-resize select-none items-center justify-center"
            onMouseDown={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
          >
            <div className="opal-resize-handle rounded-[2px]" data-active={dragging ? "true" : undefined} />
          </div>

          <div className="opal-split-panel opal-split-panel--tall flex min-h-0 flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
                <span className="opal-heading-panel">Output</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!outputText) return;
                    const blob = new Blob([outputText], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "job-posting.txt";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="glass-button rounded-lg px-3 py-1.5 text-xs"
                >
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(true)}
                  className="glass-button rounded-lg px-3 py-1.5 text-xs"
                >
                  Help
                </button>
              </div>
            </div>

            <div className="opal-split-inner">
              <div className="opal-split-inner-output">
                {outputText || "Output will appear here."}
              </div>
            </div>
          </div>
        </section>
      </div>

      {isHelpOpen ? (
        <div className="opal-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="opal-modal w-full max-w-4xl rounded-[20px] p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold opal-text-body">Job Posting Commands</h3>
                <p className="mt-1 text-sm opal-text-muted">Available actions for the Job Posting bot.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="glass-button rounded-lg px-3 py-1.5 text-xs"
              >
                Close
              </button>
            </div>

            <div className="overflow-x-auto rounded-[16px] border opal-border-subtle bg-[var(--card)]">
              <table className="w-full min-w-[720px] text-left text-sm opal-text-body">
                <thead className="bg-[var(--card)] text-[11px] uppercase tracking-[0.12em] opal-text-muted">
                  <tr>
                    <th className="px-4 py-3">Command</th>
                    <th className="px-4 py-3">What it does</th>
                  </tr>
                </thead>
                <tbody>
                  {helpRows.map((row) => (
                    <tr key={row.command} className="border-t opal-border-subtle align-top">
                      <td className="px-4 py-3 font-mono text-cyan-300">{row.command}</td>
                      <td className="px-4 py-3 opal-text-muted">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SectionLabel({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`opal-section-label ${className}`}>{children}</div>;
}

function StatusBox({
  status,
  className = ""
}: {
  status: Exclude<StatusMessage, null>;
  className?: string;
}) {
  return (
    <div
      className={`panel-border flex items-center gap-3 rounded-[10px] px-4 py-3 text-[13px] font-medium ${status.state === "loading" ? "status-loading" : ""} ${status.state === "success" ? "status-success" : ""} ${status.state === "error" ? "status-error" : ""} ${className}`}
    >
      <span className="shrink-0">{status.state === "loading" ? <ClockIcon /> : null}</span>
      <span className="shrink-0">{status.state === "success" ? <CheckIcon /> : null}</span>
      <span className="shrink-0">{status.state === "error" ? <ErrorIcon /> : null}</span>
      <span>{status.message}</span>
    </div>
  );
}

function DetailPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-[99px] border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[12px]">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-cyan-400">{value}</span>
    </div>
  );
}

function EmptyState({
  title,
  subtitle,
  icon,
  className = "",
  iconClassName = ""
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={`mx-auto flex max-w-[320px] flex-col items-center justify-center text-center ${className}`}>
      <div
        className={
          iconClassName
            ? `grid h-14 w-14 place-items-center rounded-[16px] ${iconClassName}`
            : "grid h-14 w-14 place-items-center rounded-[16px] bg-white/[0.04] text-cyan-400"
        }
      >
        {icon}
      </div>
      <h3 className="mt-4 text-[16px] font-semibold text-slate-100">{title}</h3>
      <p className="mt-2 text-[13px] leading-6 text-slate-500">{subtitle}</p>
    </div>
  );
}

function DocumentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3.75H14.5L19.25 8.5V20.25H8A2.25 2.25 0 0 1 5.75 18V6A2.25 2.25 0 0 1 8 3.75Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 4V9H19" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 12.25H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9 15.75H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <rect x="12" y="3" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <rect x="3" y="12" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <rect x="12" y="12" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 16V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 9L12 5L16 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 18.5H19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 6.5V10L12.5 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 10.5L8.25 13.75L15 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 6.75V10.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="10" cy="13.25" r="0.75" fill="currentColor" />
    </svg>
  );
}
