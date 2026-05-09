package service

import (
	"testing"
)

func TestEncrypterService_Encrypt(t *testing.T) {
	svc := NewEncrypterService(nil)
	result, err := svc.Encrypt("hello", "XOR", "key", "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result == "" {
		t.Fatal("expected non-empty result")
	}
}

func TestEncrypterService_Decrypt(t *testing.T) {
	svc := NewEncrypterService(nil)
	encrypted, _ := svc.Encrypt("hello", "XOR", "key", "")
	decrypted, err := svc.Decrypt(encrypted, "XOR", "key", "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if decrypted != "hello" {
		t.Fatalf("expected 'hello', got '%s'", decrypted)
	}
}
