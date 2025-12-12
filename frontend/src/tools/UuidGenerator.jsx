import React, { useState } from 'react';
import { ulid } from 'ulid';
import { Button, NumberInput, Select, SelectItem } from '@carbon/react';
import { Renew } from '@carbon/icons-react';
import { ToolHeader, ToolControls, ToolPane } from '../components/ToolUI';

export default function UuidGenerator() {
    const [uuids, setUuids] = useState([]);
    const [count, setCount] = useState(1);
    const [type, setType] = useState('uuid');

    const generate = () => {
        const newIds = [];
        for (let i = 0; i < count; i++) {
            if (type === 'uuid') {
                newIds.push(self.crypto.randomUUID());
            } else {
                newIds.push(ulid());
            }
        }
        setUuids(newIds);
    };

    return (
        <div className="tool-container">
            <ToolHeader title="UUID / ULID Generator" description="Generate random UUIDs (v4) or ULIDs." />

            <ToolControls>
                <div style={{ width: '200px' }}>
                    <Select
                        id="id-type-select"
                        labelText="Type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <SelectItem value="uuid" text="UUID (v4)" />
                        <SelectItem value="ulid" text="ULID" />
                    </Select>
                </div>

                <div style={{ width: '120px' }}>
                    <NumberInput
                        id="count-input"
                        label="Count"
                        min={1}
                        max={100}
                        value={count}
                        onChange={(e, { value }) => setCount(value)}
                    />
                </div>

                <Button onClick={generate} renderIcon={Renew}>Generate</Button>
            </ToolControls>

            <ToolPane
                label="Result"
                value={uuids.join('\n')}
                readOnly
                placeholder="Generated IDs will appear here..."
            />
        </div>
    );
}
