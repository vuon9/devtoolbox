import React, { useState, useEffect } from 'react';
import { ToolHeader, ToolPane, ToolSplitPane, ToolControls } from '../../components/ToolUI';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Play, Copy, Check, Braces, Code2, Code, Brackets } from 'lucide-react';
import { Format } from '../../generated/wails/codeFormatterService';
import { cn } from '../../utils/cn';

const languages = [
  { id: 'json', label: 'JSON', icon: Braces },
  { id: 'html', label: 'HTML', icon: Code2 },
  { id: 'css', label: 'CSS', icon: Code },
  { id: 'xml', label: 'XML', icon: Code2 },
  { id: 'sql', label: 'SQL', icon: Brackets },
  { id: 'javascript', label: 'JavaScript', icon: Code },
  { id: 'java', label: 'Java', icon: Code },
];

export default function CodeFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState(
    () => localStorage.getItem('code-formatter-lang') || 'json'
  );
  const [error, setError] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);

  useEffect(() => {
    localStorage.setItem('code-formatter-lang', language);
  }, [language]);

  const handleFormat = async () => {
    if (!input.trim()) return;
    setIsFormatting(true);
    setError('');
    try {
      // Assuming Format expects a request object
      const result = await Format({ content: input, language: language });
      setOutput(result);
    } catch (err) {
      setError(err.message || 'Formatting failed. Please check your code syntax.');
      console.error(err);
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden bg-background">
      <ToolHeader
        title="Code Formatter"
        description="Clean up and prettify your source code. Supports multiple languages with intelligent indentation and formatting rules."
      />

      <ToolControls className="justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Label
              htmlFor="language-select"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70"
            >
              Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger
                id="language-select"
                className="w-[180px] h-9 bg-background/50 border-border/40"
              >
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    <div className="flex items-center gap-2">
                      <lang.icon className="h-4 w-4 text-primary" />
                      <span>{lang.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleFormat}
            disabled={isFormatting || !input.trim()}
            size="sm"
            className="h-9 gap-2 font-bold uppercase tracking-wider text-[10px] px-6"
          >
            <Play className={cn('h-3.5 w-3.5 fill-current', isFormatting && 'animate-pulse')} />
            {isFormatting ? 'Formatting...' : 'Format Code'}
          </Button>
        </div>
      </ToolControls>

      <div className="flex-1 min-h-0">
        <ToolSplitPane>
          <div className="flex flex-col h-full">
            <ToolPane
              label="Input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Paste your raw ${language.toUpperCase()} here...`}
              className="flex-1"
            />
          </div>

          <div className="flex flex-col h-full">
            <ToolPane
              label="Formatted Output"
              value={output}
              readOnly
              placeholder="Result will appear here..."
              className={cn('flex-1', error && 'border-destructive/30 ring-destructive/20')}
            />
            {error && (
              <div className="mt-2 p-2 px-3 rounded bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-medium leading-relaxed">
                {error}
              </div>
            )}
          </div>
        </ToolSplitPane>
      </div>
    </div>
  );
}
