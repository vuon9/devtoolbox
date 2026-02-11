import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TextInput, CopyButton } from '@carbon/react';
import { ChevronDown } from '@carbon/icons-react';
import { ToolHeader, ToolSplitPane } from '../components/ToolUI';
import useLayoutToggle from '../hooks/useLayoutToggle';

const FLAG_OPTIONS = [
    { flag: 'g', label: 'Global', desc: 'Find all matches' },
    { flag: 'i', label: 'Ignore Case', desc: 'Case-insensitive' },
    { flag: 'm', label: 'Multiline', desc: '^ and $ match start/end of line' },
    { flag: 's', label: 'Dot All', desc: '. matches newlines' },
    { flag: 'u', label: 'Unicode', desc: 'Unicode support' },
    { flag: 'y', label: 'Sticky', desc: 'Match from lastIndex' },
];

// Escape HTML special characters to prevent XSS and rendering issues
const escapeHtml = (text) => {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

const GROUP_COLORS = [
    { bg: 'rgba(66, 190, 101, 0.15)', border: 'rgba(66, 190, 101, 0.3)', text: 'var(--cds-text-primary)' },      // Green (full match)
    { bg: 'rgba(69, 137, 245, 0.15)', border: 'rgba(69, 137, 245, 0.3)', text: 'var(--cds-text-primary)' },      // Blue
    { bg: 'rgba(241, 194, 27, 0.15)', border: 'rgba(241, 194, 27, 0.3)', text: 'var(--cds-text-primary)' },      // Yellow
    { bg: 'rgba(218, 30, 40, 0.15)', border: 'rgba(218, 30, 40, 0.3)', text: 'var(--cds-text-primary)' },      // Red
    { bg: 'rgba(165, 110, 255, 0.15)', border: 'rgba(165, 110, 255, 0.3)', text: 'var(--cds-text-primary)' },      // Purple
    { bg: 'rgba(0, 189, 186, 0.15)', border: 'rgba(0, 189, 186, 0.3)', text: 'var(--cds-text-primary)' },      // Teal
    { bg: 'rgba(255, 118, 178, 0.15)', border: 'rgba(255, 118, 178, 0.3)', text: 'var(--cds-text-primary)' },      // Pink
    { bg: 'rgba(255, 140, 0, 0.15)', border: 'rgba(255, 140, 0, 0.3)', text: 'var(--cds-text-primary)' },      // Orange
];

// Premium Regex Syntax Highlighter
const highlightRegex = (regexStr) => {
    if (!regexStr) return '';

    const tokenRegex = /(\\.)|(\[(?:\\.|[^\]])*\])|(\((?:\\.|[^\)])*\))|([\*\+\?]\??|\{\d+(,\d*)?\}\??)|([\^$\|])/g;

    let lastIndex = 0;
    let result = '';
    let match;

    while ((match = tokenRegex.exec(regexStr)) !== null) {
        // Add text before match
        result += escapeHtml(regexStr.slice(lastIndex, match.index));

        const [full, escaped, charClass, group, quantifier, operator] = match;

        if (escaped) {
            result += `<span style="color: #ff7eb6;">${escapeHtml(escaped)}</span>`;
        } else if (charClass) {
            result += `<span style="color: #78a9ff;">${escapeHtml(charClass)}</span>`;
        } else if (group) {
            result += `<span style="color: #42be65;">${escapeHtml(group)}</span>`;
        } else if (quantifier) {
            result += `<span style="color: #33b1ff;">${escapeHtml(quantifier)}</span>`;
        } else if (operator) {
            result += `<span style="color: #be95ff; font-weight: bold;">${escapeHtml(operator)}</span>`;
        }

        lastIndex = tokenRegex.lastIndex;
    }

    result += escapeHtml(regexStr.slice(lastIndex));
    return result;
};

