package converter

import (
	"encoding/base32"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html"
	"math"
	"net/url"
	"strconv"
	"strings"

	"github.com/btcsuite/btcutil/base58"
	"golang.org/x/net/idna"
)

type encodingConverter struct{}

func NewEncodingConverter() ConverterService {
	return &encodingConverter{}
}

func (c *encodingConverter) Convert(req ConversionRequest) (string, error) {
	subMode := "encode"
	if val, ok := req.Config["subMode"].(string); ok {
		subMode = val
	}
	isEncode := strings.ToLower(subMode) != "decode"
	method := strings.ToLower(req.Method)

	switch {
	case strings.Contains(method, "base64"):
		if isEncode {
			if method == "base64url" {
				return base64.URLEncoding.EncodeToString([]byte(req.Input)), nil
			}
			return base64.StdEncoding.EncodeToString([]byte(req.Input)), nil
		}
		var decoded []byte
		var err error
		if method == "base64url" {
			decoded, err = base64.URLEncoding.DecodeString(req.Input)
		} else {
			decoded, err = base64.StdEncoding.DecodeString(req.Input)
		}
		if err != nil {
			return "", err
		}
		return string(decoded), nil

	case strings.Contains(method, "base58"):
		if isEncode {
			return base58.Encode([]byte(req.Input)), nil
		}
		return string(base58.Decode(req.Input)), nil

	case strings.Contains(method, "hex") || method == "base16":
		if isEncode {
			return hex.EncodeToString([]byte(req.Input)), nil
		}
		decoded, err := hex.DecodeString(req.Input)
		if err != nil {
			return "", err
		}
		return string(decoded), nil

	case strings.Contains(method, "base32"):
		if isEncode {
			return base32.StdEncoding.EncodeToString([]byte(req.Input)), nil
		}
		decoded, err := base32.StdEncoding.DecodeString(req.Input)
		if err != nil {
			return "", err
		}
		return string(decoded), nil

	case method == "url":
		if isEncode {
			return url.QueryEscape(req.Input), nil
		}
		return url.QueryUnescape(req.Input)

	case strings.Contains(method, "html"):
		if isEncode {
			return html.EscapeString(req.Input), nil
		}
		return html.UnescapeString(req.Input), nil

	case method == "morse code":
		if isEncode {
			return textToMorse(req.Input), nil
		}
		return morseToText(req.Input), nil

	case method == "jwt decode":
		// JWT decode is only for decoding
		parts := strings.Split(req.Input, ".")
		if len(parts) != 3 {
			return "", fmt.Errorf("invalid JWT format")
		}
		header, _ := base64.RawURLEncoding.DecodeString(parts[0])
		payload, _ := base64.RawURLEncoding.DecodeString(parts[1])

		var h, p interface{}
		json.Unmarshal(header, &h)
		json.Unmarshal(payload, &p)

		res := map[string]interface{}{
			"header":  h,
			"payload": p,
		}
		out, _ := json.MarshalIndent(res, "", "  ")
		return string(out), nil

	case method == "binary":
		if isEncode {
			var res []string
			for _, b := range []byte(req.Input) {
				res = append(res, fmt.Sprintf("%08b", b))
			}
			return strings.Join(res, " "), nil
		}
		parts := strings.Fields(req.Input)
		var res []byte
		for _, p := range parts {
			b, err := strconv.ParseUint(p, 2, 8)
			if err != nil {
				return "", err
			}
			res = append(res, byte(b))
		}
		return string(res), nil

	case method == "rot13":
		// ROT13 is symmetric - encode and decode are the same
		return rot13(req.Input), nil

	case method == "rot47":
		// ROT47 is also symmetric
		return rot47(req.Input), nil

	case strings.Contains(method, "quoted-printable"):
		if isEncode {
			return encodeQuotedPrintable(req.Input), nil
		}
		return decodeQuotedPrintable(req.Input)

	case strings.Contains(method, "punycode"):
		return convertPunycode(req.Input, isEncode)

	case strings.Contains(method, "base85"):
		return convertBase85(req.Input, isEncode)

	case strings.Contains(method, "bencode"):
		return convertBencode(req.Input, isEncode)

	case strings.Contains(method, "protobuf"):
		return convertProtobuf(req.Input, isEncode)
	}

	return "", fmt.Errorf("encoding method %s not supported", req.Method)
}

