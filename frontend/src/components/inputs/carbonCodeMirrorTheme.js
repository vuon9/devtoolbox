import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

/**
 * Neon color palette for syntax highlighting
 * Vibrant, high-contrast colors optimized for dark backgrounds
 */
const neonColors = {
  // Core neon colors
  keyword: '#00F0FF', // Electric Cyan
  string: '#7EE787', // Neon Green
  number: '#FFA726', // Bright Orange
  function: '#F472B6', // Hot Magenta
  variable: '#E2E8F0', // Soft White
  tag: '#FFCA28', // Bright Yellow
  attribute: '#82AAFF', // Light Blue
  property: '#64B5F6', // Sky Blue
  operator: '#C792EA', // Purple
  punctuation: '#89DDFF', // Light Cyan
  bool: '#FFD54F', // Golden Yellow
  null: '#FF8A65', // Coral
  class: '#4DB6AC', // Teal
  constant: '#A78BFA', // Lavender
  comment: '#6B7280', // Muted Gray

  // SQL-specific categorized colors
  sqlDdl: '#FF6B9D', // Hot Pink - CREATE, DROP, ALTER
  sqlDml: '#00F0FF', // Electric Cyan - SELECT, INSERT
  sqlConditional: '#B388FF', // Electric Purple - WHERE, AND, OR
  sqlJoin: '#FFAB40', // Bright Orange - JOIN, INNER, LEFT
  sqlAggregate: '#69F0AE', // Bright Mint - COUNT, SUM, AVG
  sqlOrdering: '#FFD740', // Golden Yellow - ORDER BY, GROUP BY
};

/**
 * Carbon-compatible dark theme with neon syntax highlighting
 */
export const carbonDarkTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--cds-field)',
    color: 'var(--cds-text-primary)',
    fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
    fontSize: '0.875rem',
    lineHeight: '1.5',
    height: '100%',
  },
  '.cm-scroller': {
    overflow: 'auto',
    height: '100%',
  },
  '.cm-editor': {
    height: '100%',
  },
  '.cm-content': {
    caretColor: 'var(--cds-focus)',
    padding: '0.75rem',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--cds-focus)',
    borderLeftWidth: '2px',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: 'var(--cds-focus)',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'var(--cds-highlight)',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'var(--cds-layer-selected)',
  },
  '.cm-line': {
    padding: '0 4px',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--cds-layer)',
    color: 'var(--cds-text-secondary)',
    borderRight: '1px solid var(--cds-border-subtle)',
    fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
    fontSize: '0.75rem',
  },
  '.cm-gutterElement': {
    padding: '0 8px',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--cds-layer-hover)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--cds-layer-hover)',
    color: 'var(--cds-text-primary)',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'var(--cds-highlight)',
    outline: '1px solid var(--cds-focus)',
  },
  '.cm-nonmatchingBracket': {
    backgroundColor: 'var(--cds-support-error)',
    color: 'var(--cds-text-on-color)',
  },
  '.cm-tooltip': {
    backgroundColor: 'var(--cds-layer)',
    border: '1px solid var(--cds-border-subtle)',
    borderRadius: '2px',
    color: 'var(--cds-text-primary)',
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li[aria-selected]': {
      backgroundColor: 'var(--cds-highlight)',
      color: 'var(--cds-text-primary)',
    },
  },

  // SQL-specific token classes
  '.cm-sql-ddl': { color: neonColors.sqlDdl, fontWeight: '600' },
  '.cm-sql-dml': { color: neonColors.sqlDml, fontWeight: '600' },
  '.cm-sql-conditional': { color: neonColors.sqlConditional, fontWeight: '600' },
  '.cm-sql-join': { color: neonColors.sqlJoin, fontWeight: '600' },
  '.cm-sql-aggregate': { color: neonColors.sqlAggregate, fontWeight: '600' },
  '.cm-sql-ordering': { color: neonColors.sqlOrdering, fontWeight: '600' },
});

/**
 * Base syntax highlighting for all languages
 */
