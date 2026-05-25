const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+.-]*:\/\//i;

function rowId(key, index) {
  const safeKey = key.trim().replace(/[^a-z0-9_-]+/gi, '-') || 'param';
  return `${safeKey}-${index}`;
}

export function parseUrlInput(input) {
  const rawInput = input.trim();

  if (!rawInput) {
    return { parts: null, queryRows: [], error: null };
  }

  if (!ABSOLUTE_URL_PATTERN.test(rawInput)) {
    return {
      parts: null,
      queryRows: [],
      error: 'Enter an absolute URL with a scheme, for example https://example.com.',
    };
  }

  try {
    const parsedUrl = new URL(rawInput);
    const queryRows = Array.from(parsedUrl.searchParams.entries()).map(([key, value], index) => ({
      id: rowId(key, index),
      key,
      value,
    }));

    return {
      parts: {
        scheme: parsedUrl.protocol.replace(':', ''),
        host: parsedUrl.host,
        path: parsedUrl.pathname,
        hash: parsedUrl.hash ? decodeURIComponent(parsedUrl.hash.slice(1)) : '',
      },
      queryRows,
      error: null,
    };
  } catch {
    return {
      parts: null,
      queryRows: [],
      error: 'Enter a valid absolute URL.',
    };
  }
}

export function buildUrl({ scheme, host, path, hash, queryRows }) {
  const cleanScheme = scheme.trim().replace(/:$/, '');
  const cleanHost = host.trim();

  if (!cleanScheme || !cleanHost) {
    return { url: '', error: 'Scheme and host are required.' };
  }

  try {
    const builtUrl = new URL(`${cleanScheme}://${cleanHost}`);
    builtUrl.pathname = path?.startsWith('/') ? path : `/${path || ''}`;

    const params = new URLSearchParams();
    queryRows.filter((row) => row.key.trim()).forEach((row) => params.append(row.key, row.value));
    builtUrl.search = params.toString();
    builtUrl.hash = hash || '';

    return { url: builtUrl.toString(), error: null };
  } catch {
    return { url: '', error: 'URL parts could not be combined into a valid URL.' };
  }
}

export function sortQueryRows(rows) {
  return [...rows].sort((left, right) => {
    const keyCompare = left.key.localeCompare(right.key);
    if (keyCompare !== 0) return keyCompare;
    return left.value.localeCompare(right.value);
  });
}
