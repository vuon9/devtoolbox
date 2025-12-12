import React, { useState, useEffect } from 'react';
import logo from '../assets/images/logo-universal.png';

export function Sidebar({ activeTool, setActiveTool, isVisible, toggleSidebar }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [pinned, setPinned] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('pinnedTools')) || [];
        } catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem('pinnedTools', JSON.stringify(pinned));
    }, [pinned]);

    const tools = [
        { id: 'unix-time', name: 'Unix Time Converter', icon: '🕒' },
        { id: 'json', name: 'JSON Format/Validate', icon: '{}' },
        { id: 'base64', name: 'Base64 Converter', icon: '64' },
        { id: 'jwt', name: 'JWT Debugger', icon: '🛡️' },
        { id: 'url-tools', name: 'URL Tools', icon: '🔗' },
        { id: 'data-converter', name: 'Data Converter', icon: '🔄' },
        { id: 'html-entity', name: 'HTML Entity Encode', icon: '&;' },
        { id: 'color', name: 'Color Converter', icon: '🎨' },
        { id: 'escape', name: 'Backslash Escape', icon: '\\' },
        { id: 'uuid', name: 'UUID/ULID Generator', icon: '🆔' },
        { id: 'hash', name: 'Hash Generator', icon: '#' },
        { id: 'sql', name: 'SQL Formatter', icon: '🗄️' },
        { id: 'case', name: 'String Case', icon: 'aA' },
        { id: 'cron', name: 'Cron Job Parser', icon: '⏳' },
        { id: 'php-ser', name: 'PHP Serializer', icon: '📦' },
        { id: 'number-base', name: 'Number Base Converter', icon: '01' },
        { id: 'hex-ascii', name: 'Hex <-> ASCII', icon: 'H' },
        { id: 'code-fmt', name: 'Code Beautify/Minify', icon: '📝' },
        { id: 'regexp', name: 'RegExp Tester', icon: '.*' },
        { id: 'diff', name: 'Text Diff Checker', icon: '⚖️' },
        { id: 'sort', name: 'Line Sort/Dedupe', icon: '☰' },
        { id: 'inspector', name: 'String Inspector', icon: '🔍' },
        { id: 'lorem', name: 'Lorem Ipsum Generator', icon: '¶' },
        { id: 'random', name: 'Random String', icon: '🎲' },
        { id: 'html-preview', name: 'HTML Preview', icon: '👁️' },
        { id: 'markdown', name: 'Markdown Preview', icon: 'M↓' },
        { id: 'qr', name: 'QR Code Generator', icon: '📱' },
    ];

    const togglePin = (e, id) => {
        e.stopPropagation();
        if (pinned.includes(id)) {
            setPinned(pinned.filter(p => p !== id));
        } else {
            setPinned([...pinned, id]);
        }
    };

    // Filtering
    let displayTools = tools.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Split into Pinned and Regular
    const pinnedTools = displayTools.filter(t => pinned.includes(t.id));
    const regularTools = displayTools.filter(t => !pinned.includes(t.id));

    // Sort Alphabetically
    pinnedTools.sort((a, b) => a.name.localeCompare(b.name));
    regularTools.sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className={`sidebar ${!isVisible ? 'hidden' : ''}`}>
            <div className="logo-area">
                <img src={logo} alt="Logo" />
                <h1>DevToolbox</h1>
            </div>

            <div style={{ padding: '10px 10px 0', minHeight: '52px' }}>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', fontSize: '13px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }}
                />
            </div>

            <div className="nav-scroll-area">
                {pinnedTools.length > 0 && (
                    <>
                        <div className="sidebar-section-header">
                            <span>📌</span>
                            <span>Pinned</span>
                        </div>
                        <ul className="nav-list">
                            {pinnedTools.map(tool => (
                                <li key={tool.id} className="nav-item">
                                    <button
                                        className={`nav-button ${activeTool === tool.id ? 'active' : ''}`}
                                        onClick={() => setActiveTool(tool.id)}
                                    >
                                        <div className="nav-content">
                                            <span className="nav-icon">{tool.icon}</span>
                                            <span className="nav-text">{tool.name}</span>
                                        </div>
                                        {/* Unpin action on hover */}
                                        <span
                                            className="nav-action"
                                            onClick={(e) => togglePin(e, tool.id)}
                                            title="Unpin"
                                        >
                                            ✕
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {regularTools.length > 0 && <div className="sidebar-separator"></div>}
                    </>
                )}

                <ul className="nav-list">
                    {regularTools.map(tool => (
                        <li key={tool.id} className="nav-item">
                            <button
                                className={`nav-button ${activeTool === tool.id ? 'active' : ''}`}
                                onClick={() => setActiveTool(tool.id)}
                            >
                                <div className="nav-content">
                                    <span className="nav-icon">{tool.icon}</span>
                                    <span className="nav-text">{tool.name}</span>
                                </div>
                                {/* Pin action on hover */}
                                <span
                                    className="nav-action"
                                    onClick={(e) => togglePin(e, tool.id)}
                                    title="Pin to top"
                                >
                                    📌
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>

                {regularTools.length === 0 && pinnedTools.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No tools found
                    </div>
                )}
            </div>
        </div>
    );
}
