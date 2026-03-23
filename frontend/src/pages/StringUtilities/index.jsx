import React, { useState, useEffect } from 'react';
import { ToolHeader, ToolPane, ToolSplitPane, ToolControls } from '../../components/ToolUI';
import { Button } from '../../components/ui/button';
import { cn } from '../../utils/cn';
import {
  Type,
  Hash,
  ListOrdered,
  AlignLeft,
  Trash2,
  ArrowDownAz,
  Undo2,
  Trash
} from 'lucide-react';
import CaseConverterPane from './components/CaseConverterPane';
import SortDedupePane from './components/SortDedupePane';
import InspectorPane from './components/InspectorPane';
import ModeTabBar from './components/ModeTabBar';
import {
  convertCase,
  sortLines,
  removeDuplicates,
  getTextStats,
  trimLines,
  removeEmptyLines
} from './strings';

export default function StringUtilities() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeMode, setActiveMode] = useState(() => localStorage.getItem('string-utils-mode') || 'case');

  useEffect(() => {
    localStorage.setItem('string-utils-mode', activeMode);
  }, [activeMode]);

  const handleCaseChange = (type) => {
    setOutput(convertCase(input, type));
  };

  const handleSort = (options) => {
    setOutput(sortLines(input, options));
  };

  const handleDedupe = () => {
    setOutput(removeDuplicates(input));
  };

  const handleTrim = () => {
    setOutput(trimLines(input));
  };

  const handleRemoveEmpty = () => {
    setOutput(removeEmptyLines(input));
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
  };

  const stats = getTextStats(activeMode === 'inspector' ? input : output || input);

  const modes = [
    { id: 'case', label: 'Case Converter', icon: Type },
    { id: 'sort', label: 'Sort & Dedupe', icon: ListOrdered },
    { id: 'inspector', label: 'Text Inspector', icon: Hash },
  ];

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden bg-background">
      <ToolHeader
        title="String Utilities"
        description="All-in-one text processing toolkit. Convert between cases, sort lines, remove duplicates, and inspect text properties."
      />

      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <ModeTabBar
          modes={modes}
          activeMode={activeMode}
          onModeChange={setActiveMode}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTrim}
            className="h-8 gap-2 font-bold uppercase tracking-wider text-[10px]"
          >
            <AlignLeft className="h-3.5 w-3.5" />
            Trim Lines
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveEmpty}
            className="h-8 gap-2 font-bold uppercase tracking-wider text-[10px]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Empty
          </Button>
          <div className="w-px h-4 bg-border mx-2" />
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
        {activeMode === 'inspector' ? (
          <InspectorPane input={input} setInput={setInput} stats={stats} />
        ) : (
          <ToolSplitPane>
            <div className="flex flex-col h-full space-y-4">
              <ToolPane
                label="Input Text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste or type text here..."
                className="flex-1"
              />
              <div className="p-4 rounded-lg bg-muted/20 border border-border/40">
                {activeMode === 'case' ? (
                  <CaseConverterPane onConvert={handleCaseChange} />
                ) : (
                  <SortDedupePane onSort={handleSort} onDedupe={handleDedupe} />
                )}
              </div>
            </div>

            <div className="flex flex-col h-full space-y-4">
              <ToolPane
                label="Result"
                value={output}
                readOnly
                placeholder="Transformed text will appear here..."
                className="flex-1"
              />
              <div className="p-4 rounded-lg bg-muted/20 border border-border/40 flex justify-around text-center">
                <StatItem label="Lines" value={stats.lines} />
                <StatItem label="Words" value={stats.words} />
                <StatItem label="Chars" value={stats.chars} />
              </div>
            </div>
          </ToolSplitPane>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{label}</div>
      <div className="text-lg font-mono font-semibold text-primary">{value}</div>
    </div>
  );
}
