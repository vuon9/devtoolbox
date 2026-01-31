package main

import (
	"context"

	"dev-toolbox/internal/datagenerator"
)

// DataGeneratorService provides data generation functionality via Wails
type DataGeneratorService struct {
	ctx context.Context
	svc datagenerator.DataGeneratorService
}

// NewDataGeneratorService creates a new DataGeneratorService
func NewDataGeneratorService() *DataGeneratorService {
	return &DataGeneratorService{
		svc: datagenerator.NewDataGeneratorService(),
	}
}

// startup is called when the service starts
func (d *DataGeneratorService) startup(ctx context.Context) {
	d.ctx = ctx
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
