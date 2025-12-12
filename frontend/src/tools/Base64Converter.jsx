import React, { useState } from 'react';
import { Tabs, Tab, TabList, TabPanels, TabPanel, RadioButtonGroup, RadioButton } from '@carbon/react';
import { Image as ImageIcon, Document } from '@carbon/icons-react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';

export default function Base64Converter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('encode');
    const [imgSrc, setImgSrc] = useState('');

    const processText = (text, currentMode) => {
        try {
            setInput(text);
            if (!text) { setOutput(''); return; }
            if (currentMode === 'encode') {
                setOutput(btoa(text));
            } else {
                setOutput(atob(text));
            }
        } catch (e) {
            setOutput('Error: Invalid input for ' + currentMode);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImgSrc(reader.result);
        reader.readAsDataURL(file);
    };

    return (
        <div className="tool-container">
            <ToolHeader title="Base64 Converter" description="Encode and decode Base64 strings and images." />

            <Tabs>
                <TabList aria-label="Base64 Converter Tabs">
                    <Tab renderIcon={Document}>String</Tab>
                    <Tab renderIcon={ImageIcon}>Image</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '1rem' }}>
                            <ToolControls>
                                <RadioButtonGroup
                                    legendText="Mode"
                                    name="mode-radio-group"
                                    defaultSelected="encode"
                                    onChange={(val) => { setMode(val); processText(input, val); }}
                                    orientation="horizontal"
                                >
                                    <RadioButton labelText="Encode" value="encode" id="b64-enc" />
                                    <RadioButton labelText="Decode" value="decode" id="b64-dec" />
                                </RadioButtonGroup>
                            </ToolControls>

                            <ToolSplitPane>
                                <ToolPane
                                    label="Input"
                                    value={input}
                                    onChange={(e) => processText(e.target.value, mode)}
                                    placeholder={mode === 'encode' ? "Text to encode..." : "Base64 to decode..."}
                                />
                                <ToolPane
                                    label="Output"
                                    value={output}
                                    readOnly
                                />
                            </ToolSplitPane>
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '1rem' }}>
                            <ToolSplitPane>
                                <div className="pane">
                                    <label style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--cds-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                        Upload Image
                                    </label>
                                    <div style={{ padding: '20px', border: '1px dashed var(--cds-border-strong)', borderRadius: '6px', textAlign: 'center', background: 'var(--cds-layer)' }}>
                                        <input type="file" onChange={handleFileUpload} accept="image/*" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <ToolPane
                                        label="Base64 Output"
                                        value={imgSrc}
                                        readOnly
                                        placeholder="Base64 string will appear here..."
                                    />
                                    {imgSrc && (
                                        <div style={{ textAlign: 'center', border: '1px solid var(--cds-border-subtle)', padding: '10px', borderRadius: '4px' }}>
                                            <p style={{ color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '0.75rem' }}>Preview</p>
                                            <img src={imgSrc} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                                        </div>
                                    )}
                                </div>
                            </ToolSplitPane>
                        </div>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    );
}
