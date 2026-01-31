package datagenerator

import "errors"

var (
	ErrInvalidTemplate   = errors.New("invalid template syntax")
	ErrInvalidBatchCount = errors.New("batch count must be between 10 and 1000")
	ErrInvalidFormat     = errors.New("invalid output format")
	ErrGenerationFailed  = errors.New("data generation failed")
	ErrEmptyTemplate     = errors.New("template cannot be empty")
)
