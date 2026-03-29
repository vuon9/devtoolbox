package numberconverter

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

// ConvertRequest represents a number conversion request
type ConvertRequest struct {
	Value string `json:"value"`
	Base  string `json:"base"` // binary, octal, decimal, hex
}

// ConvertResponse represents all conversions and interpretations
type ConvertResponse struct {
	Binary     string        `json:"binary"`
	Decimal    string        `json:"decimal"`
	Hex        string        `json:"hex"`
	Octal      string        `json:"octal"`
	Bits       []int         `json:"bits"`      // 8 bits (0 or 1)
	BitValues  []int         `json:"bitValues"` // [128, 64, 32, 16, 8, 4, 2, 1]
	Bytes      ByteView      `json:"bytes"`
	ASCII      ASCIIView     `json:"ascii"`
	Color      ColorView     `json:"color"`
	IPv4       IPv4View      `json:"ipv4"`
	FileSize   FileSizeView  `json:"fileSize"`
	Timestamp  TimestampView `json:"timestamp"`
	Percentage int           `json:"percentage"`
	Error      string        `json:"error,omitempty"`
}

// ByteView represents 4-byte integer view
type ByteView struct {
	BigEndian   []string `json:"bigEndian"`   // ["00", "00", "00", "FF"]
	Highlighted int      `json:"highlighted"` // which byte has the value (3 for 255)
}

// ASCIIView represents character interpretation
type ASCIIView struct {
	Char      string `json:"char"`
	Code      int    `json:"code"`
	Printable bool   `json:"printable"`
}

// ColorView represents color interpretation
type ColorView struct {
	Hex   string `json:"hex"`
	Valid bool   `json:"valid"`
}

// IPv4View represents IP address interpretation
type IPv4View struct {
	Address string `json:"address"`
	Type    string `json:"type"` // "normal", "broadcast", "multicast", "private"
}

// FileSizeView represents file size interpretation
type FileSizeView struct {
	Bytes int     `json:"bytes"`
	KB    float64 `json:"kb"`
	MB    float64 `json:"mb"`
	Human string  `json:"human"`
}

// TimestampView represents Unix timestamp interpretation
type TimestampView struct {
	DateTime string `json:"datetime"`
	Duration string `json:"duration"`
}

// NumberConverterService handles number conversions
type NumberConverterService struct{}

// NewNumberConverterService creates a new service
func NewNumberConverterService() *NumberConverterService {
	return &NumberConverterService{}
}

// Convert converts a number and returns all interpretations
func (s *NumberConverterService) Convert(req ConvertRequest) ConvertResponse {
	// Parse the input value based on base
	var num int64
	var err error

	base := strings.ToLower(req.Base)
	switch base {
	case "binary", "bin":
		num, err = strconv.ParseInt(req.Value, 2, 64)
	case "octal", "oct":
		num, err = strconv.ParseInt(req.Value, 8, 64)
	case "decimal", "dec":
		num, err = strconv.ParseInt(req.Value, 10, 64)
	case "hexadecimal", "hex":
		// Remove 0x prefix if present
		val := strings.TrimPrefix(req.Value, "0x")
		val = strings.TrimPrefix(val, "0X")
		num, err = strconv.ParseInt(val, 16, 64)
	default:
		return ConvertResponse{Error: fmt.Sprintf("unsupported base: %s", req.Base)}
	}

	if err != nil {
		return ConvertResponse{Error: fmt.Sprintf("invalid number: %v", err)}
	}

	return s.interpretNumber(num)
}

func (s *NumberConverterService) interpretNumber(num int64) ConvertResponse {
	resp := ConvertResponse{
		Binary:  strconv.FormatInt(num, 2),
		Decimal: strconv.FormatInt(num, 10),
		Hex:     fmt.Sprintf("0x%s", strings.ToUpper(strconv.FormatInt(num, 16))),
		Octal:   strconv.FormatInt(num, 8),
	}

	// Calculate bits (8-bit view for byte interpretation)
	resp.Bits = make([]int, 8)
	resp.BitValues = []int{128, 64, 32, 16, 8, 4, 2, 1}
	byteVal := num & 0xFF // Take only lower 8 bits
	for i := 0; i < 8; i++ {
		resp.Bits[i] = int((byteVal >> (7 - i)) & 1)
	}

	// Bytes (32-bit view)
	resp.Bytes = ByteView{
		BigEndian: []string{
			fmt.Sprintf("%02X", (num>>24)&0xFF),
			fmt.Sprintf("%02X", (num>>16)&0xFF),
			fmt.Sprintf("%02X", (num>>8)&0xFF),
			fmt.Sprintf("%02X", num&0xFF),
		},
		Highlighted: 3, // LSB
	}

	// ASCII (only valid for 0-255)
	if num >= 0 && num <= 255 {
		resp.ASCII = ASCIIView{
			Char:      string(rune(num)),
			Code:      int(num),
			Printable: num >= 32 && num <= 126,
		}

		// Color (as last byte of RGB)
		resp.Color = ColorView{
			Hex:   fmt.Sprintf("#0000%02X", num),
			Valid: true,
		}

		// Percentage of 255
		resp.Percentage = int(float64(num) / 255.0 * 100)

		// IPv4 (as last byte)
		ipType := "normal"
		if num == 255 {
			ipType = "broadcast"
		} else if num == 0 {
			ipType = "network"
		}
		resp.IPv4 = IPv4View{
			Address: fmt.Sprintf("0.0.0.%d", num),
			Type:    ipType,
		}
	}

	// File size (works for any number)
	resp.FileSize = FileSizeView{
		Bytes: int(num),
		KB:    float64(num) / 1024.0,
		MB:    float64(num) / (1024.0 * 1024.0),
		Human: s.formatFileSize(num),
	}

	// Unix timestamp
	if num >= 0 && num < 2147483647 { // Valid Unix timestamp range
		t := time.Unix(num, 0).UTC()
		resp.Timestamp = TimestampView{
			DateTime: t.Format("2006-01-02 15:04:05"),
			Duration: s.formatDuration(num),
		}
	}

	return resp
}

func (s *NumberConverterService) formatFileSize(bytes int64) string {
	if bytes < 1024 {
		return fmt.Sprintf("%d bytes", bytes)
	} else if bytes < 1024*1024 {
		return fmt.Sprintf("%.2f KB", float64(bytes)/1024)
	} else if bytes < 1024*1024*1024 {
		return fmt.Sprintf("%.2f MB", float64(bytes)/(1024*1024))
	}
	return fmt.Sprintf("%.2f GB", float64(bytes)/(1024*1024*1024))
}

func (s *NumberConverterService) formatDuration(seconds int64) string {
	if seconds < 60 {
		return fmt.Sprintf("%ds", seconds)
	} else if seconds < 3600 {
		return fmt.Sprintf("%dm %ds", seconds/60, seconds%60)
	} else if seconds < 86400 {
		return fmt.Sprintf("%dh %dm", seconds/3600, (seconds%3600)/60)
	}
	days := seconds / 86400
	return fmt.Sprintf("%dd", days)
}
