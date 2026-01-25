import React, { useState } from 'react';
import { Button, NumberInput, Select, SelectItem } from '@carbon/react';
import { Datastore } from '@carbon/icons-react';
import { ToolHeader, ToolControls, ToolPane } from '../components/ToolUI';

export default function LoremIpsumGenerator() {
    const [count, setCount] = useState(3);
    const [type, setType] = useState('paragraphs');
    const [output, setOutput] = useState('');

    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, pretium ac, nisi. Aenean magna nisl, mollis quis, molestie eu, feugiat in, orci. In hac habitasse platea dictumst. Fusce convallis, mauris imperdiet gravida bibendum, nisl turpis suscipit mauris, sed placerat ipsum urna sed risus. In convallis tellus a mauris. Aspicio haec in speculo. ";

    const generate = () => {
        let res = "";
        const sentences = lorem.split('. ').filter(s => s).map(s => s.trim() + '.');
        const words = lorem.replace(/[.,]/g, '').split(' ').filter(w => w);

        if (type === 'paragraphs') {
            for (let i = 0; i < count; i++) {
                let p = "";
                const numSentences = Math.floor(Math.random() * 4) + 3;
                for (let j = 0; j < numSentences; j++) {
                    p += sentences[Math.floor(Math.random() * sentences.length)] + " ";
                }
                res += p.trim() + "\n\n";
            }
        } else if (type === 'sentences') {
            for (let i = 0; i < count; i++) {
                res += sentences[Math.floor(Math.random() * sentences.length)] + " ";
            }
        } else {
            for (let i = 0; i < count; i++) {
                res += words[Math.floor(Math.random() * words.length)] + " ";
            }
        }
        setOutput(res.trim());
    };

    return (
        <div className="tool-container">
            <ToolHeader title="Lorem Ipsum Generator" description="Generate placeholder text." />

            <ToolControls>
                <div style={{ width: '200px' }}>
                    <Select
                        id="lorem-type"
                        labelText="Type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <SelectItem value="paragraphs" text="Paragraphs" />
                        <SelectItem value="sentences" text="Sentences" />
                        <SelectItem value="words" text="Words" />
                    </Select>
                </div>

                <div style={{ width: '120px' }}>
                    <NumberInput
                        id="lorem-count"
                        label="Quantity"
                        min={1}
                        max={100}
                        value={count}
                        onChange={(e, { value }) => setCount(value)}
                    />
                </div>

                <Button onClick={generate} renderIcon={Datastore}>Generate</Button>
            </ToolControls>

            <ToolPane
                label="Result"
                value={output}
                readOnly
            />
        </div>
    );
}
