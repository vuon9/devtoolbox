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
			"header": h,
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
	}

	return "", fmt.Errorf("encoding method %s not supported", req.Method)
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
