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
  ArrowLeftRight,
  Fingerprint,
  CaseSensitive,
  Hash,
  Key,
  Code2,
  Timer,
  FileCode,
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
  'code-encoder': FileCode,
  'code-encrypter': ShieldCheck,
  'hash-generator': Fingerprint,
  'code-converter': ArrowLeftRight,
  'text-utilities': CaseSensitive,
  'number-converter': Hash,
  'datetime-converter': Clock,
  jwt: Key,
  barcode: QrCode,
  'data-generator': LayoutGrid,
  'code-formatter': Code2,
  'color-converter': Palette,
  cron: Timer,
  regexp: Regex,
  diff: FileDiff,
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
      <div
        style={{ ...baseStyle, color: 'var(--muted-foreground)', cursor: 'not-allowed' }}
        title={collapsed ? label : undefined}
      >
        {Icon && <Icon style={{ width: '16px', height: '16px', flexShrink: 0, opacity: 0.4 }} />}
        {!collapsed && (
          <>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {label}
            </span>
            <span
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--border)',
                marginLeft: 'auto',
              }}
            >
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
        color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
        backgroundColor: isActive ? 'var(--border)' : 'transparent',
      })}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--muted)';
        e.currentTarget.style.color = 'var(--foreground)';
      }}
      onMouseLeave={(e) => {
        const isActive = e.currentTarget.classList.contains('active');
        e.currentTarget.style.backgroundColor = isActive ? 'var(--border)' : 'transparent';
        e.currentTarget.style.color = isActive ? 'var(--foreground)' : 'var(--muted-foreground)';
      }}
    >
      {Icon && <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />}
      {!collapsed && (
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      )}
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
    { id: 'code-encoder', name: 'Code Encoder', category: 'Text' },
    { id: 'code-encrypter', name: 'Code Encrypter', category: 'Security' },
    { id: 'hash-generator', name: 'Hash Generator', category: 'Security' },
    { id: 'code-converter', name: 'Code Converter', category: 'Developer' },
    { id: 'text-utilities', name: 'Text Utilities', category: 'Text' },
    { id: 'number-converter', name: 'Number Converter', category: 'Data' },
    { id: 'datetime-converter', name: 'DateTime Converter', category: 'Data' },
    { id: 'jwt', name: 'JWT Debugger', category: 'Security' },
    { id: 'barcode', name: 'Barcode / QR Code', category: 'Generator' },
    { id: 'data-generator', name: 'Data Generator', category: 'Generator' },
    { id: 'code-formatter', name: 'Code Formatter', category: 'Developer' },
    { id: 'color-converter', name: 'Color Converter', category: 'Developer' },
    { id: 'cron', name: 'Cron Job Parser', category: 'Developer' },
    { id: 'regexp', name: 'RegExp Tester', category: 'Developer' },
    { id: 'diff', name: 'Text Diff', category: 'Text' },
  ];

  const filteredTools = useMemo(() => {
    if (!searchQuery) return tools;
    return tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, tools]);

  const favoriteTools = tools.filter((t) => favorites.includes(t.id));

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
    <aside
      style={{
        width: isCollapsed ? '72px' : '256px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--sidebar-background)',
        borderRight: '1px solid var(--border)',
        transition: 'width 0.2s ease',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
            flexShrink: 0,
          }}
        >
          <Box style={{ width: '20px', height: '20px', color: 'white' }} />
        </div>
        {!isCollapsed && (
          <span
            style={{
              fontWeight: 700,
              fontSize: '18px',
              color: 'var(--foreground)',
              marginLeft: '12px',
              whiteSpace: 'nowrap',
            }}
          >
            DevToolbox
          </span>
        )}
      </div>

      {/* Search - only show when expanded */}
      {!isCollapsed && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ position: 'relative' }}>
            <Search
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: 'var(--muted-foreground)',
              }}
            />
            <input
              placeholder="Search tools..."
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px 0 36px',
                backgroundColor: 'var(--muted)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--foreground)',
                fontSize: '14px',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
                transition: 'border-color 0.15s ease',
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--ring)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            />
          </div>
        </div>
      )}

      <ScrollArea style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ paddingBottom: '24px' }}>
          {/* Quick Access - only show when expanded */}
          {!isCollapsed && !searchQuery && (
            <>
              {favoriteTools.length > 0 && (
                <>
                  <div
                    style={{ height: '1px', background: 'var(--border)', margin: '12px 16px' }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--muted-foreground)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <Star style={{ width: '14px', height: '14px' }} />
                    <span>Favorites</span>
                  </div>
                  {favoriteTools.map((tool) => (
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

              <div style={{ height: '1px', background: 'var(--border)', margin: '16px' }} />
            </>
          )}

          {/* Categories */}
          {categories.map((category) => (
            <div key={category}>
              {!isCollapsed && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {(() => {
                    const IconComponent = CATEGORY_ICONS[category];
                    return IconComponent ? (
                      <IconComponent style={{ width: '14px', height: '14px' }} />
                    ) : null;
                  })()}
                  <span>{category}</span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {toolsByCategory[category].map((tool) => (
                  <SidebarItem
                    key={tool.id}
                    to={`/tool/${tool.id}`}
                    label={tool.name}
                    icon={TOOL_ICONS[tool.id] || Box}
                    disabled={
                      ![
                        'code-encoder',
                        'code-encrypter',
                        'hash-generator',
                        'code-converter',
                        'text-utilities',
                        'diff',
                        'jwt',
                        'barcode',
                        'data-generator',
                        'regexp',
                        'cron',
                        'code-formatter',
                        'color-converter',
                        'number-converter',
                        'datetime-converter',
                      ].includes(tool.id)
                    }
                    collapsed={isCollapsed}
                  />
                ))}
              </div>
            </div>
          ))}

          {!isCollapsed && categories.length === 0 && (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                fontSize: '14px',
                color: 'var(--muted-foreground)',
              }}
            >
              No tools found.
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Settings and Collapse */}
      <div
        style={{
          padding: isCollapsed ? '8px' : '16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: isCollapsed ? 'column' : 'row',
          gap: isCollapsed ? '4px' : '8px',
        }}
      >
        <button
          onClick={onOpenSettings}
          title={isCollapsed ? 'Settings' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: isCollapsed ? '48px' : 'auto',
            flex: isCollapsed ? 'none' : 1,
            padding: isCollapsed ? '10px' : '10px 12px',
            fontSize: '14px',
            color: 'var(--muted-foreground)',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--foreground)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--muted-foreground)';
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
            width: isCollapsed ? '48px' : '36px',
            height: '36px',
            padding: '6px',
            fontSize: '14px',
            color: 'var(--muted-foreground)',
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--foreground)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--muted-foreground)';
          }}
        >
          {isCollapsed ? (
            <ChevronRight style={{ width: '16px', height: '16px' }} />
          ) : (
            <ChevronLeft style={{ width: '16px', height: '16px' }} />
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
