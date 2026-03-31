'use client';
import { useState, useRef, useCallback } from 'react';
import GlassButton from '../shared/GlassButton';
import GlassInput from '../shared/GlassInput';
import StatusBox, { StatusState } from '../shared/StatusBox';
import WordPreview from '../shared/WordPreview';

export default function CVFormatter() {
  const [candidateName, setCandidateName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<StatusState>('hidden');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [formatted, setFormatted] = useState(false);
  const [formattedName, setFormattedName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return;
    const valid = ['.pdf', '.docx', '.doc'];
    const ext = selectedFile.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? '';
    if (!valid.includes(ext)) {
      setStatus('error');
      setStatusMsg('Invalid file type. Please upload PDF or DOCX.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setStatus('error');
      setStatusMsg('File too large. Maximum size is 10MB.');
      return;
    }
    setFile(selectedFile);
    setStatus('hidden');
  }, []);

  const handleFormat = useCallback(async () => {
    if (!candidateName.trim()) {
      setStatus('error');
      setStatusMsg('Please enter the candidate name.');
      return;
    }
    if (!file) {
      setStatus('error');
      setStatusMsg('Please upload a CV file.');
      return;
    }
    setLoading(true);
    setStatus('loading');
    setStatusMsg('Formatting CV...');
    setFormatted(false);

    try {
      const formData = new FormData();
      formData.append('candidate_name', candidateName);
      formData.append('cv_file', file);
      const res = await fetch('/api/format-cv', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setFormattedName(candidateName);
        setFormatted(true);
        setStatus('success');
        setStatusMsg(data.message || 'CV formatted successfully!');
      } else {
        throw new Error(data.message || 'Formatting failed');
      }
    } catch (err: unknown) {
      setStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Failed to format CV. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [candidateName, file]);

  const sectionLabel: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#cbd5e1',
    marginBottom: 8,
    display: 'block',
  };

  const uploadZoneStyle: React.CSSProperties = {
    border: `1px dashed ${file ? 'rgba(6,182,212,0.6)' : isDragOver ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.15)'}`,
    borderRadius: 12,
    padding: 24,
    textAlign: 'center',
    cursor: 'pointer',
    background: isDragOver ? 'rgba(6,182,212,0.05)' : 'transparent',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, height: 'calc(100vh - 57px)', boxSizing: 'border-box' }}>
      {/* Left Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, overflowY: 'auto' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>CV Formatter</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Upload a candidate CV to reformat to the Oxydata standard template</div>
        </div>

        <div>
          <span style={sectionLabel}>Candidate Name</span>
          <GlassInput
            placeholder="e.g. Ahmad Faizal bin Ismail"
            value={candidateName}
            onChange={e => setCandidateName(e.target.value)}
          />
        </div>

        <div>
          <span style={sectionLabel}>Original CV</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            style={{ display: 'none' }}
            onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <div
            style={uploadZoneStyle}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files[0] ?? null); }}
          >
            <div style={{
              width: 40, height: 40, margin: '0 auto 10px',
              background: file ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.05)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={file ? '#06B6D4' : '#64748b'} strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: file ? '#06B6D4' : '#94a3b8', marginBottom: 4 }}>
              {file ? file.name : 'Click to upload CV'}
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>PDF or DOCX — max 10MB</div>
          </div>
        </div>

        <GlassButton
          variant="cyan"
          fullWidth
          onClick={handleFormat}
          disabled={loading}
          style={{ gap: 8 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          {loading ? 'Formatting...' : 'Format CV'}
        </GlassButton>

        <StatusBox state={status} message={statusMsg} />
      </div>

      {/* Right Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div
            style={{
              width: 7, height: 7, borderRadius: '50%',
              background: formatted ? '#06B6D4' : '#334155',
              boxShadow: formatted ? '0 0 6px rgba(6,182,212,0.8)' : 'none',
              transition: 'all 0.3s ease',
            }}
          />
          {formatted && (
            <GlassButton variant="violet" style={{ marginLeft: 'auto' }}>
              ⬇ Download .docx
            </GlassButton>
          )}
        </div>

        <div
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.03)',
            border: '0.5px solid rgba(255,255,255,0.09)',
            borderRadius: 12,
            minHeight: 500,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: formatted ? 'none' : 'flex',
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>No CV formatted yet</div>
            <div style={{ fontSize: 12, color: '#475569', textAlign: 'center' }}>
              Enter a candidate name, upload a CV,<br />and click Format CV
            </div>
          </div>

          <div
            style={{
              display: formatted ? 'flex' : 'none',
              flex: 1,
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {formatted && <WordPreview candidateName={formattedName} />}
          </div>
        </div>
      </div>
    </div>
  );
}
