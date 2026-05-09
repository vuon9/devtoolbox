package service

import (
	"testing"
)

func TestTextUtilitiesService_SortLines(t *testing.T) {
	svc := NewTextUtilitiesService(nil)
	result, _ := svc.SortLines("banana\napple\ncherry", false)
	expected := "apple\nbanana\ncherry"
	if result != expected {
		t.Fatalf("expected %q, got %q", expected, result)
	}
}

func TestTextUtilitiesService_RemoveDuplicates(t *testing.T) {
	svc := NewTextUtilitiesService(nil)
	result, _ := svc.RemoveDuplicates("a\nb\na\nc")
	expected := "a\nb\nc"
	if result != expected {
		t.Fatalf("expected %q, got %q", expected, result)
	}
}

func TestTextUtilitiesService_ConvertCase(t *testing.T) {
	svc := NewTextUtilitiesService(nil)
	result, _ := svc.ConvertCase("hello world", "camel")
	if result != "helloWorld" {
		t.Fatalf("expected 'helloWorld', got '%s'", result)
	}
}

func TestTextUtilitiesService_GetStats(t *testing.T) {
	svc := NewTextUtilitiesService(nil)
	stats, _ := svc.GetStats("Hello world.")
	chars := stats["chars"].(int)
	if chars != 12 {
		t.Fatalf("expected 12 chars, got %d", chars)
	}
}

func TestTextUtilitiesService_Escape(t *testing.T) {
	svc := NewTextUtilitiesService(nil)
	escaped, err := svc.Escape("hello\nworld", "String Literal")
	if err != nil {
		t.Fatalf("escape error: %v", err)
	}
	if escaped != "hello\\nworld" {
		t.Fatalf("expected 'hello\\\\nworld', got '%s'", escaped)
	}
}
