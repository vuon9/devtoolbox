import React from 'react';
import { cn } from '../../utils/cn';

export function ToolTabBar({ tabs, activeTab, onTabChange, className }) {
  return (
    <div className={cn('flex border-b mb-4 bg-muted/20 rounded-t-lg overflow-hidden', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-4 py-2 text-xs font-medium transition-all relative',
            'hover:bg-background/50',
            activeTab === tab.id ? 'bg-background text-primary' : 'text-muted-foreground'
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}

export default ToolTabBar;
