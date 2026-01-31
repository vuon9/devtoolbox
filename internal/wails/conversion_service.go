package wails

import (
	"context"
	"dev-toolbox/internal/converter"
)

type ConversionService struct {
	ctx context.Context
	svc converter.ConverterService
}

func NewConversionService() *ConversionService {
	return &ConversionService{
		svc: converter.NewConverterService(),
	}
}

func (s *ConversionService) Startup(ctx context.Context) {
	s.ctx = ctx
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