export const baseHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: neonColors.keyword, fontWeight: '600' },
  { tag: tags.controlKeyword, color: neonColors.keyword, fontWeight: '600' },
  { tag: tags.definitionKeyword, color: neonColors.keyword, fontWeight: '600' },
  { tag: tags.modifier, color: neonColors.keyword, fontWeight: '600' },

  { tag: tags.string, color: neonColors.string },
  { tag: tags.character, color: neonColors.string },
  { tag: tags.special(tags.string), color: neonColors.string },

  { tag: tags.number, color: neonColors.number },
  { tag: tags.float, color: neonColors.number },
  { tag: tags.integer, color: neonColors.number },

  { tag: tags.comment, color: neonColors.comment, fontStyle: 'italic' },
  { tag: tags.lineComment, color: neonColors.comment, fontStyle: 'italic' },
  { tag: tags.blockComment, color: neonColors.comment, fontStyle: 'italic' },

  { tag: tags.variableName, color: neonColors.variable },
  { tag: tags.propertyName, color: neonColors.property },
  { tag: tags.attributeName, color: neonColors.attribute },
  { tag: tags.className, color: neonColors.class },
  { tag: tags.typeName, color: neonColors.class },
  { tag: tags.tagName, color: neonColors.tag },

  { tag: tags.function(tags.variableName), color: neonColors.function },
  { tag: tags.function(tags.propertyName), color: neonColors.function },

  { tag: tags.operator, color: neonColors.operator },
  { tag: tags.compareOperator, color: neonColors.operator },
  { tag: tags.logicOperator, color: neonColors.operator },
  { tag: tags.arithmeticOperator, color: neonColors.operator },

  { tag: tags.punctuation, color: neonColors.punctuation },
  { tag: tags.separator, color: neonColors.punctuation },
  { tag: tags.squareBracket, color: neonColors.punctuation },
  { tag: tags.brace, color: neonColors.punctuation },
  { tag: tags.paren, color: neonColors.punctuation },

  { tag: tags.bool, color: neonColors.bool },
  { tag: tags.null, color: neonColors.null },
  { tag: tags.self, color: neonColors.bool },

  { tag: tags.regexp, color: neonColors.null },
  { tag: tags.escape, color: neonColors.null },
  { tag: tags.special(tags.string), color: neonColors.null },

  { tag: tags.meta, color: neonColors.comment },
  { tag: tags.processingInstruction, color: neonColors.comment },

  { tag: tags.url, color: neonColors.keyword, textDecoration: 'underline' },
  { tag: tags.link, color: neonColors.keyword, textDecoration: 'underline' },

  { tag: tags.constant, color: neonColors.constant },
]);

/**
 * Combined extension: theme + syntax highlighting
 */
export const carbonCodeMirrorExtension = [carbonDarkTheme, syntaxHighlighting(baseHighlightStyle)];

/**
 * SQL keyword categories for custom highlighting
 */
export const sqlKeywordCategories = {
  ddl: new Set([
    'CREATE',
    'DROP',
    'ALTER',
    'TABLE',
    'DATABASE',
    'INDEX',
    'VIEW',
    'TRIGGER',
    'SCHEMA',
    'SEQUENCE',
  ]),
  dml: new Set(['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'UPSERT', 'MERGE', 'REPLACE']),
  conditional: new Set([
    'WHERE',
    'AND',
    'OR',
    'NOT',
    'IN',
    'EXISTS',
    'BETWEEN',
    'LIKE',
    'IS',
    'NULL',
    'CASE',
    'WHEN',
    'THEN',
    'ELSE',
    'END',
  ]),
  join: new Set([
    'JOIN',
    'INNER',
    'LEFT',
    'RIGHT',
    'FULL',
    'CROSS',
    'OUTER',
    'ON',
    'USING',
    'NATURAL',
  ]),
  aggregate: new Set([
    'COUNT',
    'SUM',
    'AVG',
    'MAX',
    'MIN',
    'GROUP_CONCAT',
    'STRING_AGG',
    'ARRAY_AGG',
    'DISTINCT',
    'ALL',
  ]),
  ordering: new Set([
    'ORDER',
    'BY',
    'GROUP',
    'HAVING',
    'LIMIT',
    'OFFSET',
    'TOP',
    'FETCH',
    'FIRST',
    'ROWS',
  ]),
};

export default carbonCodeMirrorExtension;
