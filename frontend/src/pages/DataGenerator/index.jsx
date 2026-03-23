import React, { useState, useEffect } from 'react';
import { ToolHeader, ToolPane, ToolSplitPane, ToolControls } from '../../components/ToolUI';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  LayoutDashboard,
  Play,
  FileJson,
  FileCode,
  FileType,
  Columns,
  Layout,
  Trash2,
  Plus,
} from 'lucide-react';
import { Generate } from '../../generated/wails/dataGeneratorService';
import { cn } from '../../utils/cn';

const formats = [
  { id: 'json', label: 'JSON', icon: FileJson },
  { id: 'csv', label: 'CSV', icon: FileType },
  { id: 'sql', label: 'SQL', icon: FileCode },
];

export default function DataGenerator() {
  const [format, setFormat] = useState('json');
  const [count, setCount] = useState(10);
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVertical, setIsVertical] = useState(
    () => localStorage.getItem('datagen-layout') === 'vertical'
  );

  useEffect(() => {
    localStorage.setItem('datagen-layout', isVertical ? 'vertical' : 'horizontal');
  }, [isVertical]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await Generate(format, count);
      setOutput(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden bg-background">
      <ToolHeader
        title="Data Generator"
        description="Generate mock data for testing and development. Create realistic datasets in JSON, CSV, or SQL formats with customizable schemas."
      />

      <ToolControls className="mb-6 justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Label
              htmlFor="format-select"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70"
            >
              Format
            </Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger
                id="format-select"
                className="w-[140px] h-9 bg-background/50 border-border/40"
              >
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                {formats.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    <div className="flex items-center gap-2">
                      <f.icon className="h-4 w-4 text-primary" />
                      <span>{f.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Label
              htmlFor="count-input"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70"
            >
              Count
            </Label>
            <Input
              id="count-input"
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-24 h-9 bg-background/50 border-border/40"
              min="1"
              max="1000"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            size="sm"
            className="h-9 gap-2 font-bold uppercase tracking-wider text-[10px] px-6"
          >
            <Play className={cn('h-3.5 w-3.5 fill-current', isGenerating && 'animate-pulse')} />
            {isGenerating ? 'Generating...' : 'Generate Data'}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setIsVertical(!isVertical)}
          >
            {isVertical ? (
              <Columns className="h-4 w-4 rotate-90" />
            ) : (
              <Columns className="h-4 w-4" />
            )}
          </Button>
        </div>
      </ToolControls>

      <div className="flex-1 min-h-0">
        <ToolSplitPane className={cn(isVertical && 'grid-cols-1 md:grid-cols-1')}>
          {/* Schema definition mockup */}
          <div className="flex flex-col h-full border rounded-md bg-muted/5 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b bg-muted/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Schema Definition
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Field
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <SchemaField label="id" type="UUID" />
              <SchemaField label="name" type="Full Name" />
              <SchemaField label="email" type="Email Address" />
              <SchemaField label="active" type="Boolean" />
              <SchemaField label="created_at" type="Date (ISO)" />
            </div>
          </div>

          <div className="flex flex-col h-full">
            <ToolPane
              label="Generated Output"
              value={output}
              readOnly
              placeholder="Result will appear here..."
              className="flex-1"
            />
          </div>
        </ToolSplitPane>
      </div>
    </div>
  );
}

function SchemaField({ label, type }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded border border-border/40 bg-background/50 group hover:border-primary/20 transition-all">
      <Input
        value={label}
        readOnly
        className="h-8 text-xs font-mono bg-transparent border-none focus:ring-0 w-24"
      />
      <div className="flex-1 text-[11px] font-medium text-muted-foreground px-2 italic">{type}</div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
