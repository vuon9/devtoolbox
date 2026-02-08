package service

import (
	"context"
	"devtoolbox/internal/datagenerator"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// DataGeneratorService provides data generation functionality via Wails
type DataGeneratorService struct {
	app *application.App
	svc datagenerator.DataGeneratorService
}

// NewDataGeneratorService creates a new DataGeneratorService
func NewDataGeneratorService(app *application.App) *DataGeneratorService {
	return &DataGeneratorService{
		svc: datagenerator.NewDataGeneratorService(),
		app: app,
	}
}

// Startup is called when the service starts
func (d *DataGeneratorService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	return nil
}

// Generate generates data based on the provided request
func (d *DataGeneratorService) Generate(req datagenerator.GenerateRequest) datagenerator.GenerateResponse {
	resp, err := d.svc.Generate(req)
	if err != nil {
		return datagenerator.GenerateResponse{
			Error: err.Error(),
		}
	}
	return *resp
}

// GetPresets returns all available template presets
func (d *DataGeneratorService) GetPresets() datagenerator.PresetsResponse {
	resp, err := d.svc.GetPresets()
	if err != nil {
		return datagenerator.PresetsResponse{
			Error: err.Error(),
		}
	}
	return *resp
}

// ValidateTemplate validates a template string
func (d *DataGeneratorService) ValidateTemplate(template string) datagenerator.ValidationResult {
	resp, err := d.svc.ValidateTemplate(template)
	if err != nil {
		return datagenerator.ValidationResult{
			Valid: false,
			Error: err.Error(),
		}
	}
	return *resp
}
