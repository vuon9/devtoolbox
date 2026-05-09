import { tags as t } from '@lezer/highlight';

export const SCOPE_TO_TAG = {
  keyword:          t.keyword,
  string:           t.string,
  number:           t.number,
  comment:          t.blockComment,
  type:             t.typeName,
  function:         t.function(t.variableName),
  variable:         t.variableName,
  operator:         t.operator,
  punctuation:      t.punctuation,
  tag:              t.tagName,
  attribute:        t.attributeName,
  property:         t.propertyName,
  constant:         t.constant(t.variableName),
  bool:             t.bool,
  'null':           t.null,
  class:            t.className,
  'definition':     t.definitionModifier,
};
