package service

import (
	"context"
	"devtoolbox/internal/converter"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type EncoderService struct {
	app             *application.App
	encodingService converter.ConverterService
	escapeService   converter.ConverterService
}

func NewEncoderService(app *application.App) *EncoderService {
	return &EncoderService{
		app:             app,
		encodingService: converter.NewEncodingConverter(),
		escapeService:   converter.NewEscapeConverter(),
	}
}

func (s *EncoderService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	return nil
}

func (s *EncoderService) Encode(input, method string) (string, error) {
	return s.encodingService.Convert(converter.ConversionRequest{
		Input:    input,
		Category: "Encode - Decode",
		Method:   method,
		Config:   map[string]interface{}{"subMode": "Encode"},
	})
}

func (s *EncoderService) Decode(input, method string) (string, error) {
	return s.encodingService.Convert(converter.ConversionRequest{
		Input:    input,
		Category: "Encode - Decode",
		Method:   method,
		Config:   map[string]interface{}{"subMode": "Decode"},
	})
}

func (s *EncoderService) Escape(input, method string) (string, error) {
	return s.escapeService.Convert(converter.ConversionRequest{
		Input:    input,
		Category: "Escape",
		Method:   method,
		Config:   map[string]interface{}{"subMode": "Escape"},
	})
}

func (s *EncoderService) Unescape(input, method string) (string, error) {
	return s.escapeService.Convert(converter.ConversionRequest{
		Input:    input,
		Category: "Escape",
		Method:   method,
		Config:   map[string]interface{}{"subMode": "Unescape"},
	})
}
