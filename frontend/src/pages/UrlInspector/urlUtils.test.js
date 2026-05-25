import { describe, expect, it } from 'vitest';
import { buildUrl, parseUrlInput, sortQueryRows } from './urlUtils';

describe('urlUtils', () => {
  it('parses URL parts and repeated query params', () => {
    const result = parseUrlInput(
      'https://example.com:8443/api/search?q=hello%20world&q=again&empty=&flag#section'
    );

    expect(result.error).toBeNull();
    expect(result.parts).toMatchObject({
      scheme: 'https',
      host: 'example.com:8443',
      path: '/api/search',
      hash: 'section',
    });
    expect(result.queryRows).toEqual([
      { id: 'q-0', key: 'q', value: 'hello world' },
      { id: 'q-1', key: 'q', value: 'again' },
      { id: 'empty-2', key: 'empty', value: '' },
      { id: 'flag-3', key: 'flag', value: '' },
    ]);
  });

  it('builds a URL with encoded query params and hash', () => {
    const result = buildUrl({
      scheme: 'https',
      host: 'example.com',
      path: '/docs',
      hash: 'top section',
      queryRows: [
        { id: 'a', key: 'q', value: 'hello world' },
        { id: 'b', key: 'redirect', value: 'https://app.test/a?b=1' },
      ],
    });

    expect(result.error).toBeNull();
    expect(result.url).toBe(
      'https://example.com/docs?q=hello+world&redirect=https%3A%2F%2Fapp.test%2Fa%3Fb%3D1#top%20section'
    );
  });

  it('sorts query rows by key then value without mutating the input', () => {
    const rows = [
      { id: '3', key: 'z', value: 'last' },
      { id: '1', key: 'a', value: 'two' },
      { id: '2', key: 'a', value: 'one' },
    ];

    expect(sortQueryRows(rows)).toEqual([
      { id: '2', key: 'a', value: 'one' },
      { id: '1', key: 'a', value: 'two' },
      { id: '3', key: 'z', value: 'last' },
    ]);
    expect(rows[0].id).toBe('3');
  });

  it('returns a validation error for invalid URLs', () => {
    const result = parseUrlInput('not a url');

    expect(result.parts).toBeNull();
    expect(result.queryRows).toEqual([]);
    expect(result.error).toContain('Enter an absolute URL');
  });
});
