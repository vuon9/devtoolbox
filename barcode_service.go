package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"image/png"

	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/code128"
	"github.com/boombuler/barcode/code39"
	"github.com/boombuler/barcode/ean"
	"github.com/skip2/go-qrcode"
)

type BarcodeService struct {
	ctx context.Context
}

func NewBarcodeService() *BarcodeService {
	return &BarcodeService{}
}

func (s *BarcodeService) startup(ctx context.Context) {
	s.ctx = ctx
}

// GenerateBarcodeRequest represents the request to generate a barcode
type GenerateBarcodeRequest struct {
	Content  string `json:"content"`
	Standard string `json:"standard"` // QR, EAN-13, EAN-8, Code128, Code39
	Size     int    `json:"size"`
	Level    string `json:"level"`  // For QR: L, M, Q, H
	Format   string `json:"format"` // png, base64
}

// GenerateBarcodeResponse represents the response from barcode generation
type GenerateBarcodeResponse struct {
	DataURL string `json:"dataUrl"`
	Error   string `json:"error"`
}

// GenerateBarcode generates a barcode based on the selected standard
func (s *BarcodeService) GenerateBarcode(req GenerateBarcodeRequest) GenerateBarcodeResponse {
	if req.Content == "" {
		return GenerateBarcodeResponse{Error: "Content cannot be empty"}
	}

	// Set defaults
	size := req.Size
	if size < 64 {
		size = 256
	}
	if size > 1024 {
		size = 1024
	}

	standard := req.Standard
	if standard == "" {
		standard = "QR"
	}

	var img barcode.Barcode
	var err error

	switch standard {
	case "QR":
		return s.generateQR(req)
	case "EAN-13":
		// EAN-13 requires 12 or 13 digits
		img, err = ean.Encode(req.Content)
	case "EAN-8":
		// EAN-8 requires 7 or 8 digits
		img, err = ean.Encode(req.Content)
	case "Code128":
		img, err = code128.Encode(req.Content)
	case "Code39":
		img, err = code39.Encode(req.Content, true, true)
	default:
		return GenerateBarcodeResponse{Error: fmt.Sprintf("Unsupported barcode standard: %s", standard)}
	}

	if err != nil {
		return GenerateBarcodeResponse{Error: fmt.Sprintf("Failed to encode %s: %v", standard, err)}
	}

	// Scale the barcode to the requested size
	// For 1D barcodes, we maintain aspect ratio
	if standard != "QR" {
		bounds := img.Bounds()
		width := bounds.Dx()
		height := bounds.Dy()

		// Scale width to size, maintain aspect ratio for height
		scaleFactor := float64(size) / float64(width)
		newHeight := int(float64(height) * scaleFactor)

		// Ensure minimum height for visibility
		if newHeight < 100 {
			newHeight = 100
		}

		img, err = barcode.Scale(img, size, newHeight)
		if err != nil {
			return GenerateBarcodeResponse{Error: fmt.Sprintf("Failed to scale barcode: %v", err)}
		}
	}

	// Encode to PNG
	var buf bytes.Buffer
	err = png.Encode(&buf, img)
	if err != nil {
		return GenerateBarcodeResponse{Error: fmt.Sprintf("Failed to encode PNG: %v", err)}
	}

	// Convert to base64 data URL
	base64Data := base64.StdEncoding.EncodeToString(buf.Bytes())
	dataURL := fmt.Sprintf("data:image/png;base64,%s", base64Data)

	return GenerateBarcodeResponse{DataURL: dataURL}
}

// generateQR generates a QR code using the skip2/go-qrcode library
func (s *BarcodeService) generateQR(req GenerateBarcodeRequest) GenerateBarcodeResponse {
	// Parse error correction level
	level := qrcode.Medium
	switch req.Level {
	case "L":
		level = qrcode.Low
	case "M":
		level = qrcode.Medium
	case "Q":
		level = qrcode.High
	case "H":
		level = qrcode.Highest
	}

	// Generate QR code
	q, err := qrcode.New(req.Content, level)
	if err != nil {
		return GenerateBarcodeResponse{Error: fmt.Sprintf("Failed to create QR code: %v", err)}
	}

	// Generate PNG
	png, err := q.PNG(req.Size)
	if err != nil {
		return GenerateBarcodeResponse{Error: fmt.Sprintf("Failed to generate PNG: %v", err)}
	}

	// Convert to base64 data URL
	base64Data := base64.StdEncoding.EncodeToString(png)
	dataURL := fmt.Sprintf("data:image/png;base64,%s", base64Data)

	return GenerateBarcodeResponse{DataURL: dataURL}
}

