import React from 'react';
import { X } from 'lucide-react';
import { HELP_CONTENT } from '../constants';

export default function HelpModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--background)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Documentation & Help</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--muted-foreground)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1rem 0' }}>
          {/* Syntax Section */}
          <section style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '0.5rem', marginTop: 0 }}>{HELP_CONTENT.syntax.title}</h4>
            <p style={{ marginBottom: '1rem', color: 'var(--muted-foreground)' }}>
              {HELP_CONTENT.syntax.description}{' '}
              <a href={HELP_CONTENT.syntax.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                View Go template docs
              </a>
            </p>

            <div
              style={{
                backgroundColor: 'var(--card)',
                padding: '1rem',
                borderRadius: '4px',
                border: '1px solid var(--border)',
              }}
            >
              {HELP_CONTENT.syntax.examples.map((ex, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: idx < HELP_CONTENT.syntax.examples.length - 1 ? '0.75rem' : 0,
                    alignItems: 'center',
                  }}
                >
                  <code
                    style={{
                      backgroundColor: 'var(--muted)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '3px',
                      fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
                      fontSize: '0.875rem',
                      minWidth: '280px',
                    }}
                  >
                    {ex.syntax}
                  </code>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                    {ex.desc}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Functions Section */}
          <section>
            <h4 style={{ marginBottom: '0.5rem', marginTop: 0 }}>Available Functions</h4>
            <p style={{ marginBottom: '1rem', color: 'var(--muted-foreground)' }}>
              Powered by{' '}
              <a
                href="https://github.com/brianvoe/gofakeit"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--primary)' }}
              >
                gofakeit library
              </a>
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border)' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--muted)' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--border)', width: '150px' }}>Category</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--border)' }}>Functions</th>
                </tr>
              </thead>
              <tbody>
                {HELP_CONTENT.functions.map((func, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>{func.category}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <code
                        style={{
                          backgroundColor: 'var(--muted)',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '3px',
                          fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
                          fontSize: '0.8125rem',
                        }}
                      >
                        {func.items}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
}
