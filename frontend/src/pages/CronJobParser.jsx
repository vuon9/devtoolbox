import React, { useState, useEffect } from 'react';
import { ToolHeader, ToolPane, ToolSplitPane, ToolControls } from '../components/ToolUI';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Timer, Play, Clock, Calendar, Hash, History, Trash2, Info } from 'lucide-react';
import { cn } from '../utils/cn';
import cronstrue from 'cronstrue';

export default function CronJobParser() {
  const [cron, setCron] = useState('*/15 * * * *');
  const [description, setDescription] = useState('');
  const [nextRuns, setNextRuns] = useState([]);
  const [error, setError] = useState('');

  const parseCron = (val = cron) => {
    if (!val.trim()) {
      setDescription('');
      setError('');
      return;
    }
    try {
      const desc = cronstrue.toString(val);
      setDescription(desc);
      setError('');
      // Mock next runs for demo
      setNextRuns([
        'Mon, 23 Mar 2026 12:00:00 GMT',
        'Mon, 23 Mar 2026 12:15:00 GMT',
        'Mon, 23 Mar 2026 12:30:00 GMT',
        'Mon, 23 Mar 2026 12:45:00 GMT',
        'Mon, 23 Mar 2026 13:00:00 GMT',
      ]);
    } catch (e) {
      setError(e.toString());
      setDescription('');
      setNextRuns([]);
    }
  };

  useEffect(() => {
    parseCron();
  }, [cron]);

  const presets = [
    { label: 'Every Minute', value: '* * * * *' },
    { label: 'Every 15 Min', value: '*/15 * * * *' },
    { label: 'Every Hour', value: '0 * * * *' },
    { label: 'Daily @ Mid', value: '0 0 * * *' },
    { label: 'Weekly', value: '0 0 * * 0' },
  ];

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden bg-background">
      <ToolHeader
        title="Cron Job Parser"
        description="Decode cron expressions into human-readable descriptions. Validate schedules and preview the next several execution times."
      />

      <ToolControls className="mb-6 justify-between items-end">
        <div className="flex-1 max-w-lg">
          <Label
            htmlFor="cron-input"
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1.5 ml-1"
          >
            Cron Expression
          </Label>
          <div className="relative group">
            <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
            <Input
              id="cron-input"
              value={cron}
              onChange={(e) => setCron(e.target.value)}
              placeholder="* * * * *"
              className="pl-10 h-10 bg-background/50 border-border/40 font-mono text-lg font-bold tracking-widest text-primary shadow-sm focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 ml-4">
          {presets.map((p) => (
            <Button
              key={p.label}
              variant="outline"
              size="sm"
              onClick={() => setCron(p.value)}
              className="h-7 px-3 text-[9px] font-bold uppercase tracking-wider bg-background/50 hover:bg-primary/10 hover:border-primary/30"
            >
              {p.label}
            </Button>
          ))}
        </div>
      </ToolControls>

      <div className="flex-1 min-h-0 space-y-6 overflow-y-auto">
        <div className="p-6 rounded-lg bg-primary/5 border border-primary/20 shadow-inner group">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2">
            <Info className="h-3 w-3" />
            Human Readable Description
          </div>
          <div
            className={cn(
              'text-2xl font-semibold tracking-tight leading-relaxed',
              error ? 'text-destructive' : 'text-foreground'
            )}
          >
            {error ? 'Invalid Cron Expression' : description || 'Enter an expression above...'}
          </div>
          {error && (
            <div className="mt-2 text-xs font-mono text-destructive/70 italic">{error}</div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg bg-muted/20 border border-border/40 space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b pb-2">
              <Clock className="h-3 w-3" />
              Next Execution Times
            </div>
            <div className="space-y-2">
              {nextRuns.map((run, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 group p-2 rounded hover:bg-muted/30 transition-colors cursor-default"
                >
                  <span className="text-[10px] font-mono text-muted-foreground/40 w-4">
                    {i + 1}
                  </span>
                  <span className="text-xs font-mono font-medium text-foreground/80 group-hover:text-primary transition-colors">
                    {run}
                  </span>
                </div>
              ))}
              {nextRuns.length === 0 && (
                <div className="text-xs text-muted-foreground italic px-2">
                  Waiting for valid expression...
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-lg bg-muted/20 border border-border/40 space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b pb-2">
              <Timer className="h-3 w-3" />
              Syntax Guide
            </div>
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div className="space-y-1">
                <div className="font-bold text-primary">*</div>
                <div className="text-muted-foreground">Any value</div>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary">,</div>
                <div className="text-muted-foreground">Value list</div>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary">-</div>
                <div className="text-muted-foreground">Range</div>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary">/</div>
                <div className="text-muted-foreground">Step values</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
