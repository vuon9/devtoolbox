package converter

import (
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
}

func NewConverterService() ConverterService {
	return &converterService{
		encoding:   NewEncodingConverter(),
		encryption: NewEncryptionConverter(),
		hashing:    NewHashingConverter(),
		formatting: NewFormattingConverter(),
	}
}

func (s *converterService) Convert(req ConversionRequest) (string, error) {
	category := strings.ToLower(req.Category)

	if strings.Contains(category, "encode") {
		return s.encoding.Convert(req)
	}
	if strings.Contains(category, "encrypt") {
		return s.encryption.Convert(req)
	}
	if strings.Contains(category, "hash") {
		return s.hashing.Convert(req)
	}
	if strings.Contains(category, "convert") {
		return s.formatting.Convert(req)
	}

	return "", fmt.Errorf("category %s not supported", req.Category)
}