// Generate highlighted HTML with match data attributes for tooltips and group colors
const generateHighlightedHtml = (text, regex, flags) => {
    if (!regex || !text) return escapeHtml(text);

    try {
        const re = new RegExp(regex, flags.includes('g') ? flags : flags + 'g');
        let result = '';
        let lastIndex = 0;
        let match;
        let matchCount = 0;

        while ((match = re.exec(text)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
                result += escapeHtml(text.slice(lastIndex, match.index));
            }

            matchCount++;
            const matchIndex = match.index;
            const fullMatchText = match[0];

            // Build tooltip data
            let tooltipData = `Match #${matchCount} at index ${matchIndex}`;
            if (match.groups && Object.keys(match.groups).length > 0) {
                const groups = Object.entries(match.groups)
                    .map(([k, v]) => `${k}: "${escapeHtml(v || '')}"`)
                    .join('\n');
                tooltipData += `\nGroups:\n${groups}`;
            }
            if (match.length > 1) {
                const unnamedGroups = match.slice(1).filter((g, idx) =>
                    !match.groups || !Object.values(match.groups).includes(g)
                );
                if (unnamedGroups.length > 0) {
                    const groups = unnamedGroups
                        .map((g, i) => `${i + 1}: "${escapeHtml(g || '')}"`)
                        .join('\n');
                    tooltipData += `\nCaptures:\n${groups}`;
                }
            }

            // If there are capture groups, render them with different colors
            if (match.length > 1) {
                // Find all group positions in the match
                const groupPositions = [];
                let currentPos = 0;

                for (let i = 1; i < match.length; i++) {
                    const groupText = match[i];
                    if (groupText !== undefined) {
                        const groupIndex = fullMatchText.indexOf(groupText, currentPos);
                        if (groupIndex !== -1) {
                            groupPositions.push({
                                index: groupIndex,
                                text: groupText,
                                groupNum: i
                            });
                            currentPos = groupIndex + groupText.length;
                        }
                    }
                }

                // Sort by position
                groupPositions.sort((a, b) => a.index - b.index);

                // Build the highlighted match with different colors for groups
                let matchResult = '';
                let matchPos = 0;
                const fullMatchColor = GROUP_COLORS[0];

                // Process the match text, applying different colors to groups
                groupPositions.forEach((group) => {
                    // Add text before this group (part of full match)
                    if (group.index > matchPos) {
                        const beforeText = escapeHtml(fullMatchText.slice(matchPos, group.index));
                        matchResult += `<span style="background-color: ${fullMatchColor.bg}; color: ${fullMatchColor.text}; padding: 2px 0; font-weight: 600;">${beforeText}</span>`;
                    }

                    // Add the group with its color
                    const groupColor = GROUP_COLORS[group.groupNum % GROUP_COLORS.length] || GROUP_COLORS[1];
                    matchResult += `<mark class="regex-match regex-group-${group.groupNum}" style="background-color: ${groupColor.bg}; color: ${groupColor.text};" data-match-index="${matchIndex + group.index}" data-match-num="${matchCount}" data-group-num="${group.groupNum}" title="${tooltipData}">${escapeHtml(group.text)}</mark>`;

                    matchPos = group.index + group.text.length;
                });

                // Add remaining text after last group
                if (matchPos < fullMatchText.length) {
                    const afterText = escapeHtml(fullMatchText.slice(matchPos));
                    matchResult += `<span style="background-color: ${fullMatchColor.bg}; color: ${fullMatchColor.text}; padding: 2px 0; font-weight: 600;">${afterText}</span>`;
                }

                result += matchResult;
            } else {
                // No groups - just highlight the full match
                const fullMatchColor = GROUP_COLORS[0];
                result += `<mark class="regex-match" style="background-color: ${fullMatchColor.bg}; color: ${fullMatchColor.text};" data-match-index="${matchIndex}" data-match-num="${matchCount}" title="${tooltipData}">${escapeHtml(fullMatchText)}</mark>`;
            }

            lastIndex = re.lastIndex;

            // Prevent infinite loop for zero-length matches
            if (match.index === re.lastIndex) {
                re.lastIndex++;
            }
        }

        // Add remaining text
        if (lastIndex < text.length) {
            result += escapeHtml(text.slice(lastIndex));
        }

        return result;
    } catch (e) {
        return escapeHtml(text);
    }
};

