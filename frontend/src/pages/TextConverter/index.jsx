import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ToolHeader, ToolPane, ToolSplitPane, ToolControls } from '../../components/ToolUI';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Play, Plus, Columns, Layout } from 'lucide-react';
import ConversionControls from './components/ConversionControls';
import ConfigurationPane from './components/ConfigurationPane';
import MultiHashOutput from './components/MultiHashOutput';
import CommonTags from './components/CommonTags';
import ImageOutput, { isBase64Image } from './components/ImageOutput';
import { CONVERTER_MAP } from './constants';
import {
  TOOL_TITLE,
  TOOL_DESCRIPTION,
  STORAGE_KEYS,
  DEFAULTS,
  DEFAULT_COMMON_TAGS,
  LABELS,
  PLACEHOLDERS,
  LAYOUT,
} from './strings';
import { Convert } from '../../generated/wails/conversionService';
import { cn } from '../../utils/cn';

export default function TextBasedConverter() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get preset from URL params
  const urlCategory = searchParams.get('category');
  const urlMethod = searchParams.get('method');

  // Validate and use URL params or fall back to localStorage defaults
  const validCategories = Object.keys(CONVERTER_MAP);
  const initialCategory = validCategories.includes(urlCategory)
    ? urlCategory
    : localStorage.getItem(STORAGE_KEYS.CATEGORY) || DEFAULTS.CATEGORY;

  const validMethods = CONVERTER_MAP[initialCategory] || [];
  const initialMethod = validMethods.includes(urlMethod)
    ? urlMethod
    : localStorage.getItem(STORAGE_KEYS.METHOD) || DEFAULTS.METHOD;

  // Persistent state initialization
  const [category, setCategory] = useState(initialCategory);
  const [method, setMethod] = useState(initialMethod);
  const [subMode, setSubMode] = useState(
    () => localStorage.getItem(STORAGE_KEYS.SUBMODE) || DEFAULTS.SUBMODE
  );

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isVertical, setIsVertical] = useState(() => localStorage.getItem('text-converter-layout') === 'vertical');

  // Custom tags state with localStorage persistence
  const [customTags, setCustomTags] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_TAGS)) || [];
    } catch {
      return [];
    }
  });

  // Config state
  const [config, setConfig] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG)) || DEFAULTS.CONFIG;
    } catch {
      return DEFAULTS.CONFIG;
    }
  });

  useEffect(() => {
    localStorage.setItem('text-converter-layout', isVertical ? 'vertical' : 'horizontal');
  }, [isVertical]);

  // Check if showing all hashes
  const isAllHashes = category === 'Hash' && method === 'All';

  // Submode default logic
  useEffect(() => {
    if (category === 'Encrypt - Decrypt' && !['Encrypt', 'Decrypt'].includes(subMode)) {
      setSubMode('Encrypt');
    } else if (category === 'Encode - Decode' && !['Encode', 'Decode'].includes(subMode)) {
      setSubMode('Encode');
    } else if (category === 'Escape' && !['Escape', 'Unescape'].includes(subMode)) {
      setSubMode('Escape');
    } else if (category === 'Hash' || category === 'Convert') {
      setSubMode('');
    }
  }, [category]);

  // Persistence effects
  useEffect(() => localStorage.setItem(STORAGE_KEYS.CATEGORY, category), [category]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.METHOD, method), [method]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.SUBMODE, subMode), [subMode]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config)), [config]);
  useEffect(
    () => localStorage.setItem(STORAGE_KEYS.CUSTOM_TAGS, JSON.stringify(customTags)),
    [customTags]
  );

  const isCurrentInQuickActions = useCallback(() => {
    const isInDefault = DEFAULT_COMMON_TAGS.some(
      (tag) => tag.category === category && tag.method === method
    );
    const isInCustom = customTags.some((tag) => tag.category === category && tag.method === method);
    return isInDefault || isInCustom;
  }, [category, method, customTags]);

  const addCurrentToQuickActions = useCallback(() => {
    if (isCurrentInQuickActions()) return;

    const newTag = {
      id: `${category}-${method}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      category,
      method,
      label: `${category} - ${method}`,
    };

    setCustomTags((prev) => [...prev, newTag]);
  }, [category, method, isCurrentInQuickActions]);

  const performConversion = useCallback(async (text, cat, meth, sub, cfg) => {
    if (!text && cat !== 'Hash') {
      setOutput('');
      setError('');
      return;
    }

    if (!text && cat === 'Hash' && meth === 'All') {
      setOutput('');
      setError('');
      return;
    }

    if (text && text.trim().startsWith('data:image/')) {
      setOutput(text.trim());
      setError('');
      return;
    }

    try {
      const backendConfig = { ...cfg, subMode: sub };
      const result = await Convert(text, cat, meth, backendConfig);
      setOutput(result);
      setError('');
    } catch (err) {
      setError(err.message);
      if (err.message.includes('error') || err.message.includes('invalid')) {
        setOutput('');
      }
    }
  }, []);

  useEffect(() => {
    if (config.autoRun) {
      performConversion(input, category, method, subMode, config);
    }
  }, [input, category, method, subMode, config.autoRun, performConversion]);

  const handleConvert = () => {
    performConversion(input, category, method, subMode, config);
  };

  const updateConfig = (newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }));

  const showConfig = category === 'Encrypt - Decrypt' || method === 'HMAC';
  const isImageOutput = !isAllHashes && isBase64Image(output);

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden">
      <ToolHeader title={TOOL_TITLE} description={TOOL_DESCRIPTION} />

      <CommonTags
        currentCategory={category}
        currentMethod={method}
        onTagSelect={(cat, meth) => {
          setCategory(cat);
          setMethod(meth);
        }}
        customTags={customTags}
      />

      <ToolControls className="justify-between">
        <ConversionControls
          category={category}
          setCategory={(c) => {
            setCategory(c);
            setMethod(CONVERTER_MAP[c][0]);
          }}
          method={method}
          setMethod={setMethod}
          subMode={subMode}
          setSubMode={setSubMode}
        />

        <div className="flex items-center gap-4 border-l pl-4 ml-auto">
          <Button
            onClick={handleConvert}
            disabled={config.autoRun}
            size="sm"
            className="h-8 gap-2 font-bold uppercase tracking-wider text-[10px]"
          >
            <Play className="h-3 w-3 fill-current" />
            Convert
          </Button>

          <Button
            variant="ghost"
            size="sm"
            disabled={isCurrentInQuickActions()}
            onClick={addCurrentToQuickActions}
            className="h-8 gap-2 font-bold uppercase tracking-wider text-[10px]"
          >
            <Plus className="h-3.5 w-3.5" />
            Added
          </Button>

          <div className="flex items-center gap-2">
            <Switch
              id="auto-run"
              checked={config.autoRun}
              onCheckedChange={(val) => updateConfig({ autoRun: val })}
            />
            <Label htmlFor="auto-run" className="text-[10px] font-bold uppercase tracking-wider opacity-70">Auto-run</Label>
          </div>

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

      {showConfig && (
        <div className="mb-4">
          <ConfigurationPane config={config} updateConfig={updateConfig} method={method} />
        </div>
      )}

      <div className="flex-1 min-h-0">
        <ToolSplitPane className={cn(isVertical && "grid-cols-1 md:grid-cols-1")}>
          <ToolPane
            label={LABELS.INPUT(category, subMode, method)}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={PLACEHOLDERS.INPUT}
          />

          {isAllHashes ? (
            <div className="flex flex-col h-full min-h-0 border rounded-md bg-muted/5">
              <div className="flex items-center justify-between mb-1.5 px-3 pt-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {LABELS.OUTPUT}
                </label>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <MultiHashOutput value={output} error={error} />
              </div>
            </div>
          ) : isImageOutput ? (
            <ImageOutput value={output} />
          ) : (
            <ToolPane
              label={LABELS.OUTPUT}
              value={output}
              readOnly
              placeholder={PLACEHOLDERS.OUTPUT}
              className={error ? "border-destructive/50" : ""}
            />
          )}
        </ToolSplitPane>
      </div>
    </div>
  );
}
