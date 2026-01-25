import React, { useState, useEffect } from 'react';
import cronstrue from 'cronstrue';
import { TextInput, Link } from '@carbon/react';
import { ToolHeader } from '../components/ToolUI';

const CronExample = ({ cron, text, setCron }) => (
    <li style={{ marginBottom: '0.5rem' }}>
        <Link onClick={() => setCron(cron)} style={{ cursor: 'pointer' }}>
            <span style={{ fontFamily: 'monospace', color: 'var(--cds-text-primary)' }}>{cron.padEnd(18, ' ')}</span>
            <span style={{ color: 'var(--cds-text-secondary)' }}>{text}</span>
        </Link>
    </li>
);

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
            <ToolHeader title="Cron Job Parser" description="Translate cron expressions into human-readable text." />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <TextInput
                    id="cron-input"
                    labelText="Cron Expression"
                    value={cron}
                    onChange={(e) => setCron(e.target.value)}
                    invalid={!!error}
                    invalidText={error}
                    size="xl"
                    style={{ fontFamily: 'monospace', textAlign: 'center' }}
                />

                <div style={{ marginTop: '2rem', textAlign: 'center', minHeight: '3rem' }}>
                    <p style={{ fontSize: '1.25rem', color: 'var(--cds-text-primary)', fontWeight: '600' }}>
                        {desc}
                    </p>
                </div>

                <div style={{ marginTop: '3rem', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                    <h4 style={{ marginBottom: '1rem' }}>Common Examples</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <CronExample cron="*/5 * * * *" text="Every 5 minutes" setCron={setCron} />
                        <CronExample cron="0 0 * * *" text="At midnight (00:00)" setCron={setCron} />
                        <CronExample cron="0 9 * * 1" text="At 09:00 on Monday" setCron={setCron} />
                        <CronExample cron="0 * * * *" text="Every hour at minute 0" setCron={setCron} />
                    </ul>
                </div>
            </div>
        </div>
    );
}