// Live Highlighted Editor Component
const LiveHighlightedEditor = ({ text, setText, regex, flags }) => {
    const textareaRef = useRef(null);
    const backdropRef = useRef(null);
    const [highlightedHtml, setHighlightedHtml] = useState('');

    // Update highlighting when text, regex, or flags change
    useEffect(() => {
        const html = generateHighlightedHtml(text, regex, flags);
        setHighlightedHtml(html);
    }, [text, regex, flags]);

    // Sync scroll between textarea and backdrop
    const handleScroll = useCallback(() => {
        if (textareaRef.current && backdropRef.current) {
            backdropRef.current.scrollTop = textareaRef.current.scrollTop;
            backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    }, []);

    return (
        <div style={{
            position: 'relative',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
        }}>
            {/* Backdrop - shows highlighted text */}
            <div
                ref={backdropRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    overflow: 'auto',
                    padding: '0.75rem',
                    backgroundColor: 'var(--cds-layer)',
                    border: '1px solid var(--cds-border-strong)',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: 'var(--cds-text-primary)',
                    pointerEvents: 'none',
                }}
                dangerouslySetInnerHTML={{ __html: highlightedHtml || escapeHtml(text) || '<br>' }}
            />

            {/* Textarea - for user input */}
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onScroll={handleScroll}
                placeholder="Enter the text to test against..."
                spellCheck={false}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    height: '100%',
                    padding: '0.75rem',
                    background: 'transparent',
                    border: '1px solid var(--cds-border-strong)',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: 'transparent',
                    caretColor: 'var(--cds-text-primary)',
                    resize: 'none',
                    outline: 'none',
                    zIndex: 1,
                }}
            />

            {/* CSS for highlighted matches */}
            <style>{`
                .regex-match {
                    padding: 0 1px;
                    border-radius: 2px;
                    font-weight: 600;
                    pointer-events: auto;
                    cursor: help;
                    transition: all 0.15s ease;
                }
                .regex-match:hover {
                    filter: contrast(1.1) brightness(1.1);
                    box-shadow: 0 0 0 2px var(--cds-focus);
                    z-index: 2;
                }
            `}</style>
        </div>
    );
};

// Expandable Regex Input Component with auto-resize and syntax highlighting
const ExpandableRegexInput = ({ value, onChange, error }) => {
    const textareaRef = useRef(null);
    const backdropRef = useRef(null);
    const [highlightedHtml, setHighlightedHtml] = useState('');

    const LINE_HEIGHT = 20;
    const MIN_LINES = 1;
    const MAX_LINES = 10;
    const MIN_HEIGHT = MIN_LINES * LINE_HEIGHT + 16;
    const MAX_HEIGHT = MAX_LINES * LINE_HEIGHT + 16;

    // Update highlighting
    useEffect(() => {
        setHighlightedHtml(highlightRegex(value));
    }, [value]);

    // Sync scroll
    const handleScroll = useCallback(() => {
        if (textareaRef.current && backdropRef.current) {
            backdropRef.current.scrollTop = textareaRef.current.scrollTop;
            backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    }, []);

    // Auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            const newHeight = Math.min(Math.max(scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [value]);

    return (
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'stretch' }}>
            {/* Syntax Highlighting Backdrop */}
            <div
                ref={backdropRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '0.5rem 24px 0.5rem 0.75rem',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '0.875rem',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: error ? 'var(--cds-support-error)' : 'var(--cds-text-primary)',
                    pointerEvents: 'none',
                    overflow: 'hidden',
                    backgroundColor: 'transparent',
                    zIndex: 0
                }}
                dangerouslySetInnerHTML={{ __html: highlightedHtml || '<br>' }}
            />

            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleScroll}
                placeholder="Regular Expression..."
                spellCheck={false}
                className="regex-input-scrollbar"
                style={{
                    width: '100%',
                    minHeight: `${MIN_HEIGHT}px`,
                    maxHeight: `${MAX_HEIGHT}px`,
                    padding: '0.5rem 24px 0.5rem 0.75rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '0.875rem',
                    lineHeight: '1.4',
                    resize: 'vertical',
                    outline: 'none',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    wordBreak: 'break-all',
                    color: 'transparent',
                    caretColor: 'var(--cds-text-primary)',
                    display: 'block',
                    scrollbarWidth: 'thin',
                    scrollbarGutter: 'stable',
                    zIndex: 1,
                    position: 'relative'
                }}
            />
        </div>
    );
};

