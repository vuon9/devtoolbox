import React, { useState, useEffect } from 'react';
import { ToolHeader, ToolPane, ToolSplitPane, ToolControls } from '../components/ToolUI';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  ScanBarcode,
  Play,
  Download,
  Settings,
  QrCode,
  Hash,
  Columns,
  Layout,
  Trash2,
} from 'lucide-react';
import { GenerateBarcode } from '../generated/wails/barcodeService';
import { cn } from '../utils/cn';

const types = [
  { id: 'qr', label: 'QR Code', icon: QrCode },
  { id: 'code128', label: 'Code 128', icon: ScanBarcode },
  { id: 'ean13', label: 'EAN-13', icon: Hash },
];

export default function BarcodeGenerator() {
  const [input, setInput] = useState('https://github.com/wailsapp/wails');
  const [type, setType] = useState('qr');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVertical, setIsVertical] = useState(
    () => localStorage.getItem('barcode-layout') === 'vertical'
  );

  useEffect(() => {
    localStorage.setItem('barcode-layout', isVertical ? 'vertical' : 'horizontal');
  }, [isVertical]);

  const handleGenerate = async () => {
    if (!input) return;
    setIsGenerating(true);
    try {
      // Assuming it expects an object matching BarcodeRequest in backend
      const res = await GenerateBarcode({ content: input, standard: type });
      setOutput(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (input) handleGenerate();
  }, [input, type]);

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden bg-background">
      <ToolHeader
        title="Barcode / QR Code"
        description="Generate high-quality QR codes and barcodes for various standards. Customize appearance and download directly as SVG or PNG."
      />

      <ToolControls className="mb-6 justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Label
              htmlFor="type-select"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70"
            >
              Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger
                id="type-select"
                className="w-[160px] h-9 bg-background/50 border-border/40"
              >
                <SelectValue placeholder="Code Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <t.icon className="h-4 w-4 text-primary" />
                      <span>{t.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInput('')}
            className="h-8 gap-2 font-bold uppercase tracking-wider text-[10px] text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
          <div className="w-px h-4 bg-border mx-2" />
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
          <div className="flex flex-col h-full">
            <ToolPane
              label="Input Content"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text or URL to encode..."
              className="flex-1"
            />
          </div>

          <div className="flex flex-col h-full items-center justify-center border rounded-lg bg-muted/5 relative group p-12">
            <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b pb-1 pr-3">
              Preview
            </div>

            <div className="bg-card p-8 rounded-xl shadow-2xl transition-transform group-hover:scale-[1.02] border-4 border-primary/20">
              {output ? (
                <div dangerouslySetInnerHTML={{ __html: output }} className="h-64 w-64" />
              ) : (
                <div className="h-64 w-64 flex flex-col items-center justify-center text-muted-foreground gap-4 bg-muted/10 rounded-lg">
                  <QrCode className="h-16 w-16 opacity-10 animate-pulse" />
                  <span className="text-xs font-medium uppercase tracking-widest opacity-30">
                    Generating...
                  </span>
                </div>
              )}
            </div>

            <div className="absolute bottom-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                className="h-8 gap-2 font-bold uppercase tracking-wider text-[10px] shadow-lg"
              >
                <Download className="h-3.5 w-3.5" />
                Download SVG
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 font-bold uppercase tracking-wider text-[10px] bg-background/80 backdrop-blur-sm"
              >
                <Download className="h-3.5 w-3.5" />
                Download PNG
              </Button>
            </div>
          </div>
        </ToolSplitPane>
      </div>
    </div>
  );
}
