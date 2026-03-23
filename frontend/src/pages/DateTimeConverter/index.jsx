import React, { useState, useEffect } from 'react';
import { ToolHeader, ToolPane, ToolSplitPane, ToolControls } from '../../components/ToolUI';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Play, Copy, Clock, Calendar, Globe, History, Layout, Columns } from 'lucide-react';
import { Convert } from '../../generated/wails/dateTimeService';
import { cn } from '../../utils/cn';

export default function DateTimeConverter() {
  const [input, setInput] = useState(() => Date.now().toString());
  const [results, setResults] = useState(null);
  const [isVertical, setIsVertical] = useState(() => localStorage.getItem('datetime-layout') === 'vertical');

  useEffect(() => {
    localStorage.setItem('datetime-layout', isVertical ? 'vertical' : 'horizontal');
  }, [isVertical]);

  const handleConvert = async (val = input) => {
    try {
      const res = await Convert(val);
      setResults(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleConvert();
  }, []);

  const handleQuickPreset = (preset) => {
    let newVal = '';
    const now = new Date();

    if (preset === 'now') newVal = Date.now().toString();
    else if (preset === 'today') {
      now.setHours(0, 0, 0, 0);
      newVal = now.toISOString();
    }
    else if (preset === 'tomorrow') {
      now.setDate(now.getDate() + 1);
      now.setHours(0, 0, 0, 0);
      newVal = now.toISOString();
    }

    setInput(newVal);
    handleConvert(newVal);
  };

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden bg-background">
      <ToolHeader
        title="DateTime Converter"
        description="Convert between Unix timestamps, ISO 8601, and various human-readable formats. Easily navigate time across timezones."
      />

      <ToolControls className="justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleQuickPreset('now')} className="h-8 text-[10px] font-bold uppercase tracking-wider">Now</Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickPreset('today')} className="h-8 text-[10px] font-bold uppercase tracking-wider">Today 00:00</Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickPreset('tomorrow')} className="h-8 text-[10px] font-bold uppercase tracking-wider">Tomorrow 00:00</Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsVertical(!isVertical)}
          >
            {isVertical ? <Columns className="h-4 w-4 rotate-90" /> : <Columns className="h-4 w-4" />}
          </Button>
        </div>
      </ToolControls>

      <div className="flex-1 min-h-0">
        <ToolSplitPane className={cn(isVertical && "grid-cols-1 md:grid-cols-1")}>
          <div className="flex flex-col h-full">
            <ToolPane
              label="Input (Timestamp or ISO String)"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleConvert(e.target.value);
              }}
              placeholder="1711123456 or 2024-03-23T12:00:00Z"
              className="flex-1"
            />
          </div>

          <div className="flex flex-col h-full overflow-y-auto border rounded-md bg-muted/5 p-4 space-y-4">
            {results ? (
              <>
                <ResultGroup icon={Clock} label="Unix Timestamps">
                  <ResultRow label="Seconds" value={results.unix_seconds} />
                  <ResultRow label="Milliseconds" value={results.unix_milliseconds} />
                  <ResultRow label="Microseconds" value={results.unix_microseconds} />
                </ResultGroup>

                <ResultGroup icon={Globe} label="ISO 8601 / UTC">
                  <ResultRow label="UTC Date" value={results.utc_iso} />
                  <ResultRow label="UTC RFC3339" value={results.utc_rfc3339} />
                </ResultGroup>

                <ResultGroup icon={Calendar} label="Local Time">
                  <ResultRow label="Local Date" value={results.local_readable} />
                  <ResultRow label="Relative" value={results.relative_time} />
                </ResultGroup>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm">
                Enter a valid date or timestamp...
              </div>
            )}
          </div>
        </ToolSplitPane>
      </div>
    </div>
  );
}

function ResultGroup({ icon: Icon, label, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 border-b pb-1 px-1">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

function ResultRow({ label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between group hover:bg-muted/30 p-1.5 rounded-sm transition-colors cursor-pointer" onClick={handleCopy}>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <code className="text-[13px] font-mono text-primary font-medium">{value}</code>
        <div className={cn("opacity-0 group-hover:opacity-100 transition-opacity", copied && "opacity-100")}>
          <Copy className={cn("h-3 w-3", copied && "text-green-500")} />
        </div>
      </div>
    </div>
  );
}
