import React from 'react';
import { Button, Tile, Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import { Copy } from '@carbon/icons-react';

const languageTabs = [
    { id: 'css', label: 'CSS' },
    { id: 'swift', label: 'Swift' },
    { id: 'dotnet', label: '.NET' },
    { id: 'java', label: 'Java' },
    { id: 'android', label: 'Android' },
    { id: 'objc', label: 'Obj-C' },
    { id: 'flutter', label: 'Flutter' },
    { id: 'unity', label: 'Unity' },
    { id: 'reactnative', label: 'React Native' },
    { id: 'opengl', label: 'OpenGL' },
    { id: 'svg', label: 'SVG' }
];

export default function CodeSnippetsPanel({ codeSnippets, selectedTab, onTabChange, onCopy }) {
    return (
        <div style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--cds-layer)',
            border: '1px solid var(--cds-border-strong)',
            borderRadius: '4px',
            overflow: 'hidden'
        }}>
            <Tabs
                selectedIndex={selectedTab}
                onChange={({ selectedIndex }) => onTabChange(selectedIndex)}
            >
                <TabList aria-label="Language tabs" contained style={{ overflowX: 'auto' }}>
                    {languageTabs.map(tab => (
                        <Tab key={tab.id}>{tab.label}</Tab>
                    ))}
                </TabList>
                
                <TabPanels style={{ flex: 1, overflow: 'auto', padding: '0.75rem' }}>
                    {languageTabs.map(tab => (
                        <TabPanel key={tab.id}>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '0.75rem' 
                            }}>
                                {(codeSnippets[tab.id] || []).map((snippet, idx) => (
                                    <Tile key={idx} style={{
                                        padding: '0.75rem',
                                        backgroundColor: 'var(--cds-layer-hover)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            gap: '1rem'
                                        }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--cds-text-secondary)',
                                                    marginBottom: '0.5rem',
                                                    textTransform: 'uppercase',
                                                    fontWeight: 500
                                                }}>
                                                    {snippet.name}
                                                </div>
                                                
                                                <pre style={{
                                                    fontFamily: "'IBM Plex Mono', monospace",
                                                    fontSize: '0.8rem',
                                                    margin: 0,
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-all',
                                                    color: 'var(--cds-text-primary)'
                                                }}>
                                                    {snippet.code}
                                                </pre>
                                            </div>
                                            
                                            <Button
                                                hasIconOnly
                                                renderIcon={Copy}
                                                kind="ghost"
                                                size="sm"
                                                onClick={() => onCopy(snippet.code)}
                                                iconDescription="Copy"
                                                style={{ flexShrink: 0 }}
                                            />
                                        </div>
                                    </Tile>
                                ))}
                            </div>
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs>
        </div>
    );
}
