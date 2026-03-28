// Wrapper for ConversionService that handles both Wails and browser mode
// In Wails desktop, uses the actual backend. In browser, provides mock responses.

import { Convert as WailsConvert } from '../generated/wails/conversionService';

// Check if we're running in Wails desktop mode
const isWailsDesktop = typeof window !== 'undefined' && 
  (window as any).go?.devtoolbox?.service?.WindowControls;

// Mock implementations for browser mode (development)
const mockConvert = async (input: string, category: string, method: string, config: any): Promise<string> => {
  console.log('Browser mode: Mock Convert called with', { input, category, method, config });
  
  // Hash category
  if (category === 'Hash') {
    if (method === 'All') {
      return JSON.stringify({
        'MD5': 'd41d8cd98f00b204e9800998ecf8427e',
        'SHA-1': 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
        'SHA-256': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        'SHA-384': '38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b',
        'SHA-512': 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e'
      });
    }
    // Simple hash mock
    let hash = '';
    for (let i = 0; i < input.length; i++) {
      hash += input.charCodeAt(i).toString(16);
    }
    return hash.padEnd(32, '0').slice(0, 32);
  }
  
  // Encode - Decode
  if (category === 'Encode - Decode') {
    const mode = config?.subMode || 'Encode';
    if (method === 'Base64') {
      if (mode === 'Encode') {
        return btoa(unescape(encodeURIComponent(input)));
      }
      try {
        return decodeURIComponent(escape(atob(input)));
      } catch {
        return 'Error: Invalid Base64 input';
      }
    }
    if (method === 'URL') {
      if (mode === 'Encode') {
        return encodeURIComponent(input);
      }
      return decodeURIComponent(input);
    }
    if (method === 'HTML') {
      if (mode === 'Encode') {
        return input
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }
      const textarea = { innerHTML: '' } as any;
      textarea.innerHTML = input;
      return textarea.innerHTML;
    }
    // Default encode/decode mock
    return input;
  }
  
  // Encrypt - Decrypt
  if (category === 'Encrypt - Decrypt') {
    // Mock encryption - just reverse the string for demo
    if (config?.subMode === 'Encrypt') {
      return input.split('').reverse().join('');
    }
    return input.split('').reverse().join('');
  }
  
  // Escape - Unescape
  if (category === 'Escape') {
    const mode = config?.subMode || 'Escape';
    if (mode === 'Escape') {
      return JSON.stringify(input).slice(1, -1);
    }
    try {
      return JSON.parse(`"${input}"`);
    } catch {
      return input;
    }
  }
  
  // Convert category
  if (category === 'Convert') {
    return input;
  }
  
  // Default: return input unchanged
  return input;
};

export async function Convert(input: string, category: string, method: string, config: any): Promise<any> {
  if (isWailsDesktop) {
    // Use Wails runtime when available
    return WailsConvert(input, category, method, config);
  }
  
  // Fallback for browser mode
  return mockConvert(input, category, method, config);
}