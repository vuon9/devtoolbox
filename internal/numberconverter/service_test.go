package numberconverter

import (
	"reflect"
	"strings"
	"testing"
)

func TestConvertDecimalBuildsCoreRepresentationsAndViews(t *testing.T) {
	svc := NewNumberConverterService()

	got := svc.Convert(ConvertRequest{Value: "255", Base: "decimal"})

	if got.Error != "" {
		t.Fatalf("Convert returned unexpected error: %s", got.Error)
	}
	if got.Binary != "11111111" {
		t.Fatalf("Binary = %q, want %q", got.Binary, "11111111")
	}
	if got.Decimal != "255" {
		t.Fatalf("Decimal = %q, want %q", got.Decimal, "255")
	}
	if got.Hex != "0xFF" {
		t.Fatalf("Hex = %q, want %q", got.Hex, "0xFF")
	}
	if got.Octal != "377" {
		t.Fatalf("Octal = %q, want %q", got.Octal, "377")
	}

	wantBits := []int{1, 1, 1, 1, 1, 1, 1, 1}
	if !reflect.DeepEqual(got.Bits, wantBits) {
		t.Fatalf("Bits = %v, want %v", got.Bits, wantBits)
	}
	wantBitValues := []int{128, 64, 32, 16, 8, 4, 2, 1}
	if !reflect.DeepEqual(got.BitValues, wantBitValues) {
		t.Fatalf("BitValues = %v, want %v", got.BitValues, wantBitValues)
	}
	wantBytes := []string{"00", "00", "00", "FF"}
	if !reflect.DeepEqual(got.Bytes.BigEndian, wantBytes) {
		t.Fatalf("Bytes.BigEndian = %v, want %v", got.Bytes.BigEndian, wantBytes)
	}
	if got.Bytes.Highlighted != 3 {
		t.Fatalf("Bytes.Highlighted = %d, want 3", got.Bytes.Highlighted)
	}

	if got.ASCII.Code != 255 || got.ASCII.Printable {
		t.Fatalf("ASCII = %+v, want code 255 and non-printable", got.ASCII)
	}
	if got.Color.Hex != "#0000FF" || !got.Color.Valid {
		t.Fatalf("Color = %+v, want valid #0000FF", got.Color)
	}
	if got.IPv4.Address != "0.0.0.255" || got.IPv4.Type != "broadcast" {
		t.Fatalf("IPv4 = %+v, want broadcast 0.0.0.255", got.IPv4)
	}
	if got.Percentage != 100 {
		t.Fatalf("Percentage = %d, want 100", got.Percentage)
	}
	if got.FileSize.Bytes != 255 || got.FileSize.Human != "255 bytes" {
		t.Fatalf("FileSize = %+v, want 255 bytes", got.FileSize)
	}
	if got.Timestamp.DateTime != "1970-01-01 00:04:15" || got.Timestamp.Duration != "4m 15s" {
		t.Fatalf("Timestamp = %+v, want 1970-01-01 00:04:15 and 4m 15s", got.Timestamp)
	}
}