// ROT13 implementation
func rot13(input string) string {
	var result strings.Builder
	for _, r := range input {
		switch {
		case r >= 'a' && r <= 'z':
			result.WriteRune('a' + (r-'a'+13)%26)
		case r >= 'A' && r <= 'Z':
			result.WriteRune('A' + (r-'A'+13)%26)
		default:
			result.WriteRune(r)
		}
	}
	return result.String()
}

// ROT47 implementation - shifts characters in the range 33-126
func rot47(input string) string {
	var result strings.Builder
	for _, r := range input {
		if r >= 33 && r <= 126 {
			result.WriteRune(33 + (r-33+47)%94)
		} else {
			result.WriteRune(r)
		}
	}
	return result.String()
}

// Quoted-Printable encoding
func encodeQuotedPrintable(input string) string {
	var result strings.Builder
	lineLength := 0
	for i := 0; i < len(input); i++ {
		b := input[i]
		// Characters that can be represented as-is
		if (b >= 33 && b <= 60) || (b >= 62 && b <= 126) {
			if lineLength >= 75 {
				result.WriteString("=\n")
				lineLength = 0
			}
			result.WriteByte(b)
			lineLength++
		} else if b == ' ' || b == '\t' {
			// Check if space/tab is at end of line
			if i+1 < len(input) && (input[i+1] == '\n' || input[i+1] == '\r') {
				if lineLength+3 > 75 {
					result.WriteString("=\n")
					lineLength = 0
				}
				result.WriteString(fmt.Sprintf("=%02X", b))
				lineLength += 3
			} else {
				if lineLength >= 75 {
					result.WriteString("=\n")
					lineLength = 0
				}
				result.WriteByte(b)
				lineLength++
			}
		} else {
			// Encode other characters
			if lineLength+3 > 75 {
				result.WriteString("=\n")
				lineLength = 0
			}
			result.WriteString(fmt.Sprintf("=%02X", b))
			lineLength += 3
		}
	}
	return result.String()
}

// Quoted-Printable decoding
func decodeQuotedPrintable(input string) (string, error) {
	var result strings.Builder
	for i := 0; i < len(input); i++ {
		if input[i] == '=' {
			if i+1 < len(input) {
				// Check for soft line break
				if input[i+1] == '\n' || input[i+1] == '\r' {
					// Soft line break - skip the = and newline
					if i+2 < len(input) && input[i+1] == '\r' && input[i+2] == '\n' {
						i += 2
					} else {
						i++
					}
					continue
				}
				// Decode hex value
				if i+2 < len(input) {
					hexVal := input[i+1 : i+3]
					val, err := strconv.ParseInt(hexVal, 16, 8)
					if err != nil {
						return "", fmt.Errorf("invalid quoted-printable sequence at position %d", i)
					}
					result.WriteByte(byte(val))
					i += 2
				} else {
					return "", fmt.Errorf("incomplete quoted-printable sequence at position %d", i)
				}
			} else {
				return "", fmt.Errorf("invalid quoted-printable sequence at position %d", i)
			}
		} else {
			result.WriteByte(input[i])
		}
	}
	return result.String(), nil
}

// Reuse Morse logic from previous implementation
func textToMorse(input string) string {
	input = strings.ToUpper(input)
	var res []string
	for _, r := range input {
		if m, ok := textToMorseMap[r]; ok {
			res = append(res, m)
		}
	}
	return strings.Join(res, " ")
}

func morseToText(input string) string {
	morseToTextMap := make(map[string]rune)
	for r, m := range textToMorseMap {
		morseToTextMap[m] = r
	}
	parts := strings.Split(input, " ")
	var res []rune
	for _, p := range parts {
		if r, ok := morseToTextMap[p]; ok {
			res = append(res, r)
		}
	}
	return string(res)
}

var textToMorseMap = map[rune]string{
	'A': ".-", 'B': "-...", 'C': "-.-.", 'D': "-..", 'E': ".", 'F': "..-.", 'G': "--.", 'H': "....",
	'I': "..", 'J': ".---", 'K': "-.-", 'L': ".-..", 'M': "--", 'N': "-.", 'O': "---", 'P': ".--.",
	'Q': "--.-", 'R': ".-.", 'S': "...", 'T': "-", 'U': "..-", 'V': "...-", 'W': ".--", 'X': "-..-",
	'Y': "-.--", 'Z': "--..", '1': ".----", '2': "..---", '3': "...--", '4': "....-", '5': ".....",
	'6': "-....", '7': "--...", '8': "---..", '9': "----.", '0': "-----", ' ': "/",
}