// Flags Input Component
const FlagsInputWithPopover = ({ flags, setFlags }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const toggleFlag = (flag) => {
        if (flags.includes(flag)) {
            setFlags(flags.replace(flag, ''));
        } else {
            setFlags(flags + flag);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div ref={containerRef} style={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '0.75rem 0.75rem 0',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '0.875rem',
                    color: 'var(--cds-text-secondary)',
                    backgroundColor: isOpen ? 'var(--cds-layer-selected-01)' : 'transparent',
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                    borderLeft: '1px solid var(--cds-border-subtle)',
                    minWidth: '60px',
                    justifyContent: 'center',
                    lineHeight: '1.4'
                }}
                onMouseEnter={(e) => !isOpen && (e.currentTarget.style.backgroundColor = 'var(--cds-layer-hover-01)')}
                onMouseLeave={(e) => !isOpen && (e.currentTarget.style.backgroundColor = 'transparent')}
            >
                {flags || <span style={{ opacity: 0.5, fontSize: '0.875rem' }}>flags</span>}
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    padding: '0.5rem',
                    backgroundColor: 'var(--cds-layer-01)',
                    border: '1px solid var(--cds-border-strong)',
                    borderRadius: '4px',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    minWidth: '240px',
                }}>
                    <div style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'var(--cds-text-secondary)',
                        textTransform: 'uppercase',
                        marginBottom: '0.5rem',
                        padding: '0 0.5rem'
                    }}>
                        Regex Flags
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {FLAG_OPTIONS.map(({ flag, label, desc }) => (
                            <div
                                key={flag}
                                onClick={() => toggleFlag(flag)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.625rem 0.5rem',
                                    cursor: 'pointer',
                                    borderRadius: '2px',
                                    backgroundColor: flags.includes(flag) ? 'var(--cds-layer-selected-01)' : 'transparent',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={(e) => !flags.includes(flag) && (e.currentTarget.style.backgroundColor = 'var(--cds-layer-hover-01)')}
                                onMouseLeave={(e) => !flags.includes(flag) && (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <span style={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontWeight: 600,
                                    color: flags.includes(flag) ? 'var(--cds-link-primary)' : 'var(--cds-text-secondary)',
                                    minWidth: '16px',
                                }}>
                                    {flag}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--cds-text-primary)',
                                        fontWeight: flags.includes(flag) ? 600 : 400
                                    }}>
                                        {label}
                                    </div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: 'var(--cds-text-secondary)',
                                        marginTop: '2px'
                                    }}>
                                        {desc}
                                    </div>
                                </div>
                                {flags.includes(flag) && (
                                    <span style={{ color: 'var(--cds-link-primary)' }}>✓</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Match Info Row Component
const MatchInfoRow = ({ label, range, value, color, indent = false }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.4rem 0.75rem',
        borderBottom: '1px solid var(--cds-border-subtle)',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.875rem',
        backgroundColor: 'transparent',
    }}>
        <div style={{
            width: '120px',
            paddingLeft: indent ? '1rem' : '0',
            position: 'relative',
        }}>
            <span style={{
                borderBottom: `2px solid ${color}`,
                paddingBottom: '2px',
                fontWeight: 600,
                color: 'var(--cds-text-primary)'
            }}>
                {label}
            </span>
        </div>
        <div style={{ width: '80px', color: 'var(--cds-text-secondary)', fontSize: '0.75rem', textAlign: 'center' }}>
            {range}
        </div>
        <div style={{
            flex: 1,
            paddingLeft: '1.5rem',
            borderLeft: '1px solid var(--cds-border-subtle)',
            color: 'var(--cds-text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }}>
            {value}
        </div>
    </div>
);

// Tool Pane with Label Component
const ToolPaneWithLabel = ({ label, children, action }) => (
    <div style={{
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
            minHeight: '28px',
            marginBottom: '0',
            borderBottom: '1px solid var(--cds-border-subtle)',
            padding: '0.25rem 0.75rem',
            backgroundColor: 'transparent'
        }}>
            <label style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                lineHeight: 1.5,
                letterSpacing: '0.32px',
                color: 'var(--cds-text-secondary)',
                textTransform: 'uppercase'
            }}>
                {label}
            </label>
            {label === 'MATCH INFORMATION' ? (
                <ChevronDown size={16} fill="var(--cds-icon-secondary)" />
            ) : action}
        </div>
        {children}
    </div>
);

