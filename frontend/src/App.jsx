import React, { useState, useEffect } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { Theme, IconButton, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { Settings } from '@carbon/icons-react';

// Tools Imports (Keeping all existing imports)
import JsonFormatter from './tools/JsonFormatter';
import Base64Converter from './tools/Base64Converter';
import HashGenerator from './tools/HashGenerator';
import UuidGenerator from './tools/UuidGenerator';
import UnixTimeConverter from './tools/UnixTimeConverter';
import JwtDebugger from './tools/JwtDebugger';
import RegExpTester from './tools/RegExpTester';
import HtmlEntityConverter from './tools/HtmlEntityConverter';
import ColorConverter from './tools/ColorConverter';
import BackslashEscaper from './tools/BackslashEscaper';
import RandomStringGenerator from './tools/RandomStringGenerator';
import HtmlPreview from './tools/HtmlPreview';
import SqlFormatter from './tools/SqlFormatter';
import StringCaseConverter from './tools/StringCaseConverter';
import CronJobParser from './tools/CronJobParser';
import TextDiffChecker from './tools/TextDiffChecker';
import NumberBaseConverter from './tools/NumberBaseConverter';
import CodeFormatter from './tools/CodeFormatter';
import LoremIpsumGenerator from './tools/LoremIpsumGenerator';
import QrCodeGenerator from './tools/QrCodeGenerator';
import MarkdownPreview from './tools/MarkdownPreview';
import LineSortDedupe from './tools/LineSortDedupe';
import StringInspector from './tools/StringInspector';
import HexAsciiConverter from './tools/HexAsciiConverter';
import PhpSerializer from './tools/PhpSerializer';
import UrlTools from './tools/UrlTools';
import DataConverter from './tools/DataConverter';
import PhpJsonConverter from './tools/PhpJsonConverter';

// Error boundary for catching React rendering errors
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: 'var(--cds-text-primary)', backgroundColor: 'var(--cds-layer)' }}>
                    <h2>Something went wrong</h2>
                    <p>The application encountered an error. Please try refreshing the page.</p>
                    <details style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
                        <summary>Error details</summary>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

function App() {
    console.log('App mounting');
    const [activeTool, setActiveTool] = useState('json');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [theme, setTheme] = useState('g100'); // 'white', 'g10', 'g90', 'g100'
    const [themeMode, setThemeMode] = useState('dark'); // 'system', 'light', 'dark'

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        // Detect System Theme
        const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');

        const updateTheme = () => {
            if (themeMode === 'system') {
                setTheme(matchMedia.matches ? 'g100' : 'white');
            } else if (themeMode === 'dark') {
                setTheme('g100');
            } else {
                setTheme('white');
            }
        };

        updateTheme();
        matchMedia.addEventListener('change', updateTheme);
        return () => matchMedia.removeEventListener('change', updateTheme);
    }, [themeMode]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
                e.preventDefault();
                toggleSidebar();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSidebarOpen]);

    const renderTool = () => {
        switch (activeTool) {
            case 'json': return <JsonFormatter />;
            case 'base64': return <Base64Converter />;
            case 'hash': return <HashGenerator />;
            case 'uuid': return <UuidGenerator />;
            case 'unix-time': return <UnixTimeConverter />;
            case 'jwt': return <JwtDebugger />;
            case 'regexp': return <RegExpTester />;
            case 'html-entity': return <HtmlEntityConverter />;
            case 'color': return <ColorConverter />;
            case 'escape': return <BackslashEscaper />;
            case 'random': return <RandomStringGenerator />;
            case 'html-preview': return <HtmlPreview />;
            case 'sql': return <SqlFormatter />;
            case 'case': return <StringCaseConverter />;
            case 'cron': return <CronJobParser />;
            case 'diff': return <TextDiffChecker />;
            case 'number-base': return <NumberBaseConverter />;
            case 'code-fmt': return <CodeFormatter />;
            case 'lorem': return <LoremIpsumGenerator />;
            case 'qr': return <QrCodeGenerator />;
            case 'markdown': return <MarkdownPreview />;
            case 'sort': return <LineSortDedupe />;
            case 'inspector': return <StringInspector />;
            case 'hex-ascii': return <HexAsciiConverter />;
            case 'php-ser': return <PhpSerializer />;
            case 'php-json': return <PhpJsonConverter />;
            case 'url-tools': return <UrlTools />;
            case 'data-converter': return <DataConverter />;
            default: return <div className="tool-container">Select a tool</div>;
        }
    };

    return (
        <ErrorBoundary>
            <Theme theme={theme} style={{ height: '100%' }}>
            <div className="app-container">
                <Sidebar
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    isVisible={isSidebarOpen}
                />

                <main className="main-content">
                    {/* Top Bar Area for Toggle & Settings */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 16px',
                        zIndex: 900,
                        pointerEvents: 'none' /* Passthrough to tool interactions if no header bg */
                    }}>
                        <div style={{ pointerEvents: 'auto' }}>
                            {!isSidebarOpen && (
                                <IconButton
                                    kind="ghost"
                                    size="sm"
                                    onClick={toggleSidebar}
                                    label="Toggle Sidebar"
                                    align="bottom"
                                    className="cds-icon-btn" // Ensuring Carbon class
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="3" y1="12" x2="21" y2="12"></line>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <line x1="3" y1="18" x2="21" y2="18"></line>
                                    </svg>
                                </IconButton>
                            )}
                        </div>

                        <div style={{ pointerEvents: 'auto' }}>
                            <OverflowMenu
                                renderIcon={Settings}
                                flipped
                                size="sm"
                                ariaLabel="Settings"
                                iconDescription="Settings"
                                title="Theme Settings"
                            >
                                <OverflowMenuItem itemText="System Theme" onClick={() => setThemeMode('system')} requireTitle />
                                <OverflowMenuItem itemText="Dark Theme" onClick={() => setThemeMode('dark')} requireTitle />
                                <OverflowMenuItem itemText="Light Theme" onClick={() => setThemeMode('light')} requireTitle />
                            </OverflowMenu>
                        </div>
                    </div>


                    <div className="content-area" style={{ marginTop: '0px' }}>
                        {renderTool()}
                    </div>
                </main>

                {isSidebarOpen && (
                    <div style={{ position: 'absolute', top: '10px', left: '215px', zIndex: 900 }}>
                        <IconButton
                            kind="ghost"
                            size="sm"
                            onClick={toggleSidebar}
                            label="Close Sidebar"
                            align="bottom"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12"></path>
                            </svg>
                        </IconButton>
                    </div>
                )}
            </div>
        </Theme>
        </ErrorBoundary>
    );
}

export default App;
