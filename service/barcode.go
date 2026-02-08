package service

import (
	"context"
	"devtoolbox/internal/barcode"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type BarcodeService struct {
	app *application.App
	svc barcode.BarcodeService
}

func NewBarcodeService(app *application.App) *BarcodeService {
	return &BarcodeService{
		app: app,
		svc: barcode.NewBarcodeService(),
	}
}

func (s *BarcodeService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	return nil
}

// GenerateBarcode generates a barcode based on the selected standard
func (s *BarcodeService) GenerateBarcode(req barcode.GenerateBarcodeRequest) barcode.GenerateBarcodeResponse {
	return s.svc.GenerateBarcode(req)
}

// GetBarcodeStandards returns available barcode standards
func (s *BarcodeService) GetBarcodeStandards() []map[string]string {
	return s.svc.GetBarcodeStandards()
}

// GetQRErrorLevels returns available error correction levels for QR codes
func (s *BarcodeService) GetQRErrorLevels() []map[string]string {
	return s.svc.GetQRErrorLevels()
}

// GetBarcodeSizes returns available barcode sizes
func (s *BarcodeService) GetBarcodeSizes() []map[string]interface{} {
	return s.svc.GetBarcodeSizes()
}

// ValidateContent validates content for specific barcode standards
func (s *BarcodeService) ValidateContent(content string, standard string) map[string]interface{} {
	return s.svc.ValidateContent(content, standard)
}
