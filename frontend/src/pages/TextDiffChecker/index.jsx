import React, { useState, useEffect } from 'react';
import { ToolHeader, ToolPane, ToolSplitPane, ToolControls } from '../../components/ToolUI';
import { Button } from '../../components/ui/button';
import { cn } from '../../utils/cn';
import {
  Diff,
  Trash2,
  Undo2,
  Split,
  Rows,
  CheckCircle2,
  AlertCircle,
  Hash,
  Binary,
  Code2
} from 'lucide-react';

export default function TextDiffChecker() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [activeMode, setActiveMode] = useState(() => localStorage.getItem('diff-mode') || 'side-by-side');

  useEffect(() => {
    localStorage.setItem('diff-mode', activeMode);
  }, [activeMode]);

  const handleReset = () => {
    setOriginal('');
    setModified('');
  };

  const diffModes = [
    { id: 'side-by-side', label: 'Side-by-Side', icon: Split },
    { id: 'unified', label: 'Unified View', icon: Rows },
  ];

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden bg-background">
      <ToolHeader
        title="Text Diff Checker"
        description="Compare two pieces of text and visualize differences instantly. Supports side-by-side and unified views with character-level granularity."
      />

      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div className="flex gap-1 bg-muted/30 p-1 rounded-lg border border-border/40">
          {diffModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
                activeMode === mode.id
                  ? "bg-background text-primary shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <mode.icon className="h-3.5 w-3.5" />
              {mode.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 gap-2 font-bold uppercase tracking-wider text-[10px] text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ToolSplitPane>
          <div className="flex flex-col h-full space-y-4">
            <ToolPane
              label="Original Text"
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="Paste original version here..."
              className="flex-1"
            />
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Base Version
            </div>
          </div>

          <div className="flex flex-col h-full space-y-4">
            <ToolPane
              label="Modified Text"
              value={modified}
              onChange={(e) => setModified(e.target.value)}
              placeholder="Paste modified version here..."
              className="flex-1"
            />
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Comparison Target
            </div>
          </div>
        </ToolSplitPane>
      </div>

      {/* Mock Diff Visualization */}
      <div className="mt-6 p-4 rounded-lg bg-muted/20 border border-border/40 min-h-24 overflow-hidden">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b pb-2 mb-3">
          Diff Result (Mockup)
        </div>
        <div className="space-y-1 font-mono text-sm leading-relaxed opacity-60">
          <div className="flex items-center gap-4 text-muted-foreground">
             <span className="w-8 text-[10px] opacity-40">1</span>
             <span>This line is common to both versions.</span>
          </div>
          <div className="flex items-center gap-4 bg-destructive/10 text-destructive border-l-2 border-destructive px-2 -mx-2 py-0.5">
             <span className="w-8 text-[10px] opacity-40 text-destructive/50">-</span>
             <span>This line was removed in the modified version.</span>
          </div>
          <div className="flex items-center gap-4 bg-green-500/10 text-green-500 border-l-2 border-green-500 px-2 -mx-2 py-0.5">
             <span className="w-8 text-[10px] opacity-40 text-green-500/50">+</span>
             <span>This line was added in the modified version.</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
             <span className="w-8 text-[10px] opacity-40">2</span>
             <span>Another common line here.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
