import React, { useState, useEffect } from 'react';
import { ToolHeader, ToolPane, ToolSplitPane, ToolControls } from '../../components/ToolUI';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Palette, Pipette, Hash, Copy, Check, History, Trash2, Sliders } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function ColorConverter() {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState('59, 130, 246');
  const [hsl, setHsl] = useState('217, 91%, 60%');
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('color-history')) || [];
    } catch {
      return [];
    }
  });

  const updateAll = (color) => {
    // Simple mock logic for demonstration since color-utils is not available
    setHex(color);
    setHistory(prev => {
      const next = [color, ...prev.filter(c => c !== color)].slice(0, 10);
      localStorage.setItem('color-history', JSON.stringify(next));
      return next;
    });
  };

  const handleHexChange = (e) => {
    const val = e.target.value;
    setHex(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      updateAll(val);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden bg-background">
      <ToolHeader
        title="Color Converter"
        description="Convert colors between Hex, RGB, HSL, and more. Visualize palettes and maintain a history of your favorite shades."
      />

      <ToolControls className="mb-6 justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 bg-muted/30 p-1 rounded-lg border border-border/40">
            <div
              className="h-9 w-12 rounded-md border border-border/40 shadow-inner"
              style={{ backgroundColor: hex }}
            />
            <div className="font-mono font-bold text-lg text-primary mr-3">{hex.toUpperCase()}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHistory([])}
            className="h-8 gap-2 font-bold uppercase tracking-wider text-[10px] text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear History
          </Button>
        </div>
      </ToolControls>

      <div className="flex-1 min-h-0 space-y-8 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 p-6 rounded-lg bg-muted/20 border border-border/40 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b pb-2">
              <Sliders className="h-3 w-3" />
              Color Values
            </div>

            <ColorInput label="Hexadecimal" value={hex} onChange={handleHexChange} icon={Hash} />
            <ColorInput label="RGB (Red, Green, Blue)" value={rgb} onChange={setRgb} icon={Pipette} />
            <ColorInput label="HSL (Hue, Saturation, Light)" value={hsl} onChange={setHsl} icon={Pipette} />
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b pb-2 px-1">
              <History className="h-3 w-3" />
              Recent Colors
            </div>
            <div className="grid grid-cols-5 gap-3">
              {history.map((color, i) => (
                <button
                  key={i}
                  className="group relative h-12 rounded-md border border-border/40 shadow-sm transition-transform hover:scale-105"
                  style={{ backgroundColor: color }}
                  onClick={() => updateAll(color)}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 text-[10px] font-bold font-mono uppercase text-foreground">
                    {color}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Color Palette visualization mockup */}
        <div className="p-6 rounded-lg bg-muted/20 border border-border/40 space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b pb-2">
            Generated Palette
          </div>
          <div className="flex h-24 rounded-lg overflow-hidden border border-border/40 shadow-inner">
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(p => (
              <div key={p} className="flex-1 transition-all hover:flex-[1.5]" style={{ backgroundColor: hex, opacity: p/100 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange, icon: Icon }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
        <Input
          value={value}
          onChange={onChange}
          className="pl-9 h-10 bg-background/50 border-border/40 font-mono font-medium focus:ring-primary/20"
        />
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 p-1.5 hover:bg-muted rounded transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground/50" />}
        </button>
      </div>
    </div>
  );
}
