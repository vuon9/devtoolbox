// Converter configuration constants
// Separated from index.jsx to avoid Fast Refresh issues

export const CONVERTER_MAP = {
    'Encrypt - Decrypt': [
        'AES', 'AES-GCM', 'DES', 'Triple DES', 'Rabbit', 'RC4', 'RC4Drop',
        'ChaCha20', 'Salsa20', 'Blowfish', 'Twofish', 'RSA',
        'Fernet', 'BIP38', 'XOR'
    ],
    'Encode - Decode': [
        'Base16 (Hex)', 'Base32', 'Base58', 'Base64', 'Base64URL',
        'Base85', 'URL', 'HTML Entities', 'Binary', 'Morse Code',
        'Punnycode', 'JWT Decode', 'Bencoded', 'Protobuf',
        'ROT13', 'ROT47', 'Quoted-Printable'
    ],
    'Escape': [
        'String Literal', 'Unicode/Hex', 'HTML/XML', 'URL', 'Regex'
    ],
    'Convert': [
        'JSON ↔ YAML', 'JSON ↔ XML', 'JSON ↔ CSV / TSV', 'YAML ↔ TOML',
        'Markdown ↔ HTML', 'Unix Timestamp ↔ ISO 8601', 'Color Codes',
        'Number Bases', 'Case Swapping', 'SQL Insert ↔ JSON Array',
        'CURL Command ↔ Fetch', 'Cron Expression ↔ Text',
        'CSV ↔ TSV', 'Key-Value ↔ Query String',
        'Properties ↔ JSON', 'INI ↔ JSON'
    ],
    'Hash': [
        'All',
        'MD5', 'SHA-1', 'SHA-224', 'SHA-256', 'SHA-384', 'SHA-512',
        'SHA-3 (Keccak)', 'BLAKE2b', 'BLAKE3', 'RIPEMD-160',
        'bcrypt', 'scrypt', 'Argon2', 'HMAC', 'CRC32', 'Adler-32',
        'MurmurHash3', 'xxHash', 'FNV-1a'
    ],
};
