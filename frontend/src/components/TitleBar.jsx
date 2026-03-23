import React from 'react';
import {
  Menu,
  Settings,
  Minus,
  Square,
  X,
  Sidebar as SidebarIcon
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../utils/cn';

export function TitleBar({
  isSidebarOpen,
  toggleSidebar,
  appName = 'DevToolbox',
  onOpenSettings,
}) {
  // Detect if running in desktop mode (Wails)
  const isDesktop = typeof window !== 'undefined' && window.go?.devtoolbox?.service?.WindowControls;

  // Detect platform
  const userAgent = navigator.userAgent.toLowerCase();
  const isMac = userAgent.includes('mac') && !userAgent.includes('iphone') && !userAgent.includes('ipad');

  const handleMinimize = () => window.runtime?.WindowMinimise?.();
  const handleMaximize = () => window.runtime?.WindowToggleMaximise?.();
  const handleClose = () => window.runtime?.WindowQuit?.();

  return (
    <header className={cn(
      "h-10 border-b bg-background flex items-center justify-between px-3 select-none drag-region",
      isMac && "pl-20" // Space for Mac traffic lights
    )}>
      {/* Left section */}
      <div className="flex items-center gap-2 no-drag">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-7 w-7"
        >
          {isSidebarOpen ? <SidebarIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Center section */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
        <span className="text-xs font-semibold tracking-tight text-muted-foreground uppercase">{appName}</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 no-drag">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className="h-7 w-7"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {isDesktop && !isMac && (
          <div className="flex items-center ml-2 border-l pl-2 gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent" onClick={handleMinimize}>
              <Minus className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent" onClick={handleMaximize}>
              <Square className="h-2.5 w-2.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

export default TitleBar;
