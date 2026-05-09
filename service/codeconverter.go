package service

import (
	"context"
	"devtoolbox/internal/converter"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type CodeConverterService struct {
	app *application.App
	svc converter.ConverterService
}

func NewCodeConverterService(app *application.App) *CodeConverterService {
	return &CodeConverterService{app: app, svc: converter.NewFormattingConverter()}
}

func (s *CodeConverterService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	return nil
}

func (s *CodeConverterService) Convert(input, method string) (string, error) {
	return s.svc.Convert(converter.ConversionRequest{
		Input:    input,
		Category: "Convert",
		Method:   method,
		Config:   map[string]interface{}{},
	})
}
