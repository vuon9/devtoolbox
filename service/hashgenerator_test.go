package service

import (
	"testing"
)

func TestHashGeneratorService_Hash(t *testing.T) {
	svc := NewHashGeneratorService(nil)
	result, err := svc.Hash("hello", "MD5", nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result == "" {
		t.Fatal("expected non-empty hash")
	}
}

func TestHashGeneratorService_HashAll(t *testing.T) {
	svc := NewHashGeneratorService(nil)
	results, err := svc.HashAll("hello")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(results) == 0 {
		t.Fatal("expected multiple hash results")
	}
	if _, ok := results["MD5"]; !ok {
		t.Fatal("expected MD5 in results")
	}
}