export default function RegExpTester() {
    const [regexStr, setRegexStr] = useState('');
    const [flags, setFlags] = useState('gm');
    const [text, setText] = useState('');
    const [output, setOutput] = useState([]);
    const [error, setError] = useState('');
    const [matches, setMatches] = useState([]);

    // Add scrollbar styles
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .regex-input-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .regex-input-scrollbar::-webkit-scrollbar-track {
                background: transparent;
                margin: 2px 0;
            }
            .regex-input-scrollbar::-webkit-scrollbar-thumb {
                background-color: var(--cds-border-subtle);
                border-radius: 3px;
                border: 1px solid transparent;
                background-clip: padding-box;
            }
            .regex-input-scrollbar::-webkit-scrollbar-thumb:hover {
                background-color: var(--cds-border-strong);
            }
            .regex-input-scrollbar::-webkit-scrollbar-corner {
                background: transparent;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const layout = useLayoutToggle({
        toolKey: 'regexp-tester-layout',
        defaultDirection: 'horizontal',
        showToggle: true,
        persist: true
    });

    useEffect(() => {
        runRegex();
    }, [regexStr, flags, text]);

    const runRegex = () => {
        if (!regexStr) {
            setOutput([]);
            setError('');
            setMatches([]);
            return;
        }
        try {
            const startTime = performance.now();
            const re = new RegExp(regexStr, flags);
            const foundMatches = Array.from(text.matchAll(re));
            const endTime = performance.now();
            const duration = (endTime - startTime).toFixed(2);

            setMatches(foundMatches);

            if (foundMatches.length === 0) {
                setOutput([
                    <div key="summary" style={{ padding: '0.75rem', borderBottom: '1px solid var(--cds-border-subtle)', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                        No matches found. ({duration}ms)
                    </div>
                ]);
            } else {
                const matchRows = foundMatches.flatMap((match, i) => {
                    const rows = [];
                    const fullMatchColor = GROUP_COLORS[0];

                    rows.push(
                        <MatchInfoRow
                            key={`match-${i}`}
                            label={`Match ${i + 1}`}
                            range={`${match.index}-${match.index + match[0].length}`}
                            value={match[0]}
                            color={fullMatchColor.border}
                        />
                    );

                    if (match.length > 1) {
                        const fullMatchText = match[0];
                        let currentSearchPos = 0;

                        for (let gi = 1; gi < match.length; gi++) {
                            const groupText = match[gi];
                            if (groupText !== undefined && groupText !== '') {
                                const groupIndexInMatch = fullMatchText.indexOf(groupText, currentSearchPos);
                                if (groupIndexInMatch !== -1) {
                                    const absoluteStart = match.index + groupIndexInMatch;
                                    const absoluteEnd = absoluteStart + groupText.length;
                                    const groupColor = GROUP_COLORS[gi % GROUP_COLORS.length] || GROUP_COLORS[1];

                                    rows.push(
                                        <MatchInfoRow
                                            key={`match-${i}-g-${gi}`}
                                            label={`Group ${gi}`}
                                            range={`${absoluteStart}-${absoluteEnd}`}
                                            value={groupText}
                                            color={groupColor.border}
                                            indent={true}
                                        />
                                    );
                                    currentSearchPos = groupIndexInMatch + groupText.length;
                                }
                            }
                        }
                    }
                    return rows;
                });

                setOutput([
                    <div key="summary" style={{
                        padding: '0.75rem',
                        borderBottom: '1px solid var(--cds-border-subtle)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--cds-text-primary)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--cds-layer-01)'
                    }}>
                        <span>Found {foundMatches.length} match{foundMatches.length !== 1 ? 'es' : ''}:</span>
                        <span style={{ color: 'var(--cds-text-secondary)', fontSize: '0.75rem', fontWeight: 400 }}>{duration}ms</span>
                    </div>,
                    <div key="table-header" style={{
                        display: 'flex',
                        padding: '0.5rem 0.75rem',
                        borderBottom: '1px solid var(--cds-border-strong)',
                        color: 'var(--cds-text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        backgroundColor: 'var(--cds-layer)'
                    }}>
                        <div style={{ width: '120px' }}>Name</div>
                        <div style={{ width: '80px', textAlign: 'center' }}>Range</div>
                        <div style={{ flex: 1, paddingLeft: '1.5rem' }}>Value</div>
                    </div>,
                    <div key="match-rows-container" style={{ backgroundColor: 'var(--cds-layer)' }}>
                        {matchRows}
                    </div>
                ]);
            }
            setError('');
        } catch (e) {
            setError(e.message);
            setOutput([]);
            setMatches([]);
        }
    };

    const handleCopyFullRegex = () => {
        const fullRegex = `/${regexStr}/${flags}`;
        navigator.clipboard.writeText(fullRegex);
    };

    return (
        <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
            <ToolHeader
                title="RegExp Tester"
                description="Test Regular Expressions against text. Matches are highlighted in the test string."
            />

            {/* Regex Input Row - Unified Input Group */}
            <div style={{
                display: 'flex',
                alignItems: 'stretch',
                padding: '0 0.5rem',
                backgroundColor: 'var(--cds-layer)',
                border: error ? '2px solid var(--cds-support-error)' : '1px solid var(--cds-border-strong)',
                borderRadius: '4px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'visible', // For popover
            }}
                className="regex-input-row"
            >
                {/* Prefix / */}
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: '0.75rem 0.5rem 0',
                    userSelect: 'none',
                    borderRight: '1px solid var(--cds-border-subtle)',
                    minWidth: '40px'
                }}>
                    <span style={{
                        color: 'var(--cds-text-secondary)',
                        fontSize: '1.25rem',
                        fontFamily: "'IBM Plex Mono', monospace",
                        opacity: 0.7,
                        lineHeight: '1.2'
                    }}>/</span>
                </div>

                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'stretch',
                    padding: '0'
                }}>
                    <ExpandableRegexInput
                        value={regexStr}
                        onChange={setRegexStr}
                        error={error}
                    />
                </div>

                {/* Suffix / */}
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: '0.75rem 0.5rem 0',
                    userSelect: 'none',
                    borderLeft: '1px solid var(--cds-border-subtle)',
                    minWidth: '40px'
                }}>
                    <span style={{
                        color: 'var(--cds-text-secondary)',
                        fontSize: '1.25rem',
                        fontFamily: "'IBM Plex Mono', monospace",
                        opacity: 0.7,
                        lineHeight: '1.2'
                    }}>/</span>
                </div>

                {/* Flags Input */}
                <FlagsInputWithPopover
                    flags={flags}
                    setFlags={setFlags}
                />

                {/* Copy Button */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderLeft: '1px solid var(--cds-border-subtle)',
                    minWidth: '48px'
                }}>
                    <CopyButton
                        onClick={handleCopyFullRegex}
                        disabled={!regexStr}
                        size="md"
                        iconDescription="Copy full regex string"
                        align="center"
                        kind="ghost"
                        className="transparent-copy-btn"
                    />
                </div>

                <style>{`
                    .regex-input-row:focus-within {
                        border-color: var(--cds-focus) !important;
                        box-shadow: 0 0 0 2px var(--cds-focus), inset 0 1px 2px rgba(0,0,0,0.1);
                    }
                    .regex-input-row:hover:not(:focus-within) {
                        border-color: var(--cds-border-interactive);
                    }
                    .transparent-copy-btn {
                        background-color: transparent !important;
                        border: none !important;
                        width: 100% !important;
                        height: 100% !important;
                    }
                    .transparent-copy-btn:hover {
                        background-color: var(--cds-layer-hover-01) !important;
                    }
                `}</style>
            </div>

            {/* Error Display */}
            {error && (
                <div style={{
                    color: 'var(--cds-support-error)',
                    padding: '0.5rem',
                    backgroundColor: 'var(--cds-support-error-inverse)',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    margin: '0 0.5rem'
                }}>
                    {error}
                </div>
            )}

            <ToolSplitPane columnCount={layout.direction === 'horizontal' ? 2 : 1}>
                {/* Left Pane: Live Highlighted Input */}
                <ToolPaneWithLabel
                    label={`Test String${matches.length > 0 ? ` (${matches.length} match${matches.length !== 1 ? 'es' : ''})` : ''}`}
                >
                    <LiveHighlightedEditor
                        text={text}
                        setText={setText}
                        regex={regexStr}
                        flags={flags}
                    />
                </ToolPaneWithLabel>

                {/* Right Pane: Match Information */}
                <ToolPaneWithLabel label="MATCH INFORMATION">
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        backgroundColor: 'var(--cds-layer)',
                        border: '1px solid var(--cds-border-strong)',
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '0.875rem'
                    }}>
                        {output.length > 0 ? output : (
                            <div style={{ padding: '1rem', color: 'var(--cds-text-secondary)' }}>
                                Matching results will appear here...
                            </div>
                        )}
                    </div>
                </ToolPaneWithLabel>
            </ToolSplitPane>
        </div>
    );
}
