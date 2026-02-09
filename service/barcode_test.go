package service

import (
	"devtoolbox/internal/barcode"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestBarcodeService_Delegation(t *testing.T) {
	svc := NewBarcodeService(nil)

	t.Run("GenerateBarcode", func(t *testing.T) {
		req := barcode.GenerateBarcodeRequest{
			Content:  "12345",
			Standard: "Code128",
		}
		resp := svc.GenerateBarcode(req)
		assert.NotEmpty(t, resp.DataURL)
	})

	t.Run("GetBarcodeStandards", func(t *testing.T) {
		standards := svc.GetBarcodeStandards()
		assert.NotEmpty(t, standards)
	})

	t.Run("GetBarcodeSizes", func(t *testing.T) {
		sizes := svc.GetBarcodeSizes()
		assert.NotEmpty(t, sizes)
	})
}
