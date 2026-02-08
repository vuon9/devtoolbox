package barcode

import (
	"strings"
	"testing"
)

func TestGenerateBarcode(t *testing.T) {
	service := NewBarcodeService()

	tests := []struct {
		name      string
		content   string
		standard  string
		size      int
		level     string
		expectErr bool
		errorMsg  string
	}{
		// QR Code tests
		{
			name:      "QR code - valid content",
			content:   "https://example.com",
			standard:  "QR",
			size:      256,
			level:     "M",
			expectErr: false,
		},
		{
			name:      "QR code - empty content should error",
			content:   "",
			standard:  "QR",
			size:      256,
			level:     "M",
			expectErr: true,
			errorMsg:  "Content cannot be empty",
		},
		{
			name:      "QR code - custom error level H",
			content:   "QR test",
			standard:  "QR",
			size:      128,
			level:     "H",
			expectErr: false,
		},
		{
			name:      "QR code - default size (less than 64)",
			content:   "test",
			standard:  "QR",
			size:      32,
			level:     "M",
			expectErr: false,
		},

		// EAN-13 tests
		{
			name:      "EAN-13 - 12 digits (will be auto-calculated)",
			content:   "123456789012",
			standard:  "EAN-13",
			size:      256,
			expectErr: false,
		},
		{
			name:      "EAN-13 - 13 digits with correct checksum",
			content:   "1234567890128", // Last digit 8 is checksum for 123456789012
			standard:  "EAN-13",
			size:      256,
			expectErr: false,
		},
		{
			name:      "EAN-13 - invalid length",
			content:   "12345",
			standard:  "EAN-13",
			size:      256,
			expectErr: true,
		},

		// EAN-8 tests
		{
			name:      "EAN-8 - 7 digits (will be auto-calculated)",
			content:   "1234567",
			standard:  "EAN-8",
			size:      256,
			expectErr: false,
		},
		{
			name:      "EAN-8 - 8 digits with correct checksum",
			content:   "96385074", // Checksum 4 for 9638507
			standard:  "EAN-8",
			size:      256,
			expectErr: false,
		},

		// Code128 tests
		{
			name:      "Code128 - alphanumeric content",
			content:   "ABC123",
			standard:  "Code128",
			size:      256,
			expectErr: false,
		},
		{
			name:      "Code128 - special characters",
			content:   "Test-123_456",
			standard:  "Code128",
			size:      256,
			expectErr: false,
		},

		// Code39 tests
		{
			name:      "Code39 - valid alphanumeric",
			content:   "ABC123",
			standard:  "Code39",
			size:      256,
			expectErr: false,
		},
		{
			name:      "Code39 - with spaces and valid special chars",
			content:   "TEST-123 $/+%",
			standard:  "Code39",
			size:      256,
			expectErr: false,
		},

		// Edge cases
		{
			name:      "Default standard (empty should default to QR)",
			content:   "default test",
			standard:  "",
			size:      256,
			level:     "M",
			expectErr: false,
		},
		{
			name:      "Invalid standard",
			content:   "test",
			standard:  "INVALID",
			size:      256,
			expectErr: true,
			errorMsg:  "Unsupported barcode standard",
		},
		{
			name:      "Large size (should cap at 1024)",
			content:   "test",
			standard:  "QR",
			size:      2048,
			level:     "M",
			expectErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := GenerateBarcodeRequest{
				Content:  tt.content,
				Standard: tt.standard,
				Size:     tt.size,
				Level:    tt.level,
				Format:   "base64",
			}

			resp := service.GenerateBarcode(req)

			if tt.expectErr {
				if resp.Error == "" {
					t.Errorf("Expected error but got none")
				}
				if tt.errorMsg != "" && !strings.Contains(resp.Error, tt.errorMsg) {
					t.Errorf("Expected error containing '%s', got '%s'", tt.errorMsg, resp.Error)
				}
				return
			}

			if resp.Error != "" {
				t.Errorf("Unexpected error: %s", resp.Error)
				return
			}

			if resp.DataURL == "" {
				t.Error("Expected DataURL but got empty")
				return
			}

			// Verify it's a valid data URL
			if !strings.HasPrefix(resp.DataURL, "data:image/png;base64,") {
				t.Errorf("Expected data URL starting with 'data:image/png;base64,', got: %s", resp.DataURL[:50])
			}

			// Verify base64 data is present
			base64Data := strings.TrimPrefix(resp.DataURL, "data:image/png;base64,")
			if len(base64Data) == 0 {
				t.Error("Base64 data is empty")
			}
		})
	}
}

