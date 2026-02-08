package service

import (
	"context"
	"devtoolbox/internal/codeformatter"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// CodeFormatterService is the Wails binding struct for code formatting operations
type CodeFormatterService struct {
	app *application.App
	svc codeformatter.CodeFormatterService
}

// NewCodeFormatterService creates a new CodeFormatterService instance
func NewCodeFormatterService(app *application.App) *CodeFormatterService {
	return &CodeFormatterService{
		svc: codeformatter.NewCodeFormatterService(),
		app: app,
	}
}

// Startup is called when the app starts (Wails lifecycle)
func (c *CodeFormatterService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	return nil
}

// Format formats code based on the request
// This method is exposed to the frontend via Wails
func (c *CodeFormatterService) Format(req codeformatter.FormatRequest) codeformatter.FormatResponse {
	return c.svc.Format(req)
}
