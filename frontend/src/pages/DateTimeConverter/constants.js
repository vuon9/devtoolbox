import { Time, Sun, Moon, Sunrise, SendToBack, Calendar } from '@carbon/icons-react';

// Helper for presets
const toSQLFormat = (d) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const OUTPUT_FORMATS = [
  { id: 'iso', label: 'ISO 8601' },
  { id: 'rfc2822', label: 'RFC 2822' },
  { id: 'sql', label: 'SQL DateTime' },
  { id: 'us', label: 'US Format' },
  { id: 'eu', label: 'EU Format' },
  { id: 'compact', label: 'Compact' },
];

export const PRESETS = [
  { id: 'now', label: 'Now', getValue: () => toSQLFormat(new Date()), icon: Time },
  {
    id: 'startofday',
    label: 'Start of Day',
    getValue: () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return toSQLFormat(d);
    },
    icon: Sun,
  },
  {
    id: 'endofday',
    label: 'End of Day',
    getValue: () => {
      const d = new Date();
      d.setHours(23, 59, 59, 0);
      return toSQLFormat(d);
    },
    icon: Moon,
  },
  {
    id: 'tomorrow',
    label: 'Tomorrow',
    getValue: () => toSQLFormat(new Date(Date.now() + 86400000)),
    icon: Sunrise,
  },
  {
    id: 'yesterday',
    label: 'Yesterday',
    getValue: () => toSQLFormat(new Date(Date.now() - 86400000)),
    icon: SendToBack,
  },
  {
    id: 'nextweek',
    label: 'Next Week',
    getValue: () => toSQLFormat(new Date(Date.now() + 604800000)),
    icon: Calendar,
  },
];

export const STORAGE_KEY = 'datetime-converter.timezones';
