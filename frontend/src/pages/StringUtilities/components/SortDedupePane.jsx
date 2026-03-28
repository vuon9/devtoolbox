import React from 'react';
import { Button } from '../../../components/ui/Button';

export default function SortDedupePane({ onSort, onDedupe }) {
  const [options, setOptions] = React.useState({
    sort: true,
    dedupe: true,
    reverse: false,
    trim: true,
    ignoreEmpty: true,
  });

  const handleToggle = (key) => {
    const newOptions = { ...options, [key]: !options[key] };
    setOptions(newOptions);
    onSort(newOptions);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      <Button size="sm" active={options.sort} onClick={() => handleToggle('sort')}>
        Sort
      </Button>
      <Button size="sm" active={options.dedupe} onClick={() => handleToggle('dedupe')}>
        Deduplicate
      </Button>
      <Button size="sm" active={options.reverse} onClick={() => handleToggle('reverse')}>
        Reverse
      </Button>
      <Button size="sm" active={options.trim} onClick={() => handleToggle('trim')}>
        Trim Lines
      </Button>
      <Button size="sm" active={options.ignoreEmpty} onClick={() => handleToggle('ignoreEmpty')}>
        Remove Empty
      </Button>
    </div>
  );
}
