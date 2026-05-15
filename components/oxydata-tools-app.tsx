"use client";

import { Orbitron } from "next/font/google";
import { useEffect, useId, useMemo, useRef, useState } from "react";

const opalDisplay = Orbitron({
  subsets: ["latin"],
  weight: ["700", "800", "900"]
});

type TabKey = "jd" | "rubric" | "uploadCv" | "aiScoring" | "viewScoring" | "viewAirtable" | "cv" | "jobPosting" | "setup";
type StatusState = "loading" | "success" | "error";
type CommandKey =
  | "/full"
  | "/export"
  | "/upload"
  | "/update";

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

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "jd", label: "Job Clarity" },
  { key: "rubric", label: "Rubric Generator" },
  { key: "uploadCv", label: "Upload to Manatal" },
  { key: "aiScoring", label: "Run AI Scoring" },
  { key: "viewScoring", label: "View Scoring" },
  { key: "viewAirtable", label: "View Airtable" },
  { key: "cv", label: "CV Formatter" },
  { key: "jobPosting", label: "Job Posting" },
  { key: "setup", label: "Setup" }
];

const commands: Array<{ key: CommandKey; disabled?: boolean }> = [
  { key: "/full" },
  { key: "/export" },
  { key: "/upload" },
  { key: "/update" }
];

/** Circular mint-glow mark with mirrored facets (reference Opal logo) */
function OpalLogoMark({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const clipId = `opal-logo-clip-${uid}`;
  const panelId = `opal-logo-panel-${uid}`;
  const haloId = `opal-logo-halo-${uid}`;
  const glowId = `opal-logo-glow-${uid}`;

  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={panelId} x1="8" y1="10" x2="48" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ecfdf5" />
          <stop offset="0.35" stopColor="#99f6e4" />
          <stop offset="0.72" stopColor="#5eead4" />
          <stop offset="1" stopColor="#2dd4bf" />
        </linearGradient>
        <radialGradient id={haloId} cx="0.42" cy="0.38" r="0.65" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#ccfbf1" stopOpacity="0.75" />
          <stop offset="0.45" stopColor="#99f6e4" stopOpacity="0.45" />
          <stop offset="1" stopColor="#14b8a6" stopOpacity="0.12" />
        </radialGradient>
        <filter id={glowId} x="-55%" y="-55%" width="210%" height="210%">
          <feGaussianBlur stdDeviation="2.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={clipId}>
          <circle cx="28" cy="28" r="17.8" />
        </clipPath>
      </defs>
      <g filter={`url(#${glowId})`}>
        <circle cx="28" cy="28" r="20.5" fill={`url(#${haloId})`} opacity="0.9" />
        <g clipPath={`url(#${clipId})`}>
          <circle cx="28" cy="28" r="17.8" fill="#042f2e" fillOpacity="0.25" />
          <path fill={`url(#${panelId})`} fillOpacity="0.92" d="M25.5 13L11.2 18.6v18.8L25.5 43V13z" />
          <path fill={`url(#${panelId})`} fillOpacity="0.92" d="M30.5 13l14.3 5.6v18.8L30.5 43V13z" />
        </g>
        <circle
          cx="28"
          cy="28"
          r="17.8"
          stroke="#99f6e4"
          strokeOpacity="0.35"
          strokeWidth="0.85"
          fill="none"
        />
        <path
          stroke="#f0fdfa"
          strokeOpacity="0.4"
          strokeWidth="0.55"
          strokeLinecap="round"
          d="M28 15.5v25"
        />
      </g>
    </svg>
  );
}

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
          <div className="login-page__block">
            <div className="login-page__header">
              <img src="/oxy.webp" alt="Oxydata" className="login-page__oxy-logo" />
              <div className="login-page__opal-lockup">
                <OpalLogoMark className="login-page__opal-icon" />
                <h1 className={`login-page__opal-title ${opalDisplay.className}`}>OPAL</h1>
              </div>
            </div>
            <div className="login-bevel-line" aria-hidden />
            <p className="login-page__sub">AI Recruiter — sign in</p>
          </div>
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

  return (
    <main className="min-h-screen bg-transparent text-[13px] text-slate-100">
      <TopBar activeTab={activeTab} onChange={setActiveTab} version={APP_VERSION} onLogoClick={() => setAuthenticated(false)} />
      <div className="mx-auto flex w-full max-w-[1440px] flex-col px-5 pb-10 pt-7 sm:px-7 lg:px-9">
        {activeTab === "jd" ? <JdClarityTab /> : null}
        {activeTab === "rubric" ? <RubricGeneratorTab /> : null}
        {activeTab === "uploadCv" ? <UploadCvTab /> : null}
        {activeTab === "aiScoring" ? <AiCandidateScoringTab /> : null}
        {activeTab === "viewScoring" ? <ViewScoringTab /> : null}
        {activeTab === "viewAirtable" ? <ViewAirtableTab /> : null}
        {activeTab === "cv" ? <CvFormatterTab /> : null}
        {activeTab === "jobPosting" ? <JobPostingTab /> : null}
        {activeTab === "setup" ? <SetupTab /> : null}
      </div>
    </main>
  );
}