// Punycode conversion using golang.org/x/net/idna
func convertPunycode(input string, isEncode bool) (string, error) {
	if isEncode {
		// Encode Unicode domain to Punycode (ACE)
		encoded, err := idna.ToASCII(input)
		if err != nil {
			return "", fmt.Errorf("punycode encoding error: %w", err)
		}
		return encoded, nil
	}
	// Decode Punycode (ACE) to Unicode
	decoded, err := idna.ToUnicode(input)
	if err != nil {
		return "", fmt.Errorf("punycode decoding error: %w", err)
	}
	return decoded, nil
}

// Base85 encoding/decoding - supports both Adobe ASCII85 and Z85 variants
func convertBase85(input string, isEncode bool) (string, error) {
	// Default to ASCII85, could be extended to detect variant
	variant := "ascii85" // or "z85"

	if isEncode {
		if variant == "z85" {
			return encodeZ85([]byte(input)), nil
		}
		return encodeASCII85([]byte(input)), nil
	}

	if variant == "z85" {
		return decodeZ85(input)
	}
	return decodeASCII85(input)
}

// Adobe ASCII85 encoding
func encodeASCII85(data []byte) string {
	var result strings.Builder
	result.WriteString("<~") // Adobe ASCII85 start marker

	if len(data) == 0 {
		result.WriteString("~>") // Adobe ASCII85 end marker
		return result.String()
	}

	// Process 4 bytes at a time
	for i := 0; i < len(data); i += 4 {
		// Get up to 4 bytes
		var chunk [4]byte
		n := 0
		for j := 0; j < 4 && i+j < len(data); j++ {
			chunk[j] = data[i+j]
			n++
		}

		// Convert to 32-bit integer
		var val uint32
		for j := 0; j < 4; j++ {
			val = val<<8 | uint32(chunk[j])
		}

		// Special case: all zeros = 'z'
		if n == 4 && val == 0 {
			result.WriteByte('z')
		} else {
			// Encode 5 ASCII85 characters
			chars := [5]byte{}
			for j := 4; j >= 0; j-- {
				chars[j] = byte(val%85) + 33
				val /= 85
			}
			// Write all 5 characters for full groups, n+1 for partial
			charsToWrite := 5
			if n < 4 {
				// For partial groups, write n+1 chars
				charsToWrite = n + 1
			}
			for j := 0; j < charsToWrite; j++ {
				result.WriteByte(chars[j])
			}
		}
	}

	result.WriteString("~>") // Adobe ASCII85 end marker
	return result.String()
}

// Adobe ASCII85 decoding
func decodeASCII85(input string) (string, error) {
	input = strings.TrimSpace(input)

	// Remove Adobe markers if present
	input = strings.TrimPrefix(input, "<~")
	input = strings.TrimSuffix(input, "~>")
	input = strings.TrimSpace(input)

	var result strings.Builder

	i := 0
	for i < len(input) {
		if input[i] == 'z' {
			// 'z' represents 4 zero bytes
			result.WriteString("\x00\x00\x00\x00")
			i++
			continue
		}

		// Read up to 5 characters
		var chars [5]byte
		n := 0
		for j := 0; j < 5 && i < len(input); j++ {
			c := input[i]
			if c < 33 || c > 117 {
				return "", fmt.Errorf("invalid ASCII85 character: %c", c)
			}
			chars[j] = c - 33
			n++
			i++
		}

		if n < 2 {
			return "", fmt.Errorf("incomplete ASCII85 sequence")
		}

		// Pad with 'u' (84) for missing characters in the last group
		// This ensures proper decoding of partial groups
		for j := n; j < 5; j++ {
			chars[j] = 84
		}

		// Convert to 32-bit value
		var val uint32
		for j := 0; j < 5; j++ {
			val = val*85 + uint32(chars[j])
		}

		// Write decoded bytes
		bytesToWrite := n - 1
		for j := 3; j >= 4-bytesToWrite; j-- {
			result.WriteByte(byte(val >> (j * 8)))
		}
	}

	return result.String(), nil
}