func TestGetBarcodeStandards(t *testing.T) {
	service := NewBarcodeService()
	standards := service.GetBarcodeStandards()

	expectedStandards := []struct {
		value string
		label string
	}{
		{"QR", "QR Code (2D)"},
		{"EAN-13", "EAN-13 (Retail - 13 digits)"},
		{"EAN-8", "EAN-8 (Small Retail - 8 digits)"},
		{"Code128", "Code 128 (High Density)"},
		{"Code39", "Code 39 (Alphanumeric)"},
	}

	if len(standards) != len(expectedStandards) {
		t.Errorf("Expected %d standards, got %d", len(expectedStandards), len(standards))
	}

	for i, expected := range expectedStandards {
		if i >= len(standards) {
			break
		}
		if standards[i]["value"] != expected.value {
			t.Errorf("Standard %d: expected value '%s', got '%s'", i, expected.value, standards[i]["value"])
		}
		if standards[i]["label"] != expected.label {
			t.Errorf("Standard %d: expected label '%s', got '%s'", i, expected.label, standards[i]["label"])
		}
	}
}

func TestGetQRErrorLevels(t *testing.T) {
	service := NewBarcodeService()
	levels := service.GetQRErrorLevels()

	expectedLevels := []struct {
		value string
		label string
	}{
		{"L", "Low (~7%)"},
		{"M", "Medium (~15%)"},
		{"Q", "Quartile (~25%)"},
		{"H", "High (~30%)"},
	}

	if len(levels) != len(expectedLevels) {
		t.Errorf("Expected %d error levels, got %d", len(expectedLevels), len(levels))
	}

	for i, expected := range expectedLevels {
		if i >= len(levels) {
			break
		}
		if levels[i]["value"] != expected.value {
			t.Errorf("Level %d: expected value '%s', got '%s'", i, expected.value, levels[i]["value"])
		}
		if levels[i]["label"] != expected.label {
			t.Errorf("Level %d: expected label '%s', got '%s'", i, expected.label, levels[i]["label"])
		}
	}
}

func TestGetBarcodeSizes(t *testing.T) {
	service := NewBarcodeService()
	sizes := service.GetBarcodeSizes()

	expectedSizes := []struct {
		value int
		label string
	}{
		{128, "Small (128px)"},
		{256, "Medium (256px)"},
		{512, "Large (512px)"},
		{1024, "Extra Large (1024px)"},
	}

	if len(sizes) != len(expectedSizes) {
		t.Errorf("Expected %d size options, got %d", len(expectedSizes), len(sizes))
	}

	for i, expected := range expectedSizes {
		if i >= len(sizes) {
			break
		}
		// Type assertion for interface{}
		value, ok := sizes[i]["value"].(int)
		if !ok {
			t.Errorf("Size %d: value is not an int", i)
			continue
		}
		if value != expected.value {
			t.Errorf("Size %d: expected value %d, got %d", i, expected.value, value)
		}
		label, ok := sizes[i]["label"].(string)
		if !ok {
			t.Errorf("Size %d: label is not a string", i)
			continue
		}
		if label != expected.label {
			t.Errorf("Size %d: expected label '%s', got '%s'", i, expected.label, label)
		}
	}
}

