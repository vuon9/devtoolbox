import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Settings,
  Search,
  Pin,
  PinOff,
  Type,
  Binary,
  Clock,
  ShieldCheck,
  ScanBarcode,
  LayoutDashboard,
  Code2,
  Palette,
  Timer,
  Regex,
  Diff,
  Hash
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../utils/cn';

export function Sidebar({ isVisible, onOpenSettings }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [pinned, setPinned] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pinnedTools')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('pinnedTools', JSON.stringify(pinned));
  }, [pinned]);

  const tools = [
    { id: 'text-converter', name: 'Text Converter', icon: Type },
    { id: 'string-utilities', name: 'String Utilities', icon: Hash },
    { id: 'number-converter', name: 'Number Converter', icon: Binary },
    { id: 'datetime-converter', name: 'DateTime Converter', icon: Clock },
    { id: 'jwt', name: 'JWT Debugger', icon: ShieldCheck },
    { id: 'barcode', name: 'Barcode / QR Code', icon: ScanBarcode },
    { id: 'data-generator', name: 'Data Generator', icon: LayoutDashboard },
    { id: 'code-formatter', name: 'Code Formatter', icon: Code2 },
    { id: 'color-converter', name: 'Color Converter', icon: Palette },
    { id: 'cron', name: 'Cron Job Parser', icon: Timer },
    { id: 'regexp', name: 'RegExp Tester', icon: Regex },
    { id: 'diff', name: 'Text Diff Checker', icon: Diff },
  ];

  const togglePin = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (pinned.includes(id)) {
      setPinned(pinned.filter((p) => p !== id));
    } else {
      setPinned([...pinned, id]);
    }
  };

  // Filtering
  let displayTools = tools.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Split into Pinned and Regular
  const pinnedTools = displayTools.filter((t) => pinned.includes(t.id));
  const regularTools = displayTools.filter((t) => !pinned.includes(t.id));

  // Sort Alphabetically
  pinnedTools.sort((a, b) => a.name.localeCompare(b.name));
  regularTools.sort((a, b) => a.name.localeCompare(b.name));

  if (!isVisible) return null;

  return (
    <aside className="w-64 border-r bg-muted/30 flex flex-col h-full overflow-hidden select-none">
      {/* Search area */}
      <div className="p-4 pb-2">
        <div className="relative group">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search tools... (cmd+k)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 bg-background/50 border-border/40 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-4 py-2">
          {pinnedTools.length > 0 && (
            <div className="px-2">
              <h2 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                <Pin className="h-3 w-3" />
                Pinned
              </h2>
              <div className="space-y-1">
                {pinnedTools.map((tool) => (
                  <SidebarItem key={tool.id} tool={tool} isPinned={true} onTogglePin={togglePin} />
                ))}
              </div>
            </div>
          )}

          <div className="px-2">
            <h2 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              All Tools
            </h2>
            <div className="space-y-1">
              {regularTools.map((tool) => (
                <SidebarItem key={tool.id} tool={tool} isPinned={false} onTogglePin={togglePin} />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t bg-muted/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSettings}
          className="w-full justify-start text-muted-foreground hover:text-foreground h-9 px-2"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </aside>
  );
}

function SidebarItem({ tool, isPinned, onTogglePin }) {
  const Icon = tool.icon;

  return (
    <NavLink
      to={`/tool/${tool.id}`}
      className={({ isActive }) => cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
        "hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" : "text-muted-foreground"
      )}
    >
      <Icon className={cn(
        "h-4 w-4 shrink-0 transition-colors",
        "group-hover:text-primary"
      )} />
      <span className="flex-1 truncate">{tool.name}</span>
      <button
        onClick={(e) => onTogglePin(e, tool.id)}
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background rounded",
          isPinned && "opacity-100 text-primary"
        )}
      >
        {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
      </button>
    </NavLink>
  );
}

export default Sidebar;
