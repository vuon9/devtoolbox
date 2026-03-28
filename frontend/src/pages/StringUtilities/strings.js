export const TOOL_TITLE = 'String Utilities';
export const TOOL_DESCRIPTION = 'Sort, dedupe, convert cases, and analyze text strings.';

export const STORAGE_KEYS = {
  ACTIVE_TAB: 'string-utilities-active-tab',
  INPUT: 'string-utilities-input',
};

export const DEFAULTS = {
  ACTIVE_TAB: 0,
};

export const LABELS = {
  INPUT: 'Input',
  OUTPUT: 'Output',
};

export const convertCase = (input, type) => {
  if (!input) return '';
  switch (type) {
    case 'upper':
      return input.toUpperCase();
    case 'lower':
      return input.toLowerCase();
    case 'sentence':
      return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
    case 'camel':
      return input
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+/g, '');
    case 'pascal':
      return input.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, '');
    case 'snake':
      return input
        .replace(/\d+/g, ' ')
        .replace(/[a-z][A-Z]/g, (str) => str[0] + ' ' + str[1])
        .toLowerCase()
        .replace(/\s+/g, '_');
    case 'kebab':
      return input
        .replace(/\d+/g, ' ')
        .replace(/[a-z][A-Z]/g, (str) => str[0] + ' ' + str[1])
        .toLowerCase()
        .replace(/\s+/g, '-');
    default:
      return input;
  }
};

export const sortLines = (input, options = {}) => {
  if (!input) return '';
  const lines = input.split('\n');
  lines.sort((a, b) => {
    if (options.caseInsensitive) {
      a = a.toLowerCase();
      b = b.toLowerCase();
    }
    if (a < b) return options.reverse ? 1 : -1;
    if (a > b) return options.reverse ? -1 : 1;
    return 0;
  });
  return lines.join('\n');
};

export const removeDuplicates = (input) => {
  if (!input) return '';
  const lines = input.split('\n');
  return [...new Set(lines)].join('\n');
};

export const trimLines = (input) => {
  if (!input) return '';
  return input
    .split('\n')
    .map((line) => line.trim())
    .join('\n');
};

export const removeEmptyLines = (input) => {
  if (!input) return '';
  return input
    .split('\n')
    .filter((line) => line.trim() !== '')
    .join('\n');
};

export const getTextStats = (input) => {
  if (!input) return { lines: 0, words: 0, chars: 0, bytes: 0, sentences: 0 };
  
  const chars = input.length;
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;
  const lines = input ? input.split('\n').length : 0;
  const bytes = new Blob([input]).size;
  const sentences = input.trim() ? input.split(/[.!?]+/).filter((x) => x.trim()).length : 0;
  
  return { lines, words, chars, bytes, sentences };
};
