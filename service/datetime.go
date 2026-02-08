package service

import (
	"context"
	"devtoolbox/internal/datetimeconverter"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// DateTimeService is the Wails binding struct for Unix Time operations
type DateTimeService struct {
	app *application.App
	svc datetimeconverter.Service
}

// NewDateTimeService creates a new UnixTimeService instance
func NewDateTimeService(app *application.App) *DateTimeService {
	return &DateTimeService{
		svc: datetimeconverter.NewService(),
		app: app,
	}
}

// ServiceStartup is called when the app starts (Wails lifecycle)
func (u *DateTimeService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	return nil
}

// Convert converts a timestamp or date string to all formats
// This method is exposed to the frontend via Wails
func (u *DateTimeService) Convert(req datetimeconverter.ConvertRequest) (datetimeconverter.ConvertResponse, error) {
	return u.svc.Convert(req), nil
}

// GetPresets returns all available quick presets
// This method is exposed to the frontend via Wails
func (u *DateTimeService) GetPresets() (datetimeconverter.PresetsResponse, error) {
	return u.svc.GetPresets(), nil
}

// CalculateDelta calculates the difference between two dates
// This method is exposed to the frontend via Wails
func (u *DateTimeService) CalculateDelta(req datetimeconverter.DeltaRequest) (datetimeconverter.DeltaResponse, error) {
	return u.svc.CalculateDelta(req), nil
}

func (u *DateTimeService) GetAvailableTimezones() (datetimeconverter.AvailableTimezonesResponse, error) {
	return u.svc.GetAvailableTimezones(), nil
}