function TopBar({
  activeTab,
  onChange,
  version,
  onLogoClick
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  version: string;
  onLogoClick: () => void;
}) {
  return (
    <header className="border-b border-white/10 bg-white/[0.04] px-5 py-3 sm:px-7 lg:px-9">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={onLogoClick} className="cursor-pointer hover:opacity-80 transition-opacity">
              <img src="/oxy.webp" alt="Oxydata" className="h-8 w-auto" />
            </button>
          <div className="inline-flex w-fit items-center rounded-[99px] border border-cyan-400/35 bg-cyan-400/15 px-3 py-1 text-[11px] font-semibold text-cyan-400">
            {version}
          </div>
          <div className="hidden h-[18px] w-px bg-white/20 lg:block" />
          <div className="flex flex-wrap gap-2">
            {tabs.filter((tab) => tab.key !== "setup").map((tab) => (
              <button
                key={tab.key}
                type="button"
                data-active={activeTab === tab.key}
                onClick={() => onChange(tab.key)}
                className="tab-button rounded-[8px] border border-white/[0.12] bg-white/[0.05] px-4 py-[5px] text-[12px] text-slate-500 transition-all duration-200 ease-in-out"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange("setup")}
            aria-label="Setup"
            title="Setup"
            data-active={activeTab === "setup"}
            className="glass-button grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-white/[0.12] bg-white/[0.05] text-[22px] text-slate-300 transition-all duration-200 ease-in-out data-[active=true]:border-cyan-400/35 data-[active=true]:bg-cyan-400/15 data-[active=true]:text-cyan-300"
          >
            <span aria-hidden="true">&#9881;</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function JdClarityTab() {
  const [activeCommand, setActiveCommand] = useState<CommandKey>("/full");
  const [jdText, setJdText] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<StatusMessage>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [dividerX, setDividerX] = useState(50);
  const dividerRef = useRef<HTMLDivElement>(null);

  const helpRows = [
    {
      command: "/help",
      description: "Shows all available commands with a short description"
    },
    {
      command: "/full",
      description: "Runs the full JD analysis: Summary -> Clarity Score -> Requirements Table -> Clarifying Questions -> Risks"
    },
    {
      command: "/upload",
      description: "Uploads filled Excel data and merges corrected or updated table content back into the workflow"
    },
    {
      command: "/update",
      description: "Re-runs the analysis after you attach corrected or updated table data"
    },
    {
      command: "/export",
      description: "Exports to Excel with 2 sheets: Internal View and Client View, based on export_spec.md"
    }
  ];

  function formatCommandDisplay(key: CommandKey): { emoji: string; label: string; tooltip: string } {
    const displays: Record<CommandKey, { emoji: string; label: string; tooltip: string }> = {
      "/full": {
        emoji: "①",
        label: "Analyze",
        tooltip: "Runs the full JD analysis"
      },
      "/export": {
        emoji: "②",
        label: "Export",
        tooltip: "Exports to Excel with 2 sheets: Internal View, Client View & Questions"
      },
      "/upload": {
        emoji: "③",
        label: "Upload",
        tooltip: "Uploads filled Excel data and merges corrected or updated table"
      },
      "/update": {
        emoji: "④",
        label: "Update",
        tooltip: "Re-runs the analysis after you attach corrected or updated table data"
      }
    };
    return displays[key] || { emoji: "", label: key, tooltip: "" };
  }

  function clearAll() {
    setJdText("");
    setOutput("");
    setStatus(null);
    setActiveCommand("/full");
  }

  function handleDividerMouseDown() {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dividerRef.current) return;
      const container = dividerRef.current.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newX = ((e.clientX - rect.left) / rect.width) * 100;
      setDividerX(Math.max(20, Math.min(80, newX)));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  async function runAnalysis() {
    setStatus({ state: "loading", message: "Running JD analysis through the secure app route..." });

    try {
      const response = await fetch("/api/jd-clarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: activeCommand, description: jdText })
      });
      const data = (await response.json()) as { result?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to analyze this job description right now.");
      }

      setOutput(data.result ?? "");
      setStatus({ state: "success", message: "Analysis complete. Output has been refreshed." });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Unexpected JD analysis error."
      });
    }
  }

  return (
    <section className="grid gap-0" style={{ gridTemplateColumns: `${dividerX}% 18px 1fr` }}>
      <div className="surface-card p-5">
        <h2 className="mb-4 text-[15px] font-bold tracking-[0.12em] uppercase text-cyan-300">Job Clarity</h2>
        <SectionLabel>Job Description *</SectionLabel>
        <textarea
          value={jdText}
          onChange={(event) => setJdText(event.target.value)}
          placeholder="Paste the full job description here for analysis, clarification, export prep, or client-facing review."
          required
          aria-required="true"
          className="glass-input mt-3 h-[446px] w-full resize-none px-4 py-4"
        />
        <div className="mt-2 text-right text-[11px] text-slate-500">{jdText.length.toLocaleString()} chars</div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {commands.map((command) => {
            const active = activeCommand === command.key;
            const display = formatCommandDisplay(command.key);

            return (
              <button
                key={command.key}
                type="button"
                data-active={active}
                disabled={command.disabled}
                onClick={() => setActiveCommand(command.key)}
                className="command-button group relative glass-button min-h-11 rounded-[8px] px-4 py-2 text-left text-[12px] font-semibold tracking-[0.02em] text-slate-300"
              >
                <span className={active ? "drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] text-cyan-400" : ""}>
                  {display.emoji && <span className="text-[18px]">{display.emoji}</span>}
                  {display.emoji && " "}
                  {display.label}
                </span>
                <span className="pointer-events-none absolute -top-11 left-1/2 z-20 hidden w-max max-w-[240px] -translate-x-1/2 rounded-md border border-cyan-400/35 bg-slate-950/95 px-3 py-2 text-center text-[11px] font-medium normal-case leading-4 text-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.45)] group-hover:block group-focus-visible:block">
                  {display.tooltip}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={runAnalysis} className="primary-button min-h-11 flex-1 rounded-[14px] px-5">
            Execute
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="glass-button min-h-11 rounded-[14px] px-5"
          >
            Clear
          </button>
        </div>

        {status ? <StatusBox status={status} className="mt-4" /> : null}
      </div>

      <div
        ref={dividerRef}
        onMouseDown={handleDividerMouseDown}
        className="group relative flex h-full w-[18px] cursor-col-resize items-center justify-center bg-black/15 transition-colors hover:bg-black/28"
      >
        <div className="h-[94%] w-[4px] rounded-full bg-gradient-to-b from-zinc-500/80 via-zinc-700/90 to-zinc-900 shadow-[inset_1px_1px_0_rgba(255,255,255,0.2),inset_-1px_-1px_0_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.78)] group-hover:from-zinc-400/85 group-hover:via-zinc-600/90 group-hover:to-zinc-800" />
      </div>

      <div className="surface-card flex min-h-[620px] flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Output</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!output) return;
                const blob = new Blob([output], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "jd-clarity.txt";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="glass-button group relative rounded-lg px-3 py-1.5 text-xs"
            >
              Download
              <span className="pointer-events-none absolute -top-12 left-1/2 z-20 hidden w-max max-w-[280px] -translate-x-1/2 rounded-md border border-cyan-400/35 bg-slate-950/95 px-3 py-2 text-center text-[11px] font-medium normal-case leading-4 text-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.45)] group-hover:block group-focus-visible:block">
                Download as text file
              </span>
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
        <div className="panel-border flex min-h-[574px] flex-1 rounded-[16px] bg-white/[0.02] p-6">
          {output ? (
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-7 text-slate-200">{output}</pre>
          ) : (
            <EmptyState
              title="No analysis yet"
              subtitle="Pick a slash command and run the JD through the bot to see the result here."
              icon={<DocumentIcon />}
            />
          )}
        </div>
      </div>

      {isHelpOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[20px] border border-white/15 bg-slate-950/95 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Job Clarity Commands</h3>
                <p className="mt-1 text-sm text-slate-400">Available actions for Job Clarity.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="glass-button rounded-lg px-3 py-1.5 text-xs"
              >
                Close
              </button>
            </div>

            <div className="overflow-x-auto rounded-[16px] border border-white/10 bg-white/[0.03]">
              <table className="w-full min-w-[720px] text-left text-sm text-slate-200">
                <thead className="bg-white/[0.04] text-[11px] uppercase tracking-[0.12em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Command</th>
                    <th className="px-4 py-3">What it does</th>
                  </tr>
                </thead>
                <tbody>
                  {helpRows.map((row) => (
                    <tr key={row.command} className="border-t border-white/10 align-top">
                      <td className="px-4 py-3 font-mono text-cyan-300">{row.command}</td>
                      <td className="px-4 py-3 text-slate-300">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function UploadCvTab() {
  const [name, setName] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobName, setJobName] = useState("");
  const [clientName, setClientName] = useState("");
  const [jobQuery, setJobQuery] = useState("");
  const [jobSuggestions, setJobSuggestions] = useState<JobRecord[]>([]);
  const [isJobDropdownOpen, setIsJobDropdownOpen] = useState(false);
  const [source, setSource] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Array<{ name: string; jobId: string; jobName: string; clientName: string; source: string; cvFileName: string }>>([]);

  const canSubmit = name && jobId && jobName && clientName && source && cvFile;

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

  const submit = () => {
    if (!canSubmit || !cvFile) return;
    setRows((prev) => [
      ...prev,
      { name, jobId, jobName, clientName, source, cvFileName: cvFile.name }
    ]);
    setName("");
    setJobId("");
    setJobName("");
    setClientName("");
    setSource("");
    setCvFile(null);
  };

  return (
    <section className="surface-card p-5">
      <h2 className="mb-4 text-[15px] font-bold tracking-[0.12em] uppercase text-cyan-300">Upload to Manatal</h2>

      <div className="grid gap-4 md:grid-cols-12">
        <div className="flex flex-col gap-2 md:col-span-6">
          <label className="block text-sm">Candidate Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required aria-required="true" className="glass-input h-11 w-full px-3" placeholder="Dina Seikh Salleh" />
        </div>
        <div className="relative flex flex-col gap-2 md:col-span-6">
          <label className="block text-sm">Job ID (search wildcard) *</label>
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
            className="glass-input h-11 w-full px-3"
            placeholder="Start typing job id or name..."
          />
          {isJobDropdownOpen && jobSuggestions.length > 0 ? (
            <ul className="absolute z-30 max-h-44 w-full overflow-auto rounded-md border border-white/20 bg-[#0f172a] p-1 text-sm shadow-lg">
              {jobSuggestions.map((job) => (
                <li
                  key={job.id}
                  onClick={() => {
                    setJobId(job.id);
                    setJobName(job.name);
                    setClientName(job.client);
                    setJobQuery(`${job.id} - ${job.name}`);
                    setIsJobDropdownOpen(false);
                  }}
                  className="cursor-pointer rounded px-2 py-1 hover:bg-cyan-500/20"
                >
                  {job.id} — {job.name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 md:col-span-3">
          <label className="block text-sm text-slate-400">Job Name</label>
          <input value={jobName} readOnly className="glass-input h-11 w-full px-3 bg-slate-900" placeholder="Selected job name appears here" />
        </div>
        <div className="flex flex-col gap-2 md:col-span-3">
          <label className="block text-sm text-slate-400">Client Name</label>
          <input value={clientName} readOnly className="glass-input h-11 w-full px-3 bg-slate-900" placeholder="Selected client name appears here" />
        </div>
        <div className="flex flex-col gap-2 md:col-span-3">
          <label className="block text-sm">Source *</label>
          <select value={source} onChange={(e) => setSource(e.target.value)} required aria-required="true" className="glass-input h-11 w-full px-3 bg-[#0f172a] text-white">
            <option value="">Select source</option>
            <option value="Monster">Monster</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Indeed">Indeed</option>
            <option value="Referral">Referral</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 md:col-span-3">
          <label className="block text-sm">CV File *</label>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
              required
              aria-required="true"
              className="glass-input h-11 w-full px-3 pr-12"
              accept=".pdf,.doc,.docx"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
              📎
            </span>
          </div>
        </div>

        <div className="flex items-end gap-3 pt-1 md:col-span-12">
          <button onClick={submit} disabled={!canSubmit} className="primary-button rounded-[10px] px-5 py-2 disabled:opacity-50">
            Add row
          </button>
          <button onClick={() => {
            if (!canSubmit || !cvFile) return;
            // placeholder for real upload integration
            alert('Uploaded to Manatal: ' + name + ' / ' + jobId);
          }} className="glass-button rounded-[10px] px-5 py-2">
            Upload to Manatal
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-300">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Job ID</th>
              <th className="px-3 py-2">Job Name</th>
              <th className="px-3 py-2">Client Name</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">CV</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-5 text-center text-slate-400">Add candidate records to preview rows.</td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={`${row.jobId}-${idx}`} className="border-y border-white/10">
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2">{row.jobId}</td>
                  <td className="px-3 py-2">{row.jobName}</td>
                  <td className="px-3 py-2">{row.clientName}</td>
                  <td className="px-3 py-2">{row.source}</td>
                  <td className="px-3 py-2">{row.cvFileName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
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
    <section className="mx-auto w-full max-w-[700px]">
      <div className="surface-card flex flex-col gap-6 p-8">
        <h2 className="mb-4 text-[15px] font-bold tracking-[0.12em] uppercase text-cyan-300">Rubric Generator</h2>

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
              <div className="panel-border absolute left-0 right-0 top-[calc(100%+10px)] z-20 overflow-hidden rounded-[16px] bg-[#0f1115] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
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
                    <span className="text-cyan-400">{job.id}</span>
                    <span className="text-slate-100">{job.name}</span>
                    <span className="text-slate-400">{job.client}</span>
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
            <pre className="whitespace-pre-wrap font-sans leading-7 text-slate-200">{rubric}</pre>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CvFormatterTab() {
  type PreviewTab = "original" | "formatted";

  const [candidateName, setCandidateName] = useState("");
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

  async function formatCv() {
    if (!file || !candidateName.trim()) {
      setStatus({ state: "error", message: "Add a candidate name and attach a PDF or DOCX before formatting." });
      return;
    }

    setStatus({ state: "loading", message: "Formatting CV into the Oxydata Word layout..." });
    const formData = new FormData();
    formData.append("candidateName", candidateName.trim());
    formData.append("file", file);

    try {
      const response = await fetch("/api/cv-format", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as {
        previewHtml?: string;
        downloadUrl?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to format CV.");
      }

      setPreviewHtml(data.previewHtml ?? "");
      setDownloadUrl(data.downloadUrl ?? "");
      setRightPanelTab("formatted");
      setStatus({ state: "success", message: "Formatted CV preview generated successfully." });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Unexpected CV formatting error."
      });
    }
  }

  const selectedFileLabel = useMemo(() => {
    if (!file) {
      return "Drop PDF or DOCX here, or browse to upload";
    }

    return `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  }, [file]);

  const isFormatting = status?.state === "loading";
  const hasOriginalFile = Boolean(file && originalFileUrl);
  const isOriginalPdf = Boolean(file && file.name.toLowerCase().endsWith(".pdf"));

  return (
    <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <div className="surface-card flex flex-col gap-5 p-5">
        <h2 className="mb-4 text-[15px] font-bold tracking-[0.12em] uppercase text-cyan-300">CV Formatter</h2>
        <div>
          <SectionLabel>Candidate Name *</SectionLabel>
          <input
            value={candidateName}
            onChange={(event) => setCandidateName(event.target.value)}
            placeholder="Enter full candidate name"
            required
            aria-required="true"
            className="glass-input mt-3 h-12 w-full px-4"
          />
        </div>

        <div>
          <SectionLabel>CV File *</SectionLabel>
          <label className="panel-border mt-3 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[16px] bg-white/[0.03] px-5 py-6 text-center transition-colors duration-200 hover:bg-white/[0.05]">
            <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-white/[0.05] text-cyan-400">
              <UploadIcon />
            </div>
            <div className="mt-4 text-[13px] font-semibold text-slate-100">{selectedFileLabel}</div>
            <div className="mt-2 text-[11px] text-slate-500">Accepted formats: PDF or DOCX</div>
            <input
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

        <button
          type="button"
          onClick={formatCv}
          disabled={isFormatting}
          className="primary-button min-h-[54px] rounded-[14px] px-5 disabled:pointer-events-none disabled:opacity-55"
        >
          {isFormatting ? "Formatting…" : "Format CV"}
        </button>

        {status ? <StatusBox status={status} /> : null}
      </div>

      <div className="surface-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              id="cvDot"
              className={`h-2.5 w-2.5 rounded-full ${
                isFormatting
                  ? "animate-pulse bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.55)]"
                  : previewHtml
                    ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]"
                    : "bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.45)]"
              }`}
            />
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">CV Format</span>
            <div className="inline-flex rounded-[10px] border border-white/[0.12] bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => setRightPanelTab("original")}
                className={`rounded-[8px] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                  rightPanelTab === "original"
                    ? "bg-cyan-400/20 text-cyan-200"
                    : "text-slate-300 hover:text-cyan-200"
                }`}
                data-active={rightPanelTab === "original"}
              >
                Ori Format
              </button>
              <button
                type="button"
                onClick={() => setRightPanelTab("formatted")}
                className={`rounded-[8px] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                  rightPanelTab === "formatted"
                    ? "bg-cyan-400/20 text-cyan-200"
                    : "text-slate-300 hover:text-cyan-200"
                }`}
                data-active={rightPanelTab === "formatted"}
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
              className={`glass-button rounded-lg px-3 py-1.5 text-xs ${!downloadUrl ? "pointer-events-none opacity-30" : ""}`}
              aria-disabled={!downloadUrl}
            >
              Download
            </a>
          ) : null}
        </div>

        <div
          id="cvOutputBox"
          aria-busy={rightPanelTab === "formatted" ? isFormatting : false}
          className={`panel-border rounded-[16px] ${
            rightPanelTab === "formatted"
              ? `h-[624px] overflow-y-scroll ${previewHtml ? "bg-white text-slate-800" : "bg-white/[0.02]"}`
              : "min-h-[624px] overflow-hidden bg-white/[0.02]"
          }`}
        >
          {rightPanelTab === "original" && !hasOriginalFile ? (
            <div className="flex min-h-[624px] items-center justify-center p-8">
              <EmptyState
                title="No CV loaded yet"
                subtitle="Upload a CV file to preview the original document in this panel."
                icon={<DocumentIcon />}
              />
            </div>
          ) : null}

          {rightPanelTab === "original" && hasOriginalFile && isOriginalPdf ? (
            <iframe
              title="Original CV preview"
              src={originalFileUrl}
              className="h-[624px] w-full bg-white"
            />
          ) : null}

          {rightPanelTab === "original" && hasOriginalFile && !isOriginalPdf && isOriginalPreviewLoading ? (
            <div className="flex min-h-[624px] flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-white/[0.06] text-cyan-400">
                <ClockIcon />
              </div>
              <p className="text-[14px] font-semibold text-slate-100">Building original preview</p>
              <p className="max-w-sm text-[12px] leading-relaxed text-slate-400">
                Converting the uploaded file to an inline preview format.
              </p>
            </div>
          ) : null}

          {rightPanelTab === "original" && hasOriginalFile && !isOriginalPdf && !isOriginalPreviewLoading && originalPreviewError ? (
            <div className="flex min-h-[624px] items-center justify-center p-8">
              <EmptyState
                title="Original preview unavailable"
                subtitle={originalPreviewError}
                icon={<DocumentIcon />}
              />
            </div>
          ) : null}

          {rightPanelTab === "original" && hasOriginalFile && !isOriginalPdf && !isOriginalPreviewLoading && Boolean(originalPreviewUrl) ? (
            <iframe
              title="Original CV preview"
              src={originalPreviewUrl}
              className="h-[624px] w-full bg-white"
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
                ? "block min-h-[560px] bg-white p-4 text-slate-800 sm:p-6"
                : "hidden"
            }
          />

          {rightPanelTab === "formatted" && isFormatting ? (
            <div className="flex min-h-[624px] flex-col items-center justify-center gap-6 p-8 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-[16px] bg-white/[0.06] text-cyan-400">
                <ClockIcon />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-slate-100">Converting your CV</p>
                <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-slate-400">
                  {status?.message ??
                    "Parsing the document and building the Oxydata Word layout. This can take up to a minute."}
                </p>
              </div>
              <div className="w-full px-4">
                <div className="cv-format-progress-track">
                  <div className="cv-format-progress-bar" />
                </div>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  Please wait — do not close this tab
                </p>
              </div>
            </div>
          ) : null}
          {rightPanelTab === "formatted" && !previewHtml && !isFormatting ? (
            <div className="flex min-h-[624px] items-center justify-center p-8">
              <EmptyState
                title="No formatted CV yet"
                subtitle="Upload a CV and run the formatter to generate a Word-style preview here."
                icon={<DocumentIcon />}
              />
            </div>
          ) : null}
          <div
            ref={previewRef}
            className={rightPanelTab === "formatted" && previewHtml ? "block min-h-[560px] p-4 sm:p-6" : "hidden"}
          />
        </div>
      </div>
    </section>
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
      setProgressEntries((prev) => [...prev, `✅ Completed ${field.selectedId} at tier threshold ${tierThreshold}%`]);
    }

    setProgressEntries((prev) => [...prev, `✔ Pipeline stage set to ${pipelineStage}.`]);
    setIsRunning(false);
  };

  return (
    <section className="surface-card p-5">
      <h2 className="mb-4 text-[15px] font-bold tracking-[0.12em] uppercase text-cyan-300">AI Scoring</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Pipeline Stage</label>
          <input value={pipelineStage} onChange={(e) => setPipelineStage(e.target.value)} className="glass-input h-11 w-full px-3" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Tier 1 Pass Threshold (%)</label>
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
                <div className="panel-border absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-[16px] bg-[#0f1115] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
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
                      className="grid w-full grid-cols-[120px_1fr_1fr] gap-3 border-t border-white/6 px-4 py-3 text-left transition-colors duration-200 hover:bg-cyan-400/8"
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

      <div className="mt-5 rounded-[10px] border border-white/20 bg-white/[0.02] p-4">
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
          <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-2 text-xs text-slate-300">Technical log active (details are currently mock data for UI).</div>
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

function SetupTab() {
  const [openAiKey, setOpenAiKey] = useState("********************");
  const [manatalApiKey, setManatalApiKey] = useState("********************");
  const [airtableName, setAirtableName] = useState("Master AI Screener v2");
  const [defaultPipelineStage, setDefaultPipelineStage] = useState("New Candidates");
  const [tier1Threshold, setTier1Threshold] = useState("65");
  const [tier2Threshold, setTier2Threshold] = useState("80");
  const [autoUploadToManatal, setAutoUploadToManatal] = useState(true);
  const [autoSyncAirtable, setAutoSyncAirtable] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [statusBanner, setStatusBanner] = useState("All systems operational");
  const [lastSavedAt, setLastSavedAt] = useState("31 Mar 2026, 10:42 AM");

  const saveSettings = () => {
    setStatusBanner("Settings saved successfully");
    setLastSavedAt("31 Mar 2026, 10:45 AM");
  };

  const testConnections = () => {
    setStatusBanner("Connection test passed for OpenAI, Manatal, and Airtable");
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
            <label className="text-sm text-slate-300">Manatal API Key</label>
            <input value={manatalApiKey} onChange={(e) => setManatalApiKey(e.target.value)} className="glass-input h-11 w-full px-3" placeholder="Enter Manatal key" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300">Airtable Name</label>
            <input value={airtableName} onChange={(e) => setAirtableName(e.target.value)} className="glass-input h-11 w-full px-3" placeholder="Enter Airtable name" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300">Default Pipeline Stage</label>
            <select value={defaultPipelineStage} onChange={(e) => setDefaultPipelineStage(e.target.value)} className="glass-input h-11 w-full bg-[#0f172a] px-3 text-white">
              <option>New Candidates</option>
              <option>Shortlisted</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Placed</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300">Tier 1 Pass Threshold (%)</label>
            <input type="number" min={0} max={100} value={tier1Threshold} onChange={(e) => setTier1Threshold(e.target.value)} className="glass-input h-11 w-full px-3" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300">Tier 2 Pass Threshold (%)</label>
            <input type="number" min={0} max={100} value={tier2Threshold} onChange={(e) => setTier2Threshold(e.target.value)} className="glass-input h-11 w-full px-3" />
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="panel-border flex items-center justify-between rounded-[16px] bg-white/[0.02] px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-100">Auto Upload to Manatal</div>
              <div className="text-xs text-slate-400">Push uploaded candidates into Manatal automatically after validation.</div>
            </div>
            <button type="button" onClick={() => setAutoUploadToManatal((prev) => !prev)} className={toggleClass(autoUploadToManatal)}>
              {autoUploadToManatal ? "Enabled" : "Disabled"}
            </button>
          </div>
          <div className="panel-border flex items-center justify-between rounded-[16px] bg-white/[0.02] px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-100">Auto Sync to Airtable</div>
              <div className="text-xs text-slate-400">Mirror candidate scoring results into Airtable automatically.</div>
            </div>
            <button type="button" onClick={() => setAutoSyncAirtable((prev) => !prev)} className={toggleClass(autoSyncAirtable)}>
              {autoSyncAirtable ? "Enabled" : "Disabled"}
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
                  <div className="text-sm font-semibold text-slate-100">Manatal</div>
                  <div className="text-xs text-slate-400">Candidate sync and job lookup</div>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">Connected</span>
              </div>
            </div>
            <div className="panel-border rounded-[16px] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-100">Airtable</div>
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
              <div className="text-slate-100">Airtable connection test returned warning</div>
              <div className="mt-1 text-xs text-slate-500">31 Mar 2026, 10:43 AM</div>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="text-slate-100">Auto upload to Manatal enabled</div>
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
  const dividerRef = useRef<HTMLDivElement>(null);

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
    <section className="grid gap-0" style={{ gridTemplateColumns: `calc(${dividerX}% - 0.5cm) 1cm calc(${100 - dividerX}% - 0.5cm)` }}>
      <div className="surface-card p-5">
        <h2 className="mb-4 text-[15px] font-bold tracking-[0.12em] uppercase text-cyan-300">Job Posting</h2>
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
              className="command-button group relative glass-button min-h-11 rounded-[8px] px-4 py-2 text-left text-[12px] font-semibold tracking-[0.02em] text-slate-300"
            >
              <span className={isActive ? "drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] text-cyan-400" : ""}>
                <span className="text-[18px]">{button.emoji}</span>{" "}
                {button.label}
              </span>
              <span className="pointer-events-none absolute -top-11 left-1/2 z-20 hidden w-max max-w-[240px] -translate-x-1/2 rounded-md border border-cyan-400/35 bg-slate-950/95 px-3 py-2 text-center text-[11px] font-medium normal-case leading-4 text-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.45)] group-hover:block group-focus-visible:block">
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
        {isLoading ? <div className="mt-3 text-sm text-slate-300">Running...</div> : null}
      </div>

      <div
        ref={dividerRef}
        onMouseDown={() => {
          const handleMouseMove = (e: MouseEvent) => {
            if (!dividerRef.current) return;
            const parent = dividerRef.current.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            const newX = ((e.clientX - rect.left) / rect.width) * 100;
            setDividerX(Math.max(30, Math.min(75, newX)));
          };

          const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
          };

          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        }}
        className="bg-white/20 hover:bg-cyan-400/60 cursor-col-resize transition-colors backdrop-blur-sm border-l border-r border-white/30 w-2 flex items-center justify-center"
      >
        <div className="w-0.5 h-8 bg-cyan-400/40 rounded-full" />
      </div>

      <div className="surface-card flex min-h-[620px] flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Output</span>
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

        <div className="panel-border flex min-h-[612px] flex-1 rounded-[16px] bg-white/[0.02] p-6">
          <div className="w-full text-sm text-slate-200 whitespace-pre-wrap">{outputText || "Output will appear here."}</div>
        </div>
      </div>

      {isHelpOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[20px] border border-white/15 bg-slate-950/95 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Job Posting Commands</h3>
                <p className="mt-1 text-sm text-slate-400">Available actions for the Job Posting bot.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="glass-button rounded-lg px-3 py-1.5 text-xs"
              >
                Close
              </button>
            </div>

            <div className="overflow-x-auto rounded-[16px] border border-white/10 bg-white/[0.03]">
              <table className="w-full min-w-[720px] text-left text-sm text-slate-200">
                <thead className="bg-white/[0.04] text-[11px] uppercase tracking-[0.12em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Command</th>
                    <th className="px-4 py-3">What it does</th>
                  </tr>
                </thead>
                <tbody>
                  {helpRows.map((row) => (
                    <tr key={row.command} className="border-t border-white/10 align-top">
                      <td className="px-4 py-3 font-mono text-cyan-300">{row.command}</td>
                      <td className="px-4 py-3 text-slate-300">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SectionLabel({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300 ${className}`}>{children}</div>;
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
  icon
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[320px] flex-col items-center justify-center text-center">
      <div className="grid h-14 w-14 place-items-center rounded-[16px] bg-white/[0.04] text-cyan-400">{icon}</div>
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
