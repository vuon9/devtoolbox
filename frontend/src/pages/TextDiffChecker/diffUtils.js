import * as Diff from 'diff';

export const computeDiffResult = (oldText, newText, algorithm, ignoreWhitespace) => {
  if (!oldText && !newText) {
    return [];
  }

  const options = {};

  if (ignoreWhitespace && (algorithm === 'lines' || algorithm === 'words')) {
    options.ignoreWhitespace = true;
  }

  switch (algorithm) {
    case 'lines':
      return Diff.diffLines(oldText, newText, { ...options, newlineIsToken: true });
    case 'words':
      return Diff.diffWords(oldText, newText, options);
    case 'wordsWithSpace':
      return Diff.diffWordsWithSpace(oldText, newText);
    case 'chars':
      return Diff.diffChars(oldText, newText);
    case 'sentences':
      return Diff.diffSentences(oldText, newText);
    case 'json':
      try {
        const oldObj = oldText ? JSON.parse(oldText) : {};
        const newObj = newText ? JSON.parse(newText) : {};
        return Diff.diffJson(oldObj, newObj);
      } catch {
        return Diff.diffLines(oldText, newText, { newlineIsToken: true });
      }
    default:
      return Diff.diffLines(oldText, newText, { newlineIsToken: true });
  }
};