// GetBarcodeStandards returns available barcode standards
func (s *BarcodeService) GetBarcodeStandards() []map[string]string {
	return []map[string]string{
		{"value": "QR", "label": "QR Code (2D)"},
		{"value": "EAN-13", "label": "EAN-13 (Retail - 13 digits)"},
		{"value": "EAN-8", "label": "EAN-8 (Small Retail - 8 digits)"},
		{"value": "Code128", "label": "Code 128 (High Density)"},
		{"value": "Code39", "label": "Code 39 (Alphanumeric)"},
	}
}

// GetQRErrorLevels returns available error correction levels for QR codes
func (s *BarcodeService) GetQRErrorLevels() []map[string]string {
	return []map[string]string{
		{"value": "L", "label": "Low (~7%)"},
		{"value": "M", "label": "Medium (~15%)"},
		{"value": "Q", "label": "Quartile (~25%)"},
		{"value": "H", "label": "High (~30%)"},
	}
}

// GetBarcodeSizes returns available barcode sizes
func (s *BarcodeService) GetBarcodeSizes() []map[string]interface{} {
	return []map[string]interface{}{
		{"value": 128, "label": "Small (128px)"},
		{"value": 256, "label": "Medium (256px)"},
		{"value": 512, "label": "Large (512px)"},
		{"value": 1024, "label": "Extra Large (1024px)"},
	}
}

// calculateEANChecksum calculates the EAN checksum digit
func calculateEANChecksum(code string) int {
	sum := 0
	for i, c := range code {
		digit := int(c - '0')
		if i%2 == 0 {
			sum += digit * 1
		} else {
			sum += digit * 3
		}
	}
	checksum := (10 - (sum % 10)) % 10
	return checksum
}

// ValidateContent validates content for specific barcode standards
func (s *BarcodeService) ValidateContent(content string, standard string) map[string]interface{} {
	result := map[string]interface{}{
		"valid":   true,
		"message": "",
	}

	switch standard {
	case "EAN-13":
		if len(content) != 12 && len(content) != 13 {
			result["valid"] = false
			result["message"] = "EAN-13 requires 12 or 13 digits"
		} else {
			// Check all digits
			allDigits := true
			for _, c := range content {
				if c < '0' || c > '9' {
					allDigits = false
					break
				}
			}
			if !allDigits {
				result["valid"] = false
				result["message"] = "EAN-13 can only contain digits"
			} else if len(content) == 13 {
				// Validate checksum for 13 digits
				providedChecksum := int(content[12] - '0')
				calculatedChecksum := calculateEANChecksum(content[:12])
				if providedChecksum != calculatedChecksum {
					result["valid"] = false
					result["message"] = fmt.Sprintf("Invalid checksum. Correct EAN-13: %s%d", content[:12], calculatedChecksum)
				}
			}
		}
	case "EAN-8":
		if len(content) != 7 && len(content) != 8 {
			result["valid"] = false
			result["message"] = "EAN-8 requires 7 or 8 digits"
		} else {
			// Check all digits
			allDigits := true
			for _, c := range content {
				if c < '0' || c > '9' {
					allDigits = false
					break
				}
			}
			if !allDigits {
				result["valid"] = false
				result["message"] = "EAN-8 can only contain digits"
			} else if len(content) == 8 {
				// Validate checksum for 8 digits
				providedChecksum := int(content[7] - '0')
				calculatedChecksum := calculateEANChecksum(content[:7])
				if providedChecksum != calculatedChecksum {
					result["valid"] = false
					result["message"] = fmt.Sprintf("Invalid checksum. Correct EAN-8: %s%d", content[:7], calculatedChecksum)
				}
			}
		}
	case "Code39":
		// Code 39 supports: 0-9, A-Z, and special characters: - . $ / + % space
		validChars := "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%"
		for _, c := range content {
			found := false
			for _, valid := range validChars {
				if c == valid {
					found = true
					break
				}
			}
			if !found {
				result["valid"] = false
				result["message"] = "Code 39 only supports: 0-9, A-Z, and - . $ / + % space"
				break
			}
		}
	}

	return result
}
