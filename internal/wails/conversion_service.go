package wails

import (
	"context"

	"devtoolbox/internal/converter"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type ConversionService struct {
	app *application.App
	svc converter.ConverterService
}

func NewConversionService(app *application.App) *ConversionService {
	return &ConversionService{
		svc: converter.NewConverterService(),
		app: app,
	}
}

func (s *ConversionService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	return nil
}

func (s *ConversionService) Convert(input, category, method string, config map[string]interface{}) (string, error) {
	req := converter.ConversionRequest{
		Input:    input,
		Category: category,
		Method:   method,
		Config:   config,
	}
	return s.svc.Convert(req)
}
