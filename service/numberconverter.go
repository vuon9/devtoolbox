package service

import (
	"context"
	"devtoolbox/internal/numberconverter"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// NumberConverterService is the Wails binding for number conversion
type NumberConverterService struct {
	app *application.App
	svc *numberconverter.NumberConverterService
}

// NewNumberConverterService creates a new service instance
func NewNumberConverterService(app *application.App) *NumberConverterService {
	return &NumberConverterService{
		app: app,
		svc: numberconverter.NewNumberConverterService(),
	}
}

// ServiceStartup is called when the app starts
func (n *NumberConverterService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	return nil
}

// Convert converts a number and returns all interpretations
func (n *NumberConverterService) Convert(req numberconverter.ConvertRequest) numberconverter.ConvertResponse {
	return n.svc.Convert(req)
}
