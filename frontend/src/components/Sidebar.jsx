import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Search,
  Settings,
  Star,
  History,
  Type,
  Binary,
  ShieldCheck,
  QrCode,
  Wrench,
  Palette,
  Clock,
  Regex,
  FileDiff,
  Box,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { cn } from '../utils/cn';

const CATEGORY_ICONS = {
  Text: Type,
  Data: Binary,
  Security: ShieldCheck,
  Generator: QrCode,
  Developer: Wrench,
};

const TOOL_ICONS = {
  'text-converter': Type,
  'string-utilities': Type,
  'number-converter': Binary,
  'datetime-converter': Clock,
  'jwt': ShieldCheck,
  'barcode': QrCode,
  'data-generator': LayoutGrid,
  'code-formatter': Wrench,
  'color-converter': Palette,
  'cron': Clock,
  'regexp': Regex,
  'diff': FileDiff,
};

function SidebarItem({ to, icon: Icon, label, disabled }) {
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    margin: '0 8px',
    fontSize: '14px',
    borderRadius: '8px',
    transition: 'all 0.15s ease',
  };

  if (disabled) {
    return (
      <div style={{ ...baseStyle, color: '#52525b', cursor: 'not-allowed' }}>
        {Icon && <Icon style={{ width: '16px', height: '16px', flexShrink: 0, opacity: 0.4 }} />}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#3f3f46', marginLeft: 'auto' }}>
          disabled
        </span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...baseStyle,
        color: isActive ? '#ffffff' : '#a1a1aa',
        backgroundColor: isActive ? '#27272a' : 'transparent',
      })}
      onMouseEnter={(e) => {
        if (!e.currentTarget.classList.contains('active')) {
          e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.5)';
          e.currentTarget.style.color = '#e4e4e7';
        }
      }}
      onMouseLeave={(e) => {
        if (!e.currentTarget.classList.contains('active')) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#a1a1aa';
        }
      }}
    >
      {Icon && <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </NavLink>
  );
}

function SidebarHeader({ title, icon: Icon }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px 8px',
      fontSize: '11px',
      fontWeight: 600,
      color: '#71717a',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {Icon && <Icon style={{ width: '14px', height: '14px' }} />}
      <span>{title}</span>
    </div>
  );
}

export function Sidebar({ isVisible, onOpenSettings, onToggle }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favoriteTools')) || [];
    } catch {
      return [];
    }
  });

  const tools = [
    { id: 'text-converter', name: 'Text Converter', category: 'Text' },
    { id: 'string-utilities', name: 'String Utilities', category: 'Text' },
    { id: 'number-converter', name: 'Number Converter', category: 'Data' },
    { id: 'datetime-converter', name: 'DateTime Converter', category: 'Data' },
    { id: 'jwt', name: 'JWT Debugger', category: 'Security' },
    { id: 'barcode', name: 'Barcode / QR Code', category: 'Generator' },
    { id: 'data-generator', name: 'Data Generator', category: 'Generator' },
    { id: 'code-formatter', name: 'Code Formatter', category: 'Developer' },
    { id: 'color-converter', name: 'Color Converter', category: 'Developer' },
    { id: 'cron', name: 'Cron Job Parser', category: 'Developer' },
    { id: 'regexp', name: 'RegExp Tester', category: 'Developer' },
    { id: 'diff', name: 'Text Diff Checker', category: 'Text' },
  ];

  const filteredTools = useMemo(() => {
    if (!searchQuery) return tools;
    return tools.filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, tools]);

  const favoriteTools = tools.filter(t => favorites.includes(t.id));

  const toolsByCategory = useMemo(() => {
    return filteredTools.reduce((acc, tool) => {
      if (!acc[tool.category]) acc[tool.category] = [];
      acc[tool.category].push(tool);
      return acc;
    }, {});
  }, [filteredTools]);

  const categories = Object.keys(toolsByCategory).sort();

  // Collapsed state (only show icons)
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggle) onToggle(!isCollapsed);
  };

  // When collapsed, don't show anything if not visible
  if (!isVisible && !isCollapsed) return null;

  return (
    <aside style={{
      width: '256px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#18181b',
      borderRight: '1px solid #27272a',
    }}>
      {/* Logo */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
          }}>
            <Box style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#f4f4f5' }}>DevToolbox</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            color: '#71717a',
          }} />
          <input
            placeholder="Search tools..."
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px 0 36px',
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#f4f4f5',
              fontSize: '14px',
              outline: 'none',
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ paddingBottom: '24px' }}>
          {/* Quick Access */}
          {!searchQuery && (
            <>
              <NavLink
                to="/tool/text-converter"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  margin: '0 8px',
                  fontSize: '14px',
                  color: '#a1a1aa',
                  borderRadius: '8px',
                }}
              >
                <History style={{ width: '16px', height: '16px' }} />
                <span>Recent</span>
              </NavLink>

              {favoriteTools.length > 0 && (
                <>
                  <div style={{ height: '1px', background: '#27272a', margin: '12px 16px' }} />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#71717a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    <Star style={{ width: '14px', height: '14px' }} />
                    <span>Favorites</span>
                  </div>
                  {favoriteTools.map(tool => (
                    <SidebarItem
                      key={tool.id}
                      to={`/tool/${tool.id}`}
                      label={tool.name}
                      icon={TOOL_ICONS[tool.id] || Box}
                    />
                  ))}
                </>
              )}

              <div style={{ height: '1px', background: '#27272a', margin: '16px' }} />
            </>
          )}

          {/* Categories */}
          {categories.map(category => (
            <div key={category} style={{ marginTop: '8px' }}>
              <SidebarHeader title={category} icon={CATEGORY_ICONS[category]} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {toolsByCategory[category].map(tool => (
                  <SidebarItem
                    key={tool.id}
                    to={`/tool/${tool.id}`}
                    label={tool.name}
                    icon={TOOL_ICONS[tool.id] || Box}
                    disabled={tool.id !== 'text-converter'}
                  />
                ))}
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: '14px', color: '#71717a' }}>
              No tools found.
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Settings and Collapse */}
      <div style={{ padding: '16px', borderTop: '1px solid #27272a' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onOpenSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flex: 1,
              padding: '10px 12px',
              fontSize: '14px',
              color: '#a1a1aa',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <Settings style={{ width: '16px', height: '16px' }} />
            <span>Settings</span>
          </button>
          <button
            onClick={handleToggleCollapse}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              padding: '6px',
              fontSize: '14px',
              color: '#71717a',
              backgroundColor: 'transparent',
              border: '1px solid #27272a',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            title="Collapse sidebar"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#27272a';
              e.currentTarget.style.color = '#f4f4f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#71717a';
            }}
          >
            <ChevronLeft style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;