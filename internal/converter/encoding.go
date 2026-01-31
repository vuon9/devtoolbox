package converter

import (
	"encoding/base32"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html"
	"net/url"
	"strconv"
	"strings"

	"github.com/btcsuite/btcutil/base58"
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
