import React, { useState, useEffect } from 'react';
import { ToolHeader, ToolPane, ToolSplitPane, ToolControls } from '../../components/ToolUI';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Binary, Hash, Layout, Columns, Copy, Check, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function NumberConverter() {
  const [input, setInput] = useState('42');
  const [base, setBase] = useState(10);
  const [results, setResults] = useState({
    bin: '',
    oct: '',
    dec: '',
    hex: '',
    base64: '',
  });

  const convert = (val = input, currentBase = base) => {
    try {
      const num = parseInt(val, currentBase);
      if (isNaN(num)) return;

      setResults({
        bin: num.toString(2),
        oct: num.toString(8),
        dec: num.toString(10),
        hex: num.toString(16).toUpperCase(),
        base64: btoa(num.toString(10)),
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    convert();
  }, [input, base]);

  const bases = [
    { id: 'bin', label: 'Binary (Base 2)', value: 2, icon: Binary },
    { id: 'oct', label: 'Octal (Base 8)', value: 8, icon: Hash },
    { id: 'dec', label: 'Decimal (Base 10)', value: 10, icon: Hash },
    { id: 'hex', label: 'Hex (Base 16)', value: 16, icon: Binary },
  ];

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden bg-background">
      <ToolHeader
        title="Number Converter"
        description="Seamlessly convert numbers between binary, octal, decimal, and hexadecimal bases. View bitwise representation and cross-base values instantly."
      />

      <ToolControls className="mb-6">
        <div className="flex gap-1 bg-muted/30 p-1 rounded-lg border border-border/40">
          {bases.map((b) => (
            <button
              key={b.id}
              onClick={() => setBase(b.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all',
                base === b.value
                  ? 'bg-background text-primary shadow-sm ring-1 ring-border/50'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <b.icon className="h-3.5 w-3.5" />
              {b.label}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInput('')}
          className="h-8 gap-2 font-bold uppercase tracking-wider text-[10px] ml-auto text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </Button>
      </ToolControls>

      <div className="flex-1 min-h-0 space-y-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ToolPane
            label={`Input (Base ${base})`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter value..."
            className="flex-1"
          />

          <div className="grid grid-cols-1 gap-4">
            <BaseCard label="Binary" value={results.bin} base={2} />
            <BaseCard label="Decimal" value={results.dec} base={10} />
            <BaseCard label="Hexadecimal" value={results.hex} base={16} />
          </div>
        </div>

        {/* Bit Grid */}
        <div className="p-4 rounded-lg bg-muted/20 border border-border/40 space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b pb-2">
            Bit Representation (Binary 32-bit)
          </div>
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 md:gap-2">
            {results.bin
              .padStart(32, '0')
              .split('')
              .map((bit, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-8 flex items-center justify-center rounded border font-mono text-xs transition-colors',
                    bit === '1'
                      ? 'bg-primary/20 border-primary/40 text-primary font-bold shadow-inner'
                      : 'bg-background/40 border-border/20 text-muted-foreground/30'
                  )}
                >
                  {bit}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BaseCard({ label, value, base }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="p-4 rounded-lg bg-muted/30 border border-border/40 group hover:border-primary/30 transition-all cursor-pointer"
      onClick={handleCopy}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          {label}
        </span>
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        )}
      </div>
      <div className="text-xl font-mono font-bold text-foreground truncate select-all">
        {value || '0'}
      </div>
    </div>
  );
}
