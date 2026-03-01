import { ViewPlugin, Decoration } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/rangeset';
import { sqlKeywordCategories } from './carbonCodeMirrorTheme';

/**
 * Create a view plugin that categorizes SQL keywords and applies CSS classes
 */
export function createSQLKeywordHighlighter() {
  return ViewPlugin.fromClass(
    class {
      decorations;

      constructor(view) {
        this.decorations = this.categorizeSQLKeywords(view);
      }

      update(update) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.categorizeSQLKeywords(update.view);
        }
      }

      categorizeSQLKeywords(view) {
        const builder = new RangeSetBuilder(Decoration);
        const doc = view.state.doc;

        // Simple regex-based keyword detection
        const keywordRegex =
          /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|WHERE|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|CASE|WHEN|THEN|ELSE|END|JOIN|INNER|LEFT|RIGHT|FULL|CROSS|OUTER|ON|USING|NATURAL|COUNT|SUM|AVG|MAX|MIN|GROUP_CONCAT|DISTINCT|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|TOP|FETCH|FIRST|ROWS|TABLE|DATABASE|INDEX|VIEW|TRIGGER|SCHEMA|SEQUENCE|UPSERT|MERGE|REPLACE|ALL|STRING_AGG|ARRAY_AGG)\b/gi;

        for (let lineNum = 1; lineNum <= doc.lines; lineNum++) {
          const line = doc.line(lineNum);
          let match;

          while ((match = keywordRegex.exec(line.text)) !== null) {
            const keyword = match[0].toUpperCase();
            const category = this.getKeywordCategory(keyword);

            if (category) {
              const from = line.from + match.index;
              const to = from + match[0].length;

              builder.add(
                from,
                to,
                Decoration.mark({
                  class: `cm-sql-${category}`,
                })
              );
            }
          }
        }

        return builder.finish();
      }

      getKeywordCategory(keyword) {
        if (sqlKeywordCategories.ddl.has(keyword)) return 'ddl';
        if (sqlKeywordCategories.dml.has(keyword)) return 'dml';
        if (sqlKeywordCategories.conditional.has(keyword)) return 'conditional';
        if (sqlKeywordCategories.join.has(keyword)) return 'join';
        if (sqlKeywordCategories.aggregate.has(keyword)) return 'aggregate';
        if (sqlKeywordCategories.ordering.has(keyword)) return 'ordering';
        return null;
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}
