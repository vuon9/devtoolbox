package service

import (
	"testing"
)

func TestEncoderService_EncodeDecode(t *testing.T) {
	svc := NewEncoderService(nil)
	encoded, err := svc.Encode("hello", "Base64")
	if err != nil {
		t.Fatalf("encode error: %v", err)
	}
	decoded, err := svc.Decode(encoded, "Base64")
	if err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if decoded != "hello" {
		t.Fatalf("expected 'hello', got '%s'", decoded)
	}
}

func TestEncoderService_EscapeUnescape(t *testing.T) {
	svc := NewEncoderService(nil)
	escaped, err := svc.Escape("<div>", "HTML/XML")
	if err != nil {
		t.Fatalf("escape error: %v", err)
	}
	unescaped, err := svc.Unescape(escaped, "HTML/XML")
	if err != nil {
		t.Fatalf("unescape error: %v", err)
	}
	if unescaped != "<div>" {
		t.Fatalf("expected '<div>', got '%s'", unescaped)
	}
}
