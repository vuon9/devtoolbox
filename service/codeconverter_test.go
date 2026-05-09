package service

import (
	"testing"
)

func TestCodeConverterService_Convert(t *testing.T) {
	svc := NewCodeConverterService(nil)
	input := `{"hello": "world"}`
	result, err := svc.Convert(input, "JSON ↔ YAML")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result == "" {
		t.Fatal("expected non-empty result")
	}
}
