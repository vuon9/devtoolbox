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

function SidebarItem({ to, icon: Icon, label, disabled, collapsed }) {
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: collapsed ? '0' : '10px',
    padding: collapsed ? '10px' : '10px 16px',
    margin: collapsed ? '4px' : '0 8px',
    fontSize: '14px',
    borderRadius: '8px',
    transition: 'all 0.15s ease',
    justifyContent: collapsed ? 'center' : 'flex-start',
  };

  if (disabled) {
    return (
      <div style={{ ...baseStyle, color: '#52525b', cursor: 'not-allowed' }} title={collapsed ? label : undefined}>
        {Icon && <Icon style={{ width: '16px', height: '16px', flexShrink: 0, opacity: 0.4 }} />}
        {!collapsed && (
          <>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#3f3f46', marginLeft: 'auto' }}>
              disabled
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      style={({ isActive }) => ({
        ...baseStyle,
        color: isActive ? '#ffffff' : '#a1a1aa',
        backgroundColor: isActive ? '#27272a' : 'transparent',
      })}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.5)';
        e.currentTarget.style.color = '#e4e4e7';
      }}
      onMouseLeave={(e) => {
        const isActive = e.currentTarget.classList.contains('active');
        e.currentTarget.style.backgroundColor = isActive ? '#27272a' : 'transparent';
        e.currentTarget.style.color = isActive ? '#ffffff' : '#a1a1aa';
      }}
    >
      {Icon && <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />}
      {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>}
    </NavLink>
  );
}

export function Sidebar({ isVisible, onOpenSettings }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (!isVisible) return null;

  return (
    <aside style={{
      width: isCollapsed ? '64px' : '256px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#18181b',
      borderRight: '1px solid #27272a',
      transition: 'width 0.2s ease',
    }}>
      {/* Logo */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
          flexShrink: 0,
        }}>
          <Box style={{ width: '20px', height: '20px', color: 'white' }} />
        </div>
        {!isCollapsed && (
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#f4f4f5', marginLeft: '12px', whiteSpace: 'nowrap' }}>
            DevToolbox
          </span>
        )}
      </div>

      {/* Search - only show when expanded */}
      {!isCollapsed && (
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
      )}

      <ScrollArea style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ paddingBottom: '24px' }}>
          {/* Quick Access - only show when expanded */}
          {!isCollapsed && !searchQuery && (
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
                      collapsed={isCollapsed}
                    />
                  ))}
                </>
              )}

              <div style={{ height: '1px', background: '#27272a', margin: '16px' }} />
            </>
          )}

          {/* Categories */}
          {categories.map(category => (
            <div key={category}>
              {!isCollapsed && (
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
                  {CATEGORY_ICONS[category] && <CATEGORY_ICONS[category] style={{ width: '14px', height: '14px' }} />}
                  <span>{category}</span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {toolsByCategory[category].map(tool => (
                  <SidebarItem
                    key={tool.id}
                    to={`/tool/${tool.id}`}
                    label={tool.name}
                    icon={TOOL_ICONS[tool.id] || Box}
                    disabled={tool.id !== 'text-converter'}
                    collapsed={isCollapsed}
                  />
                ))}
              </div>
            </div>
          ))}

          {!isCollapsed && categories.length === 0 && (
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
            title={isCollapsed ? 'Settings' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '10px',
              flex: 1,
              padding: isCollapsed ? '10px' : '10px 12px',
              fontSize: '14px',
              color: '#a1a1aa',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#27272a';
              e.currentTarget.style.color = '#f4f4f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#a1a1aa';
            }}
          >
            <Settings style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            {!isCollapsed && <span>Settings</span>}
          </button>
          <button
            onClick={handleToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#27272a';
              e.currentTarget.style.color = '#f4f4f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#71717a';
            }}
          >
            {isCollapsed ? (
              <ChevronRight style={{ width: '16px', height: '16px' }} />
            ) : (
              <ChevronLeft style={{ width: '16px', height: '16px' }} />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;