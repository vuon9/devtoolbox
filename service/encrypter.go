package service

import (
	"context"
	"devtoolbox/internal/converter"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type EncrypterService struct {
	app *application.App
	svc converter.ConverterService
}

func NewEncrypterService(app *application.App) *EncrypterService {
	return &EncrypterService{app: app, svc: converter.NewEncryptionConverter()}
}

func (s *EncrypterService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	return nil
}

func (s *EncrypterService) Encrypt(input, method, key, iv string) (string, error) {
	return s.svc.Convert(converter.ConversionRequest{
		Input:    input,
		Category: "Encrypt - Decrypt",
		Method:   method,
		Config:   map[string]interface{}{"subMode": "Encrypt", "key": key, "iv": iv},
	})
}

func (s *EncrypterService) Decrypt(input, method, key, iv string) (string, error) {
	return s.svc.Convert(converter.ConversionRequest{
		Input:    input,
		Category: "Encrypt - Decrypt",
		Method:   method,
		Config:   map[string]interface{}{"subMode": "Decrypt", "key": key, "iv": iv},
	})
}
