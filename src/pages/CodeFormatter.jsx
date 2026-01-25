import React, { useState } from 'react';
import beautify from 'js-beautify';
import xmlFormat from 'xml-formatter';
import { Button, Select, SelectItem } from '@carbon/react';
import { MagicWandFilled } from '@carbon/icons-react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';

export default function CodeFormatter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('html');

    const format = () => {
        if (!input.trim()) { setOutput(''); return; }

        try {
            let res = '';
            const opts = { indent_size: 2, space_in_empty_paren: true };

            switch (mode) {
                case 'html': res = beautify.html(input, opts); break;
                case 'css': res = beautify.css(input, opts); break;
                case 'js': res = beautify.js(input, opts); break;
                case 'xml':
                    res = xmlFormat(input, {
                        indentation: '  ',
                        filter: (node) => node.type !== 'Comment',
                        collapseContent: true,
                        lineSeparator: '\n'
                    });
                    break;
                default: res = input;
            }
            setOutput(res);
        } catch (e) {
            setOutput('Error: ' + e.message);
        }
    };

    return (
        <div className="tool-container">
            <ToolHeader title="Code Formatter" description="Format and beautify HTML, CSS, JavaScript, and XML." />

            <ToolControls>
                <div style={{ width: '200px' }}>
                    <Select
                        id="lang-select"
                        labelText="Language"
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                    >
                        <SelectItem value="html" text="HTML" />
                        <SelectItem value="css" text="CSS" />
                        <SelectItem value="js" text="JavaScript" />
                        <SelectItem value="xml" text="XML" />
                    </Select>
                </div>
                <Button onClick={format} renderIcon={MagicWandFilled}>Beautify</Button>
            </ToolControls>

            <ToolSplitPane>
                <ToolPane
                    label="Input Code"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste code here..."
                />
                <ToolPane
                    label="Formatted Output"
                    value={output}
                    readOnly
                />
            </ToolSplitPane>
        </div>
    );
}