func TestValidateContent(t *testing.T) {
	service := NewBarcodeService()

	tests := []struct {
		name      string
		content   string
		standard  string
		wantValid bool
		wantMsg   string
	}{
		// EAN-13 validation tests
		{
			name:      "EAN-13 valid 12 digits",
			content:   "123456789012",
			standard:  "EAN-13",
			wantValid: true,
		},
		{
			name:      "EAN-13 valid 13 digits with correct checksum",
			content:   "1234567890128", // Checksum for 123456789012 is 8
			standard:  "EAN-13",
			wantValid: true,
		},
		{
			name:      "EAN-13 invalid length",
			content:   "12345",
			standard:  "EAN-13",
			wantValid: false,
			wantMsg:   "EAN-13 requires 12 or 13 digits",
		},
		{
			name:      "EAN-13 contains non-digits",
			content:   "12345678901A",
			standard:  "EAN-13",
			wantValid: false,
			wantMsg:   "EAN-13 can only contain digits",
		},
		{
			name:      "EAN-13 13 digits with wrong checksum",
			content:   "1234567890129", // Wrong checksum (should be 8)
			standard:  "EAN-13",
			wantValid: false,
			wantMsg:   "Invalid checksum",
		},

		// EAN-8 validation tests
		{
			name:      "EAN-8 valid 7 digits",
			content:   "1234567",
			standard:  "EAN-8",
			wantValid: true,
		},
		{
			name:      "EAN-8 valid 8 digits with correct checksum",
			content:   "96385074", // Checksum for 9638507 is 4
			standard:  "EAN-8",
			wantValid: true,
		},
		{
			name:      "EAN-8 invalid length",
			content:   "12345",
			standard:  "EAN-8",
			wantValid: false,
			wantMsg:   "EAN-8 requires 7 or 8 digits",
		},
		{
			name:      "EAN-8 contains non-digits",
			content:   "12345A7",
			standard:  "EAN-8",
			wantValid: false,
			wantMsg:   "EAN-8 can only contain digits",
		},

		// Code39 validation tests
		{
			name:      "Code39 valid alphanumeric",
			content:   "ABC123",
			standard:  "Code39",
			wantValid: true,
		},
		{
			name:      "Code39 valid with special chars",
			content:   "TEST-123 $/+%",
			standard:  "Code39",
			wantValid: true,
		},
		{
			name:      "Code39 invalid character (lowercase)",
			content:   "abc123",
			standard:  "Code39",
			wantValid: false,
			wantMsg:   "Code 39 only supports: 0-9, A-Z, and - . $ / + % space",
		},
		{
			name:      "Code39 invalid character (unsupported)",
			content:   "TEST@123",
			standard:  "Code39",
			wantValid: false,
			wantMsg:   "Code 39 only supports: 0-9, A-Z, and - . $ / + % space",
		},

		// Other standards (should return valid by default)
		{
			name:      "QR code always valid",
			content:   "any content",
			standard:  "QR",
			wantValid: true,
		},
		{
			name:      "Code128 always valid",
			content:   "any content",
			standard:  "Code128",
			wantValid: true,
		},
		{
			name:      "Unknown standard",
			content:   "test",
			standard:  "UNKNOWN",
			wantValid: true, // Unknown standards don't have validation
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := service.ValidateContent(tt.content, tt.standard)

			valid, ok := result["valid"].(bool)
			if !ok {
				t.Fatal("Result 'valid' field is not a bool")
			}

			message, ok := result["message"].(string)
			if !ok {
				t.Fatal("Result 'message' field is not a string")
			}

			if valid != tt.wantValid {
				t.Errorf("Expected valid=%v, got valid=%v", tt.wantValid, valid)
			}

			if tt.wantMsg != "" && !strings.Contains(message, tt.wantMsg) {
				t.Errorf("Expected message containing '%s', got '%s'", tt.wantMsg, message)
			}
		})
	}
}

func TestCalculateEANChecksum(t *testing.T) {
	tests := []struct {
		name     string
		code     string
		expected int
	}{
		{"EAN-13 example 1", "123456789012", 8}, // Known checksum
		{"EAN-13 example 2", "400638133393", 1}, // Known checksum
		{"EAN-8 example 1", "1234567", 0},       // 1*3+2*1+3*3+4*1+5*3+6*1+7*3=60, 60%10=0, (10-0)%10=0
		{"EAN-8 example 2", "9638507", 4},       // Known checksum
		{"All zeros", "000000000000", 0},        // Edge case
		{"All ones", "111111111111", 6},         // Sum=24, 24%10=4, (10-4)%10=6
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := calculateEANChecksum(tt.code)
			if result != tt.expected {
				t.Errorf("Expected checksum %d for code %s, got %d", tt.expected, tt.code, result)
			}
		})
	}
}