// Z85 encoding (ZeroMQ variant)
var z85Encoder = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#"

func encodeZ85(data []byte) string {
	// Z85 requires input to be multiple of 4
	if len(data)%4 != 0 {
		// Pad with zeros
		padding := 4 - (len(data) % 4)
		data = append(data, make([]byte, padding)...)
	}

	var result strings.Builder

	for i := 0; i < len(data); i += 4 {
		val := uint32(data[i])<<24 | uint32(data[i+1])<<16 | uint32(data[i+2])<<8 | uint32(data[i+3])

		for j := 0; j < 5; j++ {
			result.WriteByte(z85Encoder[val%85])
			val /= 85
		}
	}

	return result.String()
}

// Z85 decoding
func decodeZ85(input string) (string, error) {
	if len(input)%5 != 0 {
		return "", fmt.Errorf("Z85 input length must be multiple of 5")
	}

	// Build decode map
	decodeMap := make(map[byte]uint32)
	for i, c := range z85Encoder {
		decodeMap[byte(c)] = uint32(i)
	}

	var result strings.Builder

	for i := 0; i < len(input); i += 5 {
		var val uint32
		for j := 4; j >= 0; j-- {
			c := input[i+j]
			v, ok := decodeMap[c]
			if !ok {
				return "", fmt.Errorf("invalid Z85 character: %c", c)
			}
			val = val*85 + v
		}

		result.WriteByte(byte(val >> 24))
		result.WriteByte(byte(val >> 16))
		result.WriteByte(byte(val >> 8))
		result.WriteByte(byte(val))
	}

	return result.String(), nil
}

// Bencode (BitTorrent encoding) conversion
func convertBencode(input string, isEncode bool) (string, error) {
	if isEncode {
		// Try to parse as JSON first, then encode to bencode
		var data interface{}
		if err := json.Unmarshal([]byte(input), &data); err != nil {
			return "", fmt.Errorf("input must be valid JSON for bencode encoding: %w", err)
		}
		return encodeBencode(data)
	}
	// Decode bencode and format as JSON
	data, _, err := decodeBencode(input, 0)
	if err != nil {
		return "", fmt.Errorf("bencode decode error: %w", err)
	}
	result, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to marshal JSON: %w", err)
	}
	return string(result), nil
}

// Encode data to bencode format
func encodeBencode(data interface{}) (string, error) {
	var result strings.Builder

	switch v := data.(type) {
	case string:
		result.WriteString(fmt.Sprintf("%d:%s", len(v), v))
	case float64:
		// JSON numbers are float64, convert to int if it's a whole number
		if v == float64(int64(v)) {
			result.WriteString(fmt.Sprintf("i%de", int64(v)))
		} else {
			return "", fmt.Errorf("bencode does not support floating point numbers")
		}
	case int:
		result.WriteString(fmt.Sprintf("i%de", v))
	case int64:
		result.WriteString(fmt.Sprintf("i%de", v))
	case bool:
		if v {
			result.WriteString("i1e")
		} else {
			result.WriteString("i0e")
		}
	case []interface{}:
		result.WriteString("l")
		for _, item := range v {
			encoded, err := encodeBencode(item)
			if err != nil {
				return "", err
			}
			result.WriteString(encoded)
		}
		result.WriteString("e")
	case map[string]interface{}:
		result.WriteString("d")
		// Keys must be in lexicographical order
		keys := make([]string, 0, len(v))
		for k := range v {
			keys = append(keys, k)
		}
		sortStrings(keys)
		for _, k := range keys {
			result.WriteString(fmt.Sprintf("%d:%s", len(k), k))
			encoded, err := encodeBencode(v[k])
			if err != nil {
				return "", err
			}
			result.WriteString(encoded)
		}
		result.WriteString("e")
	case nil:
		result.WriteString("0:")
	default:
		return "", fmt.Errorf("unsupported type for bencode: %T", data)
	}

	return result.String(), nil
}