func TestConvertParsesSupportedBaseAliases(t *testing.T) {
	svc := NewNumberConverterService()

	tests := []struct {
		name  string
		req   ConvertRequest
		want  string
		bits  []int
		bytes []string
	}{
		{
			name:  "binary alias",
			req:   ConvertRequest{Value: "10101010", Base: "bin"},
			want:  "170",
			bits:  []int{1, 0, 1, 0, 1, 0, 1, 0},
			bytes: []string{"00", "00", "00", "AA"},
		},
		{
			name:  "octal alias",
			req:   ConvertRequest{Value: "755", Base: "oct"},
			want:  "493",
			bits:  []int{1, 1, 1, 0, 1, 1, 0, 1},
			bytes: []string{"00", "00", "01", "ED"},
		},
		{
			name:  "hexadecimal prefix",
			req:   ConvertRequest{Value: "0xDEADBEEF", Base: "hex"},
			want:  "3735928559",
			bits:  []int{1, 1, 1, 0, 1, 1, 1, 1},
			bytes: []string{"DE", "AD", "BE", "EF"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := svc.Convert(tt.req)
			if got.Error != "" {
				t.Fatalf("Convert returned unexpected error: %s", got.Error)
			}
			if got.Decimal != tt.want {
				t.Fatalf("Decimal = %q, want %q", got.Decimal, tt.want)
			}
			if !reflect.DeepEqual(got.Bits, tt.bits) {
				t.Fatalf("Bits = %v, want %v", got.Bits, tt.bits)
			}
			if !reflect.DeepEqual(got.Bytes.BigEndian, tt.bytes) {
				t.Fatalf("Bytes.BigEndian = %v, want %v", got.Bytes.BigEndian, tt.bytes)
			}
		})
	}
}

func TestConvertReportsInvalidInputs(t *testing.T) {
	svc := NewNumberConverterService()

	tests := []struct {
		name          string
		req           ConvertRequest
		wantErrorPart string
	}{
		{
			name:          "unsupported base",
			req:           ConvertRequest{Value: "10", Base: "base36"},
			wantErrorPart: "unsupported base: base36",
		},
		{
			name:          "invalid digit",
			req:           ConvertRequest{Value: "102", Base: "binary"},
			wantErrorPart: "invalid number:",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := svc.Convert(tt.req)
			if got.Error == "" {
				t.Fatal("Convert returned no error")
			}
			if !strings.Contains(got.Error, tt.wantErrorPart) {
				t.Fatalf("Error = %q, want to contain %q", got.Error, tt.wantErrorPart)
			}
		})
	}
}

func TestInterpretNumberOmitsByteOnlyViewsOutsideByteRange(t *testing.T) {
	svc := NewNumberConverterService()

	got := svc.Convert(ConvertRequest{Value: "256", Base: "decimal"})

	if got.Error != "" {
		t.Fatalf("Convert returned unexpected error: %s", got.Error)
	}
	if got.Color.Valid {
		t.Fatalf("Color.Valid = true, want false for values outside 0-255")
	}
	if got.ASCII.Code != 0 || got.ASCII.Char != "" || got.ASCII.Printable {
		t.Fatalf("ASCII = %+v, want zero value for values outside 0-255", got.ASCII)
	}
	if got.Percentage != 0 {
		t.Fatalf("Percentage = %d, want zero value for values outside 0-255", got.Percentage)
	}
	if got.IPv4.Address != "" || got.IPv4.Type != "" {
		t.Fatalf("IPv4 = %+v, want zero value for values outside 0-255", got.IPv4)
	}
}

func TestFormatFileSize(t *testing.T) {
	svc := NewNumberConverterService()

	tests := []struct {
		bytes int64
		want  string
	}{
		{bytes: 1023, want: "1023 bytes"},
		{bytes: 1024, want: "1.00 KB"},
		{bytes: 1024 * 1024, want: "1.00 MB"},
		{bytes: 1024 * 1024 * 1024, want: "1.00 GB"},
	}

	for _, tt := range tests {
		if got := svc.formatFileSize(tt.bytes); got != tt.want {
			t.Fatalf("formatFileSize(%d) = %q, want %q", tt.bytes, got, tt.want)
		}
	}
}

func TestFormatDuration(t *testing.T) {
	svc := NewNumberConverterService()

	tests := []struct {
		seconds int64
		want    string
	}{
		{seconds: 59, want: "59s"},
		{seconds: 61, want: "1m 1s"},
		{seconds: 3660, want: "1h 1m"},
		{seconds: 172800, want: "2d"},
	}

	for _, tt := range tests {
		if got := svc.formatDuration(tt.seconds); got != tt.want {
			t.Fatalf("formatDuration(%d) = %q, want %q", tt.seconds, got, tt.want)
		}
	}
}
