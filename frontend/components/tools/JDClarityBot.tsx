'use client';
import { useState, useCallback } from 'react';
import GlassButton from '../shared/GlassButton';
import CommandButton from '../shared/CommandButton';
import StatusBox, { StatusState } from '../shared/StatusBox';

type Command = '/full' | '/questions' | '/client' | '/export' | '/upload' | '/update' | '/finalize' | '/help';

const commands: { cmd: Command; desc: string; disabled?: boolean }[] = [
  { cmd: '/full', desc: 'Full analysis' },
  { cmd: '/questions', desc: 'HM + TA questions' },
  { cmd: '/client', desc: 'Client intake view' },
  { cmd: '/export', desc: 'Export to Excel' },
  { cmd: '/upload', desc: 'Upload filled Excel', disabled: true },
  { cmd: '/update', desc: 'Re-analyse after upload', disabled: true },
  { cmd: '/finalize', desc: 'Rewrite JD', disabled: true },
  { cmd: '/help', desc: 'Show all commands' },
];

const PLACEHOLDER = `Paste the full job description here...

Example:
Job Title: Senior Software Engineer
Company: Acme Corp
Location: Kuala Lumpur, Malaysia

About the Role:
We are looking for a Senior Software Engineer to join our growing team...

Requirements:
- 5+ years of experience in software development
- Proficiency in Python, JavaScript, or similar languages
- Experience with cloud platforms (AWS, GCP, or Azure)`;

const MOCK_OUTPUT = `## JD Analysis Report

**Overall Score: 78/100**

### Summary
This is a well-structured job description for a Senior Software Engineer role at Acme Corp. The JD provides clear requirements and responsibilities.

### Strengths
- Clear job title and location information
- Specific technical requirements listed
- Good experience level expectations

### Areas for Improvement
- Missing compensation range information
- No information about team size or structure
- Could benefit from more details about company culture

### Key Requirements Extracted
| Category | Details |
|----------|---------|
| Experience | 5+ years software development |
| Technical | Python, JavaScript, Cloud (AWS/GCP/Azure) |
| Location | Kuala Lumpur, Malaysia |

### Recommended Questions
1. What does the day-to-day look like for this role?
2. What are the main challenges the team is currently facing?
3. What does success look like in the first 90 days?

### Risk Flags
- ⚠️ No salary range specified — may reduce application quality
- ⚠️ Vague "growing team" description — clarify team size`;

export default function JDClarityBot() {
  const [activeCommand, setActiveCommand] = useState<Command>('/full');
  const [jdText, setJdText] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<StatusState>('hidden');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRunAnalysis = useCallback(async () => {
    if (!jdText.trim()) {
      setStatus('error');
      setStatusMsg('Please paste a job description first.');
      return;
    }
    setLoading(true);
    setStatus('loading');
    setStatusMsg('Analysing job description...');
    setOutput('');

    await new Promise(r => setTimeout(r, 1500));

    setOutput(MOCK_OUTPUT);
    setStatus('success');
    setStatusMsg('Analysis complete.');
    setLoading(false);
  }, [jdText]);

  const handleClear = useCallback(() => {
    setJdText('');
    setOutput('');
    setStatus('hidden');
    setStatusMsg('');
  }, []);

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
    <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24, height: 'calc(100vh - 57px)', boxSizing: 'border-box' }}>
      {/* Left Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
        <div>
          <span style={sectionLabel}>Job Description</span>
          <div style={{ position: 'relative' }}>
            <textarea
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder={PLACEHOLDER}
              style={{
                width: '100%',
                height: 446,
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: '#f1f5f9',
                fontSize: 13,
                lineHeight: 1.6,
                padding: '12px 14px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: '#64748b', marginTop: 4 }}>
              {jdText.length} characters
            </div>
          </div>
        </div>

        <div>
          <span style={sectionLabel}>Select Command</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {commands.map(({ cmd, desc, disabled }) => (
              <CommandButton
                key={cmd}
                command={cmd}
                description={desc}
                active={activeCommand === cmd}
                disabled={disabled}
                onClick={() => !disabled && setActiveCommand(cmd)}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <GlassButton
            variant="cyan"
            style={{ flex: 1 }}
            onClick={handleRunAnalysis}
            disabled={loading}
          >
            {loading ? 'Analysing...' : '▶ Run Analysis'}
          </GlassButton>
          <GlassButton variant="neutral" onClick={handleClear} disabled={loading}>
            Clear
          </GlassButton>
        </div>

        <StatusBox state={status} message={statusMsg} />
      </div>

      {/* Right Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: output ? '#06B6D4' : '#334155', boxShadow: output ? '0 0 6px rgba(6,182,212,0.8)' : 'none' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Output</span>
        </div>
        <div style={{
          flex: 1,
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid rgba(255,255,255,0.09)',
          borderRadius: 16,
          minHeight: 460,
          overflow: 'auto',
          display: 'flex',
          alignItems: output ? 'flex-start' : 'center',
          justifyContent: output ? 'flex-start' : 'center',
          padding: output ? '20px 24px' : 0,
        }}>
          {output ? (
            <pre style={{ color: '#f1f5f9', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{output}</pre>
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>📄</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>No analysis yet</div>
              <div style={{ fontSize: 12, color: '#475569' }}>Paste a JD, select a command,<br />and click Run Analysis</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