// Decode bencode format starting at position i
func decodeBencode(input string, i int) (interface{}, int, error) {
	if i >= len(input) {
		return nil, i, fmt.Errorf("unexpected end of input")
	}

	switch input[i] {
	case 'i':
		// Integer: i<number>e
		j := i + 1
		for j < len(input) && input[j] != 'e' {
			j++
		}
		if j >= len(input) {
			return nil, i, fmt.Errorf("unterminated integer")
		}
		val, err := strconv.ParseInt(input[i+1:j], 10, 64)
		if err != nil {
			return nil, i, fmt.Errorf("invalid integer: %w", err)
		}
		return val, j + 1, nil

	case 'l':
		// List: l<values>e
		var list []interface{}
		j := i + 1
		for j < len(input) && input[j] != 'e' {
			val, newJ, err := decodeBencode(input, j)
			if err != nil {
				return nil, i, err
			}
			list = append(list, val)
			j = newJ
		}
		if j >= len(input) {
			return nil, i, fmt.Errorf("unterminated list")
		}
		return list, j + 1, nil

	case 'd':
		// Dictionary: d<key-value pairs>e
		dict := make(map[string]interface{})
		j := i + 1
		for j < len(input) && input[j] != 'e' {
			// Key must be a string
			key, newJ, err := decodeBencode(input, j)
			if err != nil {
				return nil, i, err
			}
			keyStr, ok := key.(string)
			if !ok {
				return nil, i, fmt.Errorf("dictionary key must be a string")
			}
			j = newJ

			// Value
			val, newJ, err := decodeBencode(input, j)
			if err != nil {
				return nil, i, err
			}
			dict[keyStr] = val
			j = newJ
		}
		if j >= len(input) {
			return nil, i, fmt.Errorf("unterminated dictionary")
		}
		return dict, j + 1, nil

	case '0', '1', '2', '3', '4', '5', '6', '7', '8', '9':
		// String: <length>:<string>
		j := i
		for j < len(input) && input[j] != ':' {
			j++
		}
		if j >= len(input) {
			return nil, i, fmt.Errorf("unterminated string length")
		}
		length, err := strconv.Atoi(input[i:j])
		if err != nil {
			return nil, i, fmt.Errorf("invalid string length: %w", err)
		}
		j++ // skip ':'
		if j+length > len(input) {
			return nil, i, fmt.Errorf("string exceeds input length")
		}
		return input[j : j+length], j + length, nil

	default:
		return nil, i, fmt.Errorf("unknown bencode type: %c", input[i])
	}
}

// Helper function to sort strings
func sortStrings(s []string) {
	for i := 0; i < len(s); i++ {
		for j := i + 1; j < len(s); j++ {
			if s[i] > s[j] {
				s[i], s[j] = s[j], s[i]
			}
		}
	}
}

// Protobuf conversion - provides hex dump view with field tag parsing
func convertProtobuf(input string, isEncode bool) (string, error) {
	if isEncode {
		// For encoding, we expect hex string that we'll parse
		return "", fmt.Errorf("protobuf encoding from text is not supported, use decode for hex dump view")
	}

	// Decode hex input
	data, err := hex.DecodeString(strings.TrimSpace(input))
	if err != nil {
		return "", fmt.Errorf("input must be valid hex string: %w", err)
	}

	return parseProtobufHexDump(data), nil
}

