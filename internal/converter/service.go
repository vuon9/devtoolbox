package converter

import (
	"encoding/json"
	"fmt"
	"strings"
)

type ConversionRequest struct {
	Input    string                 `json:"input"`
	Category string                 `json:"category"`
	Method   string                 `json:"method"`
	Config   map[string]interface{} `json:"config"`
}

type ConverterService interface {
	Convert(req ConversionRequest) (string, error)
}

type converterService struct {
	encoding   ConverterService
	encryption ConverterService
	hashing    ConverterService
	formatting ConverterService
	escape     ConverterService
}

func NewConverterService() ConverterService {
	return &converterService{
		encoding:   NewEncodingConverter(),
		encryption: NewEncryptionConverter(),
		hashing:    NewHashingConverter(),
		formatting: NewFormattingConverter(),
		escape:     NewEscapeConverter(),
	}
}

func (s *converterService) Convert(req ConversionRequest) (string, error) {
	category := strings.ToLower(req.Category)
	method := strings.ToLower(req.Method)

	if strings.Contains(category, "encode") {
		return s.encoding.Convert(req)
	}
	if strings.Contains(category, "encrypt") {
		return s.encryption.Convert(req)
	}
	if strings.Contains(category, "hash") {
		// Special case: compute all hashes
		if method == "all" {
			return s.computeAllHashes(req.Input)
		}
		return s.hashing.Convert(req)
	}
	if strings.Contains(category, "convert") {
		return s.formatting.Convert(req)
	}
	if strings.Contains(category, "escape") {
		return s.escape.Convert(req)
	}

	return "", fmt.Errorf("category %s not supported", req.Category)
}

// computeAllHashes computes all available hash algorithms and returns them as JSON
func (s *converterService) computeAllHashes(input string) (string, error) {
	hashMethods := []string{
		"MD5", "SHA-1", "SHA-224", "SHA-256", "SHA-384", "SHA-512",
		"SHA-3 (Keccak)", "BLAKE2b", "BLAKE3", "RIPEMD-160",
		"CRC32", "Adler-32", "MurmurHash3", "xxHash", "FNV-1a",
	}

	results := make(map[string]string)

	for _, method := range hashMethods {
		req := ConversionRequest{
			Input:    input,
			Category: "Hash",
			Method:   method,
			Config:   make(map[string]interface{}),
		}

		result, err := s.hashing.Convert(req)
		if err != nil {
			results[method] = fmt.Sprintf("Error: %s", err.Error())
		} else {
			results[method] = result
		}
	}

	// Marshal to JSON for structured output
	jsonOutput, err := json.MarshalIndent(results, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to marshal hash results: %w", err)
	}

	return string(jsonOutput), nil
}
