import React, { useState, useEffect } from 'react';
import cronstrue from 'cronstrue';
import { TextInput, Tile } from '@carbon/react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';
import useLayoutToggle from '../hooks/useLayoutToggle';

export default function CronJobParser() {
    const [cron, setCron] = useState('* * * * *');
    const [desc, setDesc] = useState('');
    const [error, setError] = useState('');

    const layout = useLayoutToggle({
        toolKey: 'cron-parser-layout',
        defaultDirection: 'horizontal',
        showToggle: true,
        persist: true
    });

    useEffect(() => {
        try {
            if (!cron.trim()) {
                setDesc('');
                setError('');
                return;
            }
            const str = cronstrue.toString(cron);
            setDesc(str);
            setError('');
        } catch (e) {
            setError('Invalid cron expression');
            setDesc('');
        }
    }, [cron]);

    const examples = [
        { cron: '*/5 * * * *', text: 'Every 5 minutes' },
        { cron: '0 0 * * *', text: 'At midnight (00:00)' },
        { cron: '0 9 * * 1', text: 'At 09:00 on Monday' },
        { cron: '0 * * * *', text: 'Every hour at minute 0' },
        { cron: '0 0 * * 0', text: 'At midnight on Sunday' },
        { cron: '0 12 * * *', text: 'At noon (12:00)' },
        { cron: '0 0 1 * *', text: 'At midnight on 1st of month' },
        { cron: '0 0 1 1 *', text: 'At midnight on Jan 1st' },
    ];

    return (
        <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
            <ToolHeader 
                title="Cron Job Parser" 
                description="Translate cron expressions into human-readable text." 
            />

            <ToolSplitPane columnCount={layout.direction === 'horizontal' ? 2 : 1}>
                <div className="pane" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    minHeight: 0,
                    flex: 1
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        minHeight: '30px',
                        marginBottom: '0.5rem'
                    }}>
                        <label style={{
                            fontSize: '0.75rem',
                            fontWeight: 400,
                            lineHeight: 1.5,
                            letterSpacing: '0.32px',
                            color: 'var(--cds-text-secondary)',
                            textTransform: 'uppercase'
                        }}>
                            Cron Expression
                        </label>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <TextInput
                            id="cron-input"
                            value={cron}
                            onChange={(e) => setCron(e.target.value)}
                            invalid={!!error}
                            invalidText={error}
                            placeholder="* * * * *"
                            style={{ 
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: '1.25rem'
                            }}
                        />
                    </div>

                    <div style={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '2rem',
                        backgroundColor: 'var(--cds-layer)',
                        border: '1px solid var(--cds-border-strong)',
                    }}>
                        {desc ? (
                            <>
                                <p style={{ 
                                    fontSize: '1.5rem', 
                                    color: 'var(--cds-text-primary)', 
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    marginBottom: '0.5rem'
                                }}>
                                    {desc}
                                </p>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--cds-text-secondary)',
                                    fontFamily: "'IBM Plex Mono', monospace"
                                }}>
                                    {cron}
                                </p>
                            </>
                        ) : (
                            <p style={{ color: 'var(--cds-text-secondary)', textAlign: 'center' }}>
                                Enter a cron expression to see the translation
                            </p>
                        )}
                    </div>
                </div>

                <div className="pane" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    minHeight: 0,
                    flex: 1
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        minHeight: '30px',
                        marginBottom: '0.5rem'
                    }}>
                        <label style={{
                            fontSize: '0.75rem',
                            fontWeight: 400,
                            lineHeight: 1.5,
                            letterSpacing: '0.32px',
                            color: 'var(--cds-text-secondary)',
                            textTransform: 'uppercase'
                        }}>
                            Common Examples
                        </label>
                    </div>
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '0.75rem',
                        backgroundColor: 'var(--cds-layer)',
                        border: '1px solid var(--cds-border-strong)',
                    }}>
                        {examples.map((example, idx) => (
                            <Tile 
                                key={idx}
                                style={{ 
                                    marginBottom: '0.5rem',
                                    padding: '0.75rem',
                                    backgroundColor: idx % 2 === 0 ? 'var(--cds-layer-01)' : 'var(--cds-layer-02)',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onClick={() => setCron(example.cron)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--cds-layer-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'var(--cds-layer-01)' : 'var(--cds-layer-02)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ 
                                        fontFamily: "'IBM Plex Mono', monospace",
                                        color: 'var(--cds-text-primary)',
                                        fontWeight: 600
                                    }}>
                                        {example.cron}
                                    </span>
                                    <span style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                                        {example.text}
                                    </span>
                                </div>
                            </Tile>
                        ))}
                    </div>
                </div>
            </ToolSplitPane>
        </div>
    );
}
