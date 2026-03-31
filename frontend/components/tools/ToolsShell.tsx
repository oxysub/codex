'use client';
import { useState } from 'react';
import JDClarityBot from './JDClarityBot';
import RubricGenerator from './RubricGenerator';
import CVFormatter from './CVFormatter';

type Tab = 'jd' | 'rubric' | 'cv';

const tabs: { id: Tab; label: string; version: string }[] = [
  { id: 'jd', label: 'JD Clarity Bot', version: 'v3.1' },
  { id: 'rubric', label: 'Rubric Generator', version: 'v1.0' },
  { id: 'cv', label: 'CV Formatter', version: 'v2.0' },
];

export default function ToolsShell() {
  const [activeTab, setActiveTab] = useState<Tab>('jd');
  const activeVersion = tabs.find(t => t.id === activeTab)?.version ?? 'v3.1';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '0.5px solid rgba(255,255,255,0.1)',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <span style={{ color: '#06B6D4', fontSize: 15, fontWeight: 700, letterSpacing: '0.08em' }}>⚡ OXYDATA</span>
        {/* Divider */}
        <div style={{ width: '0.5px', height: 18, background: 'rgba(255,255,255,0.2)' }} />
        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.05)',
                border: `0.5px solid ${activeTab === tab.id ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.12)'}`,
                color: activeTab === tab.id ? '#06B6D4' : '#64748b',
                borderRadius: 8,
                padding: '5px 16px',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Badge */}
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            background: 'rgba(6,182,212,0.15)',
            color: '#06B6D4',
            border: '0.5px solid rgba(6,182,212,0.35)',
            borderRadius: 99,
            padding: '3px 10px',
            fontSize: 11,
            fontWeight: 600,
          }}>{activeVersion}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ display: activeTab === 'jd' ? 'block' : 'none' }}><JDClarityBot /></div>
        <div style={{ display: activeTab === 'rubric' ? 'block' : 'none' }}><RubricGenerator /></div>
        <div style={{ display: activeTab === 'cv' ? 'block' : 'none' }}><CVFormatter /></div>
      </div>
    </div>
  );
}
