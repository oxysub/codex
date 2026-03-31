'use client';

interface WordPreviewProps {
  candidateName: string;
}

export default function WordPreview({ candidateName }: WordPreviewProps) {
  const filename = `CV_${candidateName.replace(/\s+/g, '_')}_Formatted.docx`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Calibri, Arial, sans-serif', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Word Topbar */}
      <div style={{ background: '#2b579a', height: 38, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10, flexShrink: 0 }}>
        <div style={{ background: 'white', color: '#2b579a', fontWeight: 700, fontSize: 14, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3 }}>W</div>
        <span style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>Word</span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>— Read View</span>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginLeft: 8 }}>{filename}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 4, padding: '3px 10px', fontSize: 11, cursor: 'pointer' }}>Edit in Browser</button>
          <button style={{ background: 'white', color: '#2b579a', border: 'none', borderRadius: 4, padding: '3px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Open in Word</button>
        </div>
      </div>

      {/* Ribbon Tabs */}
      <div style={{ background: '#f3f2f1', borderBottom: '1px solid #c8c6c4', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 4, flexShrink: 0 }}>
        {['File', 'Home', 'Insert', 'Layout', 'References', 'Review', 'View'].map(tab => (
          <span key={tab} style={{
            padding: '6px 10px',
            fontSize: 11,
            color: tab === 'Home' ? '#2b579a' : '#444',
            fontWeight: tab === 'Home' ? 600 : 400,
            borderBottom: tab === 'Home' ? '2px solid #2b579a' : '2px solid transparent',
            cursor: 'pointer',
          }}>{tab}</span>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ background: 'white', borderBottom: '1px solid #c8c6c4', display: 'flex', alignItems: 'center', padding: '4px 12px', gap: 8, flexShrink: 0 }}>
        <select style={{ fontSize: 11, border: '1px solid #c8c6c4', borderRadius: 3, padding: '2px 4px', background: 'white' }}>
          <option>Calibri</option>
        </select>
        <select style={{ fontSize: 11, border: '1px solid #c8c6c4', borderRadius: 3, padding: '2px 4px', width: 44, background: 'white' }}>
          <option>11</option>
        </select>
        <div style={{ display: 'flex', gap: 2 }}>
          {['B', 'I', 'U'].map(b => (
            <button key={b} style={{ width: 22, height: 22, background: 'none', border: '1px solid transparent', borderRadius: 3, fontSize: 12, fontWeight: b === 'B' ? 700 : 400, fontStyle: b === 'I' ? 'italic' : 'normal', textDecoration: b === 'U' ? 'underline' : 'none', cursor: 'pointer', color: '#333' }}>{b}</button>
          ))}
        </div>
        <div style={{ width: 1, height: 16, background: '#c8c6c4', margin: '0 4px' }} />
        {['Normal', 'Heading 1', 'Heading 2'].map((s, i) => (
          <span key={s} style={{
            padding: '2px 8px',
            fontSize: 10,
            borderRadius: 3,
            background: i === 0 ? 'rgba(43,87,154,0.1)' : 'transparent',
            color: i === 0 ? '#2b579a' : '#444',
            border: i === 0 ? '1px solid rgba(43,87,154,0.3)' : '1px solid transparent',
            cursor: 'pointer',
          }}>{s}</span>
        ))}
      </div>

      {/* Grey Canvas */}
      <div style={{ background: '#b0aea9', flex: 1, overflow: 'auto', padding: '24px 20px', display: 'flex', justifyContent: 'center' }}>
        {/* A4 Page */}
        <div style={{ background: 'white', maxWidth: 560, width: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.3)', padding: '48px 56px', fontFamily: 'Calibri, Arial, sans-serif', fontSize: '10.5pt', lineHeight: 1.4, color: '#333' }}>
          {/* Name */}
          <div style={{ fontSize: '18pt', fontWeight: 700, color: '#1A3C5E', textTransform: 'uppercase', marginBottom: 6 }}>
            {candidateName || 'CANDIDATE NAME'}
          </div>
          {/* Contact line */}
          <div style={{ fontSize: '8.5pt', color: '#444', borderBottom: '2pt solid #1A3C5E', paddingBottom: 8, marginBottom: 14 }}>
            candidate@email.com · +60 12-345 6789 · Kuala Lumpur, Malaysia · linkedin.com/in/candidate
          </div>
          {/* Summary */}
          <Section title="PROFESSIONAL SUMMARY" />
          <p style={{ fontSize: '10.5pt', marginBottom: 14, marginTop: 6 }}>
            Experienced professional with a strong track record in driving organizational success. Skilled in strategy, stakeholder management, and cross-functional leadership. Passionate about leveraging technology to solve complex business challenges.
          </p>
          {/* Experience */}
          <Section title="WORK EXPERIENCE" />
          <ExperienceEntry
            title="Senior Analyst"
            company="Tech Company Sdn Bhd"
            date="Jan 2021 – Present"
            bullets={['Led cross-functional team projects delivering 30% efficiency gains', 'Managed stakeholder relationships across multiple business units', 'Developed strategic frameworks for process improvement initiatives']}
          />
          <ExperienceEntry
            title="Analyst"
            company="Consulting Firm Sdn Bhd"
            date="Jun 2018 – Dec 2020"
            bullets={['Supported senior consultants on client engagements', 'Produced detailed reports and presentations for C-suite audiences']}
          />
          {/* Education */}
          <Section title="EDUCATION" />
          <div style={{ marginBottom: 14, marginTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '10.5pt' }}>Bachelor of Business Administration</span>
              <span style={{ fontSize: '8.5pt', color: '#666' }}>2014 – 2018</span>
            </div>
            <div style={{ fontSize: '9.5pt', color: '#2b579a', fontWeight: 600 }}>University of Malaya</div>
          </div>
          {/* Skills */}
          <Section title="KEY SKILLS" />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginTop: 6 }}>
            <tbody>
              <tr>
                {[
                  ['• Project Management', '• Data Analysis', '• Stakeholder Engagement'],
                  ['• Strategic Planning', '• MS Office Suite', '• SQL / Python'],
                  ['• Team Leadership', '• Process Improvement', '• Risk Management'],
                ].map((col, i) => (
                  <td key={i} style={{ verticalAlign: 'top', paddingRight: 12, width: '33%' }}>
                    {col.map((skill, j) => <div key={j} style={{ marginBottom: 3 }}>{skill}</div>)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          {/* Footer */}
          <div style={{ marginTop: 32, paddingTop: 8, borderTop: '0.5pt solid #ddd', textAlign: 'center', fontSize: '7.5pt', color: '#bbb' }}>
            Formatted by Oxydata CV Formatter · Tech Talent Sdn Bhd · Confidential
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ background: '#2b579a', height: 24, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 16, flexShrink: 0 }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 11 }}>Page 1 of 1</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>245 words</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>English (Malaysia)</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginLeft: 'auto' }}>100%</span>
      </div>
    </div>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div style={{ fontSize: '8.5pt', fontWeight: 700, color: '#1A3C5E', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '0.75pt solid #aaa', paddingBottom: 3, marginBottom: 6 }}>
      {title}
    </div>
  );
}

function ExperienceEntry({ title, company, date, bullets }: { title: string; company: string; date: string; bullets: string[] }) {
  return (
    <div style={{ marginBottom: 12, marginTop: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontWeight: 700, fontSize: '10.5pt' }}>{title}</span>
        <span style={{ fontSize: '8.5pt', color: '#666' }}>{date}</span>
      </div>
      <div style={{ fontSize: '9.5pt', color: '#2b579a', fontWeight: 600, marginBottom: 4 }}>{company}</div>
      <ul style={{ margin: 0, paddingLeft: 17, fontSize: '10pt' }}>
        {bullets.map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
      </ul>
    </div>
  );
}