// Parse protobuf binary data into a hex dump with field information
func parseProtobufHexDump(data []byte) string {
	var result strings.Builder

	result.WriteString("Protobuf Hex Dump with Field Analysis:\n")
	result.WriteString("=" + strings.Repeat("=", 50) + "\n\n")

	offset := 0
	for offset < len(data) {
		// Show hex bytes at this offset
		bytesToShow := 16
		if offset+bytesToShow > len(data) {
			bytesToShow = len(data) - offset
		}

		result.WriteString(fmt.Sprintf("%04X: ", offset))

		// Print hex bytes
		for i := 0; i < bytesToShow; i++ {
			result.WriteString(fmt.Sprintf("%02X ", data[offset+i]))
		}
		// Pad to align
		for i := bytesToShow; i < 16; i++ {
			result.WriteString("   ")
		}

		// Print ASCII representation
		result.WriteString(" |")
		for i := 0; i < bytesToShow; i++ {
			b := data[offset+i]
			if b >= 32 && b < 127 {
				result.WriteByte(b)
			} else {
				result.WriteByte('.')
			}
		}
		result.WriteString("|\n")

		offset += bytesToShow
	}

	result.WriteString("\n")
	result.WriteString("Field Analysis:\n")
	result.WriteString("-" + strings.Repeat("-", 30) + "\n")

	// Parse protobuf fields
	offset = 0
	fieldNum := 0
	for offset < len(data) {
		fieldNum++
		if offset >= len(data) {
			break
		}

		// Read field key (tag and wire type)
		tag, bytesRead := decodeVarint(data[offset:])
		if bytesRead == 0 || offset+bytesRead > len(data) {
			result.WriteString(fmt.Sprintf("  Field %d: Unable to parse tag at offset %d\n", fieldNum, offset))
			break
		}

		wireType := tag & 0x7
		fieldNumber := tag >> 3

		result.WriteString(fmt.Sprintf("  Field %d (offset %04X):\n", fieldNum, offset))
		result.WriteString(fmt.Sprintf("    Tag: %d, Wire Type: %d (%s)\n", fieldNumber, wireType, getWireTypeName(wireType)))

		offset += bytesRead

		// Parse value based on wire type
		switch wireType {
		case 0: // Varint
			val, bytesRead := decodeVarint(data[offset:])
			if bytesRead > 0 {
				result.WriteString(fmt.Sprintf("    Value (varint): %d (0x%X)\n", val, val))
				offset += bytesRead
			}
		case 1: // 64-bit
			if offset+8 <= len(data) {
				val := binaryLittleEndianUint64(data[offset:])
				floatVal := math.Float64frombits(val)
				result.WriteString(fmt.Sprintf("    Value (64-bit): %d (0x%016X) / float64: %f\n", val, val, floatVal))
				offset += 8
			}
		case 2: // Length-delimited
			length, bytesRead := decodeVarint(data[offset:])
			if bytesRead > 0 && offset+bytesRead+int(length) <= len(data) {
				offset += bytesRead
				value := data[offset : offset+int(length)]

				// Try to display as string if printable
				isPrintable := true
				for _, b := range value {
					if b < 32 || b > 126 {
						isPrintable = false
						break
					}
				}

				if isPrintable && length > 0 {
					result.WriteString(fmt.Sprintf("    Value (string): \"%s\"\n", string(value)))
				} else {
					result.WriteString(fmt.Sprintf("    Value (bytes, len=%d): ", length))
					for i, b := range value {
						if i < 16 {
							result.WriteString(fmt.Sprintf("%02X ", b))
						} else if i == 16 {
							result.WriteString("...")
							break
						}
					}
					result.WriteString("\n")
				}
				offset += int(length)
			}
		case 5: // 32-bit
			if offset+4 <= len(data) {
				val := binaryLittleEndianUint32(data[offset:])
				floatVal := math.Float32frombits(val)
				result.WriteString(fmt.Sprintf("    Value (32-bit): %d (0x%08X) / float32: %f\n", val, val, floatVal))
				offset += 4
			}
		default:
			result.WriteString(fmt.Sprintf("    Unknown wire type %d\n", wireType))
			offset++ // Skip one byte to avoid infinite loop
		}

		result.WriteString("\n")
	}

	return result.String()
}

// Decode varint from protobuf
func decodeVarint(data []byte) (uint64, int) {
	var result uint64
	var shift uint

	for i, b := range data {
		if i > 9 {
			return 0, 0 // Varint too long
		}
		result |= uint64(b&0x7F) << shift
		if b&0x80 == 0 {
			return result, i + 1
		}
		shift += 7
	}

	return 0, 0 // Incomplete varint
}

// Get wire type name
func getWireTypeName(wireType uint64) string {
	switch wireType {
	case 0:
		return "varint"
	case 1:
		return "64-bit"
	case 2:
		return "length-delimited"
	case 3:
		return "start group (deprecated)"
	case 4:
		return "end group (deprecated)"
	case 5:
		return "32-bit"
	default:
		return "unknown"
	}
}

// Binary little-endian helpers
func binaryLittleEndianUint64(data []byte) uint64 {
	return uint64(data[0]) | uint64(data[1])<<8 | uint64(data[2])<<16 | uint64(data[3])<<24 |
		uint64(data[4])<<32 | uint64(data[5])<<40 | uint64(data[6])<<48 | uint64(data[7])<<56
}

func binaryLittleEndianUint32(data []byte) uint32 {
	return uint32(data[0]) | uint32(data[1])<<8 | uint32(data[2])<<16 | uint32(data[3])<<24
}
