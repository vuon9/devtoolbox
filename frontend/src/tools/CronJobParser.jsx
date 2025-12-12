import React, { useState, useEffect } from 'react';
import cronstrue from 'cronstrue';

export default function CronJobParser() {
    const [cron, setCron] = useState('* * * * *');
    const [desc, setDesc] = useState('');
    const [error, setError] = useState('');

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

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">Cron Job Parser</h2>
                <p className="tool-desc">Describe cron expressions in human readable text.</p>
            </div>

            <div className="pane" style={{ maxWidth: '800px' }}>
                <div className="pane-header"><span className="pane-label">Cron Expression</span></div>
                <input
                    className="code-editor"
                    value={cron}
                    onChange={(e) => setCron(e.target.value)}
                    style={{ fontSize: '1.5rem', fontFamily: 'monospace', height: 'auto', textAlign: 'center' }}
                />

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    {error ? (
                        <h3 style={{ color: 'var(--error-color)' }}>{error}</h3>
                    ) : (
                        <h3 style={{ color: 'var(--accent-color)', fontSize: '1.5rem', fontWeight: '400' }}>{desc}</h3>
                    )}
                </div>

                <div style={{ marginTop: '40px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <p>Common Examples:</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '8px', cursor: 'pointer', display: 'flex', gap: '15px' }} onClick={() => setCron('*/5 * * * *')}>
                            <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>*/5 * * * *</span>
                            <span>Every 5 minutes</span>
                        </li>
                        <li style={{ marginBottom: '8px', cursor: 'pointer', display: 'flex', gap: '15px' }} onClick={() => setCron('0 0 * * *')}>
                            <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>0 0 * * *</span>
                            <span>At midnight</span>
                        </li>
                        <li style={{ marginBottom: '8px', cursor: 'pointer', display: 'flex', gap: '15px' }} onClick={() => setCron('0 9 * * 1')}>
                            <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>0 9 * * 1</span>
                            <span>At 09:00 on Monday</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
