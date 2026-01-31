package wails

import (
	"context"
	"dev-toolbox/internal/codeformatter"
)

// CodeFormatterService is the Wails binding struct for code formatting operations
type CodeFormatterService struct {
	ctx context.Context
	svc codeformatter.CodeFormatterService
}

// NewCodeFormatterService creates a new CodeFormatterService instance
func NewCodeFormatterService() *CodeFormatterService {
	return &CodeFormatterService{
		svc: codeformatter.NewCodeFormatterService(),
	}
}

// Startup is called when the app starts (Wails lifecycle)
func (c *CodeFormatterService) Startup(ctx context.Context) {
	c.ctx = ctx
}

// Format formats code based on the request
// This method is exposed to the frontend via Wails
func (c *CodeFormatterService) Format(req codeformatter.FormatRequest) codeformatter.FormatResponse {
	return c.svc.Format(req)
}
