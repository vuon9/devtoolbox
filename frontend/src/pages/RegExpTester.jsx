import React, { useState, useEffect } from 'react';
import { ToolHeader, ToolPane, ToolSplitPane, ToolControls } from '../components/ToolUI';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Regex, Play, Info, Check, Copy, Trash2, Sliders, Columns, Layout } from 'lucide-react';
import { cn } from '../utils/cn';

export default function RegExpTester() {
  const [regex, setRegex] = useState('(\\w+)\\s(\\w+)');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('John Doe, Jane Smith, Alan Turing');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [isVertical, setIsVertical] = useState(
    () => localStorage.getItem('regex-layout') === 'vertical'
  );

  useEffect(() => {
    localStorage.setItem('regex-layout', isVertical ? 'vertical' : 'horizontal');
  }, [isVertical]);

  const testRegex = (r = regex, f = flags, t = text) => {
    if (!r) {
      setMatches([]);
      setError('');
      return;
    }
    try {
      const re = new RegExp(r, f);
      const m = Array.from(t.matchAll(re));
      setMatches(m);
      setError('');
    } catch (e) {
      setError(e.toString());
      setMatches([]);
    }
  };

  useEffect(() => {
    testRegex();
  }, [regex, flags, text]);

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden bg-background">
      <ToolHeader
        title="RegExp Tester"
        description="Write and debug regular expressions with real-time feedback. Visualize matches, groups, and capture properties instantly."
      />

      <ToolControls className="mb-6 justify-between items-end gap-6">
        <div className="flex-1 max-w-xl flex items-end gap-4">
          <div className="flex-1">
            <Label
              htmlFor="regex-input"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1.5 ml-1"
            >
              Pattern
            </Label>
            <div className="relative group">
              <span className="absolute left-3 top-2.5 h-4 w-4 text-primary font-bold opacity-40 font-mono">
                /
              </span>
              <Input
                id="regex-input"
                value={regex}
                onChange={(e) => setRegex(e.target.value)}
                placeholder="[a-z]+"
                className="pl-8 h-10 bg-background/50 border-border/40 font-mono text-base font-bold tracking-wide text-primary shadow-sm focus:ring-primary/20"
              />
              <span className="absolute right-3 top-2.5 h-4 w-4 text-primary font-bold opacity-40 font-mono">
                /
              </span>
            </div>
          </div>
          <div className="w-24">
            <Label
              htmlFor="flags-input"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1.5 ml-1"
            >
              Flags
            </Label>
            <Input
              id="flags-input"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="g"
              className="h-10 bg-background/50 border-border/40 font-mono font-bold tracking-widest text-primary shadow-sm focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setIsVertical(!isVertical)}
          >
            {isVertical ? (
              <Columns className="h-5 w-5 rotate-90" />
            ) : (
              <Columns className="h-5 w-5" />
            )}
          </Button>
        </div>
      </ToolControls>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm italic font-mono shadow-inner">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0">
        <ToolSplitPane className={cn(isVertical && 'grid-cols-1 md:grid-cols-1')}>
          <div className="flex flex-col h-full space-y-4">
            <ToolPane
              label="Test String"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to match against..."
              className="flex-1"
            />
          </div>

          <div className="flex flex-col h-full space-y-4 overflow-hidden">
            <div className="p-6 rounded-lg bg-muted/20 border border-border/40 flex-1 flex flex-col min-h-0 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                  <Regex className="h-3 w-3" />
                  Matches ({matches.length})
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  Copy All
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 font-mono">
                {matches.map((match, i) => (
                  <div
                    key={i}
                    className="p-3 rounded border border-border/40 bg-background/50 group hover:border-primary/30 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">
                        Match {i + 1}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground/30">
                        Index: {match.index}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {match[0]}
                    </div>
                    {match.length > 1 && (
                      <div className="mt-3 grid grid-cols-1 gap-1 border-t border-border/20 pt-2">
                        {Array.from(match)
                          .slice(1)
                          .map((group, j) => (
                            <div key={j} className="text-[11px] flex gap-2 overflow-hidden">
                              <span className="text-muted-foreground/30">Group {j + 1}:</span>
                              <span className="text-foreground/80 truncate font-medium">
                                {group || 'null'}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
                {matches.length === 0 && !error && (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 gap-4">
                    <Sliders className="h-12 w-12" />
                    <div className="text-xs font-bold uppercase tracking-widest">
                      No matches found
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ToolSplitPane>
      </div>
    </div>
  );
}
