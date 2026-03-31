'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import GlassButton from '../shared/GlassButton';
import GlassInput from '../shared/GlassInput';
import StatusBox, { StatusState } from '../shared/StatusBox';

interface Job {
  id: string;
  name: string;
  client: string;
}

const MOCK_JOBS: Job[] = [
  { id: 'TT20001', name: 'Senior Software Engineer', client: 'Petronas Digital Sdn Bhd' },
  { id: 'TT20002', name: 'Data Analyst', client: 'Maybank' },
  { id: 'TT20003', name: 'Product Manager', client: 'Grab' },
];

const MagnifierIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
  </svg>
);

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

export default function RubricGenerator() {
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [status, setStatus] = useState<StatusState>('hidden');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = jobs.filter(j =>
    j.id.toLowerCase().includes(search.toLowerCase()) ||
    j.name.toLowerCase().includes(search.toLowerCase()) ||
    j.client.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = useCallback((job: Job) => {
    setSelectedJob(job);
    setSearch(job.id);
    setDropdownOpen(false);
    setStatus('hidden');
  }, []);

  const handleRefresh = useCallback(async () => {
    setStatus('loading');
    setStatusMsg('Refreshing jobs from Manatal...');
    await new Promise(r => setTimeout(r, 1000));
    setJobs(MOCK_JOBS);
    setStatus('success');
    setStatusMsg('Jobs refreshed successfully.');
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedJob) {
      setStatus('error');
      setStatusMsg('Please select a job first.');
      return;
    }
    setLoading(true);
    setStatus('loading');
    setStatusMsg('Generating rubric...');

    try {
      const res = await fetch('/api/generate-rubric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: selectedJob.id, job_name: selectedJob.name, client: selectedJob.client }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setStatusMsg(data.message || 'Rubric generated successfully!');
      } else {
        throw new Error(data.message || 'Generation failed');
      }
    } catch (err: unknown) {
      setStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Failed to generate rubric. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedJob]);

  const sectionLabel: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#cbd5e1',
    marginBottom: 8,
    display: 'block',
  };

  return (
    <div style={{ padding: '32px 28px', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        maxWidth: 700,
        width: '100%',
        background: 'rgba(255,255,255,0.03)',
        border: '0.5px solid rgba(255,255,255,0.09)',
        borderRadius: 16,
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, background: 'rgba(6,182,212,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Rubric Generator</div>
            <div style={{ fontSize: 12, color: '#475569' }}>Select a job to generate its scoring rubric</div>
          </div>
        </div>

        {/* Job ID Search */}
        <div>
          <span style={sectionLabel}>Job ID</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }} ref={dropdownRef}>
              <GlassInput
                leftIcon={<MagnifierIcon />}
                placeholder="Search by Job ID, name or client..."
                value={search}
                autoComplete="off"
                onChange={e => {
                  setSearch(e.target.value);
                  setDropdownOpen(true);
                  if (!e.target.value) setSelectedJob(null);
                }}
                onFocus={() => setDropdownOpen(true)}
              />
              {dropdownOpen && filtered.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: '#111827',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  border: '0.5px solid rgba(255,255,255,0.1)',
                  maxHeight: 200,
                  overflowY: 'auto',
                  zIndex: 100,
                }}>
                  {filtered.map(job => (
                    <div
                      key={job.id}
                      onClick={() => handleSelect(job)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 1fr 1fr',
                        gap: 8,
                        padding: '10px 14px',
                        cursor: 'pointer',
                        borderBottom: '0.5px solid rgba(255,255,255,0.05)',
                        background: selectedJob?.id === job.id ? 'rgba(6,182,212,0.1)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(6,182,212,0.1)')}
                      onMouseLeave={e => (e.currentTarget.style.background = selectedJob?.id === job.id ? 'rgba(6,182,212,0.1)' : 'transparent')}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#06B6D4', fontFamily: 'monospace' }}>{job.id}</span>
                      <span style={{ fontSize: 12, color: '#e2e8f0' }}>{job.name}</span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{job.client}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <GlassButton variant="neutral" onClick={handleRefresh} style={{ gap: 6, padding: '9px 13px', flexShrink: 0 }}>
              <RefreshIcon />
              <span style={{ fontSize: 11 }}>Refresh from Manatal</span>
            </GlassButton>
          </div>

          {/* Job detail pills */}
          {selectedJob && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {[{ label: 'Job Name', value: selectedJob.name }, { label: 'Client', value: selectedJob.client }].map(pill => (
                <div key={pill.label} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '0.5px solid rgba(255,255,255,0.12)',
                  borderRadius: 8,
                  padding: '8px 14px',
                  minWidth: 0,
                  flex: 1,
                }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase' as const, color: '#475569', letterSpacing: '0.08em', marginBottom: 3 }}>{pill.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#f1f5f9' }}>{pill.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <StatusBox state={status} message={statusMsg} />

        {/* Generate button */}
        <GlassButton
          variant="cyan"
          fullWidth
          onClick={handleGenerate}
          disabled={loading}
          style={{ gap: 8 }}
        >
          <PlayIcon />
          {loading ? 'Generating...' : 'Generate Rubric'}
        </GlassButton>
      </div>
    </div>
  );
}
