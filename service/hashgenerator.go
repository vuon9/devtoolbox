package service

import (
	"context"
	"devtoolbox/internal/converter"
	"encoding/json"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type HashGeneratorService struct {
	app  *application.App
	svc  converter.ConverterService
	hash converter.ConverterService
}

func NewHashGeneratorService(app *application.App) *HashGeneratorService {
	return &HashGeneratorService{
		app:  app,
		svc:  converter.NewConverterService(),
		hash: converter.NewHashingConverter(),
	}
}

func (s *HashGeneratorService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	return nil
}

func (s *HashGeneratorService) Hash(input, method string, config map[string]interface{}) (string, error) {
	if config == nil {
		config = map[string]interface{}{}
	}
	return s.hash.Convert(converter.ConversionRequest{
		Input:    input,
		Category: "Hash",
		Method:   method,
		Config:   config,
	})
}

func (s *HashGeneratorService) HashAll(input string) (map[string]string, error) {
	result, err := s.svc.Convert(converter.ConversionRequest{
		Input:    input,
		Category: "Hash",
		Method:   "All",
		Config:   map[string]interface{}{},
	})
	if err != nil {
		return nil, err
	}
	var results map[string]string
	if err := json.Unmarshal([]byte(result), &results); err != nil {
		return nil, err
	}
	return results, nil
}
