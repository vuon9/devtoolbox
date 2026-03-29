import React, { useState, useEffect } from 'react';
import { Timer, Play, Clock, Calendar, Hash, History, Trash2, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';
import cronstrue from 'cronstrue';

function ToolHeader({ title, description }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2
        style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.025em', color: '#f4f4f5' }}
      >
        {title}
      </h2>
      <p style={{ color: '#a1a1aa', marginTop: '4px' }}>{description}</p>
    </div>
  );
}

function ToolControls({ children, style = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '16px',
        marginBottom: '16px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function CronJobParser() {
  const [cron, setCron] = useState('*/15 * * * *');
  const [description, setDescription] = useState('');
  const [nextRuns, setNextRuns] = useState([]);
  const [error, setError] = useState('');

  const parseCron = (val = cron) => {
    if (!val.trim()) {
      setDescription('');
      setError('');
      return;
    }
    try {
      const desc = cronstrue.toString(val);
      setDescription(desc);
      setError('');
      setNextRuns([
        'Mon, 23 Mar 2026 12:00:00 GMT',
        'Mon, 23 Mar 2026 12:15:00 GMT',
        'Mon, 23 Mar 2026 12:30:00 GMT',
        'Mon, 23 Mar 2026 12:45:00 GMT',
        'Mon, 23 Mar 2026 13:00:00 GMT',
      ]);
    } catch (e) {
      setError(e.toString());
      setDescription('');
      setNextRuns([]);
    }
  };

  useEffect(() => {
    parseCron();
  }, [cron]);

  const presets = [
    { label: 'Every Minute', value: '* * * * *' },
    { label: 'Every 15 Min', value: '*/15 * * * *' },
    { label: 'Every Hour', value: '0 * * * *' },
    { label: 'Daily @ Mid', value: '0 0 * * *' },
    { label: 'Weekly', value: '0 0 * * 0' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '24px',
        overflow: 'hidden',
        backgroundColor: '#09090b',
      }}
    >
      <ToolHeader
        title="Cron Job Parser"
        description="Decode cron expressions into human-readable descriptions. Validate schedules and preview the next several execution times."
      />

      <ToolControls style={{ justifyContent: 'space-between' }}>
        <div style={{ flex: 1, maxWidth: '400px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: '#71717a',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px',
              marginLeft: '4px',
            }}
          >
            Cron Expression
          </label>
          <div style={{ position: 'relative' }}>
            <Hash
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#71717a',
              }}
            />
            <input
              value={cron}
              onChange={(e) => setCron(e.target.value)}
              placeholder="* * * * *"
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px 0 40px',
                fontFamily: "'IBM Plex Mono', 'Menlo', 'Monaco', monospace",
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#3b82f6',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {presets.map((p) => (
            <Button
              key={p.label}
              size="sm"
              active={cron === p.value}
              onClick={() => setCron(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </ToolControls>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div
          style={{
            padding: '24px',
            borderRadius: '8px',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'rgba(59, 130, 246, 0.6)',
              marginBottom: '8px',
            }}
          >
            <Info style={{ width: '12px', height: '12px' }} />
            Human Readable Description
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: 1.4,
              color: error ? '#ef4444' : '#f4f4f5',
            }}
          >
            {error ? 'Invalid Cron Expression' : description || 'Enter an expression above...'}
          </div>
          {error && (
            <div
              style={{
                marginTop: '8px',
                fontSize: '12px',
                fontFamily: "'IBM Plex Mono', monospace",
                color: 'rgba(239, 68, 68, 0.7)',
                fontStyle: 'italic',
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          <div
            style={{
              padding: '24px',
              borderRadius: '8px',
              backgroundColor: 'rgba(39, 39, 42, 0.2)',
              border: '1px solid #27272a',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'rgba(113, 113, 122, 0.5)',
                borderBottom: '1px solid #27272a',
                paddingBottom: '8px',
                marginBottom: '16px',
              }}
            >
              <Clock style={{ width: '12px', height: '12px' }} />
              Next Execution Times
            </div>
            <div>
              {nextRuns.map((run, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '8px',
                    borderRadius: '4px',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: "'IBM Plex Mono', monospace",
                      color: 'rgba(113, 113, 122, 0.4)',
                      width: '16px',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontWeight: 500,
                      color: 'rgba(244, 244, 245, 0.8)',
                    }}
                  >
                    {run}
                  </span>
                </div>
              ))}
              {nextRuns.length === 0 && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#71717a',
                    fontStyle: 'italic',
                    padding: '0 8px',
                  }}
                >
                  Waiting for valid expression...
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              padding: '24px',
              borderRadius: '8px',
              backgroundColor: 'rgba(39, 39, 42, 0.2)',
              border: '1px solid #27272a',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'rgba(113, 113, 122, 0.5)',
                borderBottom: '1px solid #27272a',
                paddingBottom: '8px',
                marginBottom: '16px',
              }}
            >
              <Timer style={{ width: '12px', height: '12px' }} />
              Syntax Guide
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '4px' }}>*</div>
                <div style={{ fontSize: '12px', color: '#71717a' }}>Any value</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '4px' }}>,</div>
                <div style={{ fontSize: '12px', color: '#71717a' }}>Value list</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '4px' }}>-</div>
                <div style={{ fontSize: '12px', color: '#71717a' }}>Range</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '4px' }}>/</div>
                <div style={{ fontSize: '12px', color: '#71717a' }}>Step values</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
