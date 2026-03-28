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
  LayoutGrid
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

function SidebarItem({ to, icon: Icon, label, onClick, disabled }) {
  if (disabled) {
    return (
      <div
        className={cn(
          'flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-600 cursor-not-allowed'
        )}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0 opacity-40" />}
        <span className="truncate">{label}</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-700 ml-auto">
          disabled
        </span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-all',
          'hover:bg-zinc-800/80 hover:text-zinc-100',
          isActive
            ? 'bg-zinc-800 text-zinc-100 border-l-2 border-blue-500 pl-[10px]'
            : 'text-zinc-400'
        )
      }
    >
      {Icon && <Icon className="h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />}
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

function SidebarHeader({ title, icon: Icon }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 mt-3 mb-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span>{title}</span>
    </div>
  );
}

export function Sidebar({ isVisible, onOpenSettings }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => {
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
  
  // Group filtered tools by category
  const toolsByCategory = useMemo(() => {
    return filteredTools.reduce((acc, tool) => {
      if (!acc[tool.category]) acc[tool.category] = [];
      acc[tool.category].push(tool);
      return acc;
    }, {});
  }, [filteredTools]);

  const categories = Object.keys(toolsByCategory).sort();

  if (!isVisible) return null;

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-900/95 flex flex-col h-full transition-all duration-300">
      {/* Header & Logo */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2.5 py-3">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <Box className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg text-zinc-100 tracking-tight">DevToolbox</span>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search tools..."
            className="pl-9 bg-zinc-800/50 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-zinc-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 pb-6">
          {/* Quick Access */}
          {!searchQuery && (
            <>
              <NavLink
                to="/tool/text-converter"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 rounded-md',
                    'hover:bg-zinc-800/80 hover:text-zinc-200'
                  )
                }
              >
                <History className="h-4 w-4 shrink-0 opacity-70" />
                <span>Recent</span>
              </NavLink>

              {favoriteTools.length > 0 && (
                <>
                  <div className="h-px bg-zinc-800 my-2 mx-1" />
                  <div className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <Star className="h-3.5 w-3.5" />
                    <span>Favorites</span>
                  </div>
                  <div className="space-y-0.5">
                    {favoriteTools.map(tool => (
                      <SidebarItem
                        key={tool.id}
                        to={`/tool/${tool.id}`}
                        label={tool.name}
                        icon={TOOL_ICONS[tool.id] || Box}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Divider */}
          {!searchQuery && <div className="h-px bg-zinc-800 mx-1 my-2" />}

          {/* Categories */}
          {categories.map(category => (
            <div key={category} className="mt-1">
              <SidebarHeader title={category} icon={CATEGORY_ICONS[category]} />
              <div className="space-y-0.5">
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
             <div className="px-3 py-8 text-center text-sm text-zinc-500">
               No tools found.
             </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer / Settings */}
      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={onOpenSettings}
          className={cn(
            'flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 rounded-md',
            'hover:bg-zinc-800 hover:text-zinc-200'
          )}
        >
          <Settings className="h-4 w-4 shrink-0 opacity-70" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;