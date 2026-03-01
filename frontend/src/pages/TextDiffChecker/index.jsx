import React, { useState, useEffect } from 'react';
import { Grid, Column, Checkbox } from '@carbon/react';
import { Compare } from '@carbon/icons-react';
import { ToolHeader, ToolPane, ToolSplitPane } from '../../components/ToolUI';
import useLayoutToggle from '../../hooks/useLayoutToggle';
import DiffView from './components/DiffView';
import DiffModeToggle from './components/DiffModeToggle';
import { computeDiffResult } from './diffUtils';

export default function TextDiffChecker() {
  const [oldText, setOldText] = useState('');
  const [newText, setNewText] = useState('');
  const [diffs, setDiffs] = useState([]);
  const [algorithm, setAlgorithm] = useState('lines');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  const layout = useLayoutToggle({
    toolKey: 'text-diff-layout',
    defaultDirection: 'horizontal',
    showToggle: true,
    persist: true,
  });

  // Auto-compare when inputs or options change
  useEffect(() => {
    const result = computeDiffResult(oldText, newText, algorithm, ignoreWhitespace);
    setDiffs(result);
  }, [oldText, newText, algorithm, ignoreWhitespace]);

  const granularityIndex = ['lines', 'words', 'chars'].indexOf(algorithm);

  return (
    <Grid
      fullWidth
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}
    >
      <Column>
        <ToolHeader
          title="Text Diff Checker"
          description="Compare two blocks of text to find the differences."
        />
      </Column>

      {/* Controls Row */}
      <Column>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
            padding: '0.75rem',
            backgroundColor: 'var(--cds-layer-01)',
            border: '1px solid var(--cds-border-subtle)',
          }}
        >
          {/* Granularity Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label
              style={{
                fontSize: '0.75rem',
                color: 'var(--cds-text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              Granularity:
            </label>
            <DiffModeToggle
              activeMode={granularityIndex >= 0 ? granularityIndex : 0}
              onChange={(mode) => {
                const algoMap = ['lines', 'words', 'chars'];
                setAlgorithm(algoMap[mode]);
              }}
            />
          </div>

          {/* Ignore Whitespace Checkbox */}
          <Checkbox
            labelText="Ignore whitespace"
            id="ignore-whitespace"
            checked={ignoreWhitespace}
            onChange={(_, { checked }) => setIgnoreWhitespace(checked)}
          />
        </div>
      </Column>

      {/* Inputs Row */}
      <Column lg={16} md={8} sm={4}>
        <div style={{ minHeight: '300px' }}>
          <ToolSplitPane columnCount={layout.direction === 'horizontal' ? 2 : 1}>
            <ToolPane
              label="Original Text"
              value={oldText}
              onChange={(e) => setOldText(e.target.value)}
              placeholder="Paste original text..."
            />
            <ToolPane
              label="New Text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Paste new text..."
            />
          </ToolSplitPane>
        </div>
        <div style={{ height: '100%' }}>
          <DiffView diffs={diffs} />
        </div>
      </Column>
    </Grid>
  );
}
