# Number Converter Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Number Converter with a compact 3-column layout showing practical number interpretations (bytes, ASCII, color, IP, file size, timestamp, percentage)

**Architecture:** Create backend service for number conversions and interpretations, then completely rewrite frontend with 3-column layout using compact cards

**Tech Stack:** Go (Wails v3), React, Lucide Icons

---

## File Structure

**Backend:**
- `internal/numberconverter/service.go` - Core conversion and interpretation logic (new)
- `service/numberconverter.go` - Wails binding layer (new)
- `main.go` - Register service (modify)
- `server.go` - Register for HTTP API (modify)

**Frontend:**
- `frontend/src/pages/NumberConverter/index.jsx` - Complete rewrite (modify)

---

## Task 1: Create Backend Service

**Files:**
- Create: `internal/numberconverter/service.go`

- [ ] **Step 1: Create the service file with types**

```go
package numberconverter

// ConvertRequest represents a number conversion request
type ConvertRequest struct {
	Value string `json:"value"`
	Base  string `json:"base"` // binary, octal, decimal, hex
}

// ConvertResponse represents all conversions and interpretations
type ConvertResponse struct {
	Binary      string     `json:"binary"`
	Decimal     string     `json:"decimal"`
	Hex         string     `json:"hex"`
	Octal       string     `json:"octal"`
	Bits        []int      `json:"bits"`        // 8 bits (0 or 1)
	BitValues   []int      `json:"bitValues"`   // [128, 64, 32, 16, 8, 4, 2, 1]
	Bytes       ByteView   `json:"bytes"`
	ASCII       ASCIIView  `json:"ascii"`
	Color       ColorView  `json:"color"`
	IPv4        IPv4View   `json:"ipv4"`
	FileSize    FileSizeView `json:"fileSize"`
	Timestamp   TimestampView `json:"timestamp"`
	Percentage  int        `json:"percentage"`
	Error       string     `json:"error,omitempty"`
}

// ByteView represents 4-byte integer view
type ByteView struct {
	BigEndian []string `json:"bigEndian"` // ["00", "00", "00", "FF"]
	Highlighted int    `json:"highlighted"` // which byte has the value (3 for 255)
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
```

- [ ] **Step 2: Add Convert method**

```go
package numberconverter

import (
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"
)

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
```

- [ ] **Step 3: Add number interpretation logic**

```go
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
```

- [ ] **Step 4: Commit the service**

```bash
git add internal/numberconverter/service.go
git commit -m "feat: add number converter backend service with interpretations"
```

---

## Task 2: Create Wails Service Binding

**Files:**
- Create: `service/numberconverter.go`

- [ ] **Step 1: Create Wails binding**

```go
package service

import (
	"context"
	"devtoolbox/internal/numberconverter"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// NumberConverterService is the Wails binding for number conversion
type NumberConverterService struct {
	app *application.App
	svc *numberconverter.NumberConverterService
}

// NewNumberConverterService creates a new service instance
func NewNumberConverterService(app *application.App) *NumberConverterService {
	return &NumberConverterService{
		app: app,
		svc: numberconverter.NewNumberConverterService(),
	}
}

// ServiceStartup is called when the app starts
func (n *NumberConverterService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	return nil
}

// Convert converts a number and returns all interpretations
func (n *NumberConverterService) Convert(req numberconverter.ConvertRequest) numberconverter.ConvertResponse {
	return n.svc.Convert(req)
}
```

- [ ] **Step 2: Commit the binding**

```bash
git add service/numberconverter.go
git commit -m "feat: add Wails binding for number converter service"
```

---

## Task 3: Register Service in Main Application

**Files:**
- Modify: `main.go`

- [ ] **Step 1: Register the service in main.go**

Find the section where other services are registered (around line 96-106) and add:

```go
// Around line 101, after other services
app.RegisterService(application.NewService(service.NewNumberConverterService(app)))
```

- [ ] **Step 2: Commit**

```bash
git add main.go
git commit -m "feat: register number converter service in main app"
```

---

## Task 4: Register Service in HTTP Server

**Files:**
- Modify: `server.go`

- [ ] **Step 1: Register in HTTP server**

Find the StartHTTPServer function and add the number converter service:

```go
func StartHTTPServer(port int) {
	// Existing services...
	jwtSvc := service.NewJWTService(nil)
	conversionSvc := service.NewConversionService(nil)
	barcodeSvc := service.NewBarcodeService(nil)
	dataGenSvc := service.NewDataGeneratorService(nil)
	codeFmtSvc := service.NewCodeFormatterService(nil)
	dateTimeSvc := service.NewDateTimeService(nil)
	
	// Add number converter
	numberConvSvc := service.NewNumberConverterService(nil)
	
	server := router.NewServer()
	// Existing registrations...
	server.Register(jwtSvc)
	server.Register(conversionSvc)
	server.Register(barcodeSvc)
	server.Register(dataGenSvc)
	server.Register(codeFmtSvc)
	server.Register(dateTimeSvc)
	
	// Add registration
	server.Register(numberConvSvc)
	
	server.Start(port)
}
```

- [ ] **Step 2: Commit**

```bash
git add server.go
git commit -m "feat: register number converter in HTTP server"
```

---

## Task 5: Rewrite Frontend - Component Structure

**Files:**
- Modify: `frontend/src/pages/NumberConverter/index.jsx`

- [ ] **Step 1: Clear the file and add imports**

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Dice5 } from 'lucide-react';
import { Convert } from '../../generated';
```

- [ ] **Step 2: Add helper functions**

```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function getRandomNumber() {
  return Math.floor(Math.random() * 1000000);
}
```

- [ ] **Step 3: Create main component structure**

```jsx
export default function NumberConverter() {
  const [input, setInput] = useState('255');
  const [base, setBase] = useState('decimal');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState({});

  const debouncedConvert = useCallback(
    debounce(async (value, currentBase) => {
      if (!value.trim()) {
        setResult(null);
        setError('');
        return;
      }

      try {
        const response = await Convert({
          value: value,
          base: currentBase,
        });

        if (response.error) {
          setError(response.error);
          setResult(null);
        } else {
          setResult(response);
          setError('');
        }
      } catch (err) {
        setError(err.message || 'Conversion failed');
        setResult(null);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedConvert(input, base);
  }, [input, base, debouncedConvert]);

  const handleCopy = (key, value) => {
    navigator.clipboard.writeText(value);
    setCopied({ ...copied, [key]: true });
    setTimeout(() => {
      setCopied({ ...copied, [key]: false });
    }, 2000);
  };

  const handleRandom = () => {
    const num = getRandomNumber();
    setInput(num.toString());
  };

  const bases = [
    { id: 'binary', label: 'BIN', name: 'Binary' },
    { id: 'octal', label: 'OCT', name: 'Octal' },
    { id: 'decimal', label: 'DEC', name: 'Decimal' },
    { id: 'hex', label: 'HEX', name: 'Hex' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '24px',
      overflow: 'hidden',
      backgroundColor: '#09090b',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#f4f4f5', margin: '0 0 4px 0' }}>
          Number Converter
        </h2>
        <p style={{ color: '#a1a1aa', fontSize: '12px', margin: 0 }}>
          Convert and interpret numbers in different contexts
        </p>
        <hr style={{ border: 'none', borderTop: '1px solid #27272a', margin: '12px 0' }} />
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter number..."
          style={{
            flex: 1,
            backgroundColor: error ? 'rgba(239, 68, 68, 0.1)' : '#18181b',
            border: error ? '1px solid #ef4444' : '1px solid #3b82f6',
            borderRadius: '6px',
            padding: '10px 12px',
            color: '#f4f4f5',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleRandom}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#27272a',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#a1a1aa',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          <Dice5 size={14} />
          Random
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '6px',
          color: '#ef4444',
          fontSize: '12px',
          marginBottom: '12px',
        }}>
          {error}
        </div>
      )}

      {/* 3 Column Layout */}
      {result && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px',
          flex: 1,
          overflow: 'auto',
        }}>
          {/* Column 1: Number Bases */}
          <Column1Bases result={result} base={base} copied={copied} onCopy={handleCopy} />
          
          {/* Column 2: Data Representation */}
          <Column2Data result={result} copied={copied} onCopy={handleCopy} />
          
          {/* Column 3: Network & Time */}
          <Column3Context result={result} copied={copied} onCopy={handleCopy} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit progress**

```bash
git add frontend/src/pages/NumberConverter/index.jsx
git commit -m "wip: add number converter main component structure"
```

---

## Task 6: Add Column 1 - Number Bases

**Files:**
- Modify: `frontend/src/pages/NumberConverter/index.jsx`

- [ ] **Step 1: Add Column1Bases component**

```jsx
function Column1Bases({ result, base, copied, onCopy }) {
  const bases = [
    { id: 'binary', label: 'Binary', value: result.binary },
    { id: 'decimal', label: 'Decimal', value: result.decimal, active: base === 'decimal' },
    { id: 'hex', label: 'Hex', value: result.hex },
    { id: 'octal', label: 'Octal', value: result.octal },
  ];

  return (
    <div>
      <h4 style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>
        Number Bases
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {bases.map((b) => (
          <div
            key={b.id}
            onClick={() => onCopy(b.id, b.value)}
            style={{
              backgroundColor: '#18181b',
              padding: '8px 10px',
              borderRadius: '6px',
              border: b.active ? '1px solid #3b82f6' : '1px solid #27272a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
          >
            <span style={{ fontSize: '10px', color: b.active ? '#3b82f6' : '#71717a', textTransform: 'uppercase' }}>
              {b.label}
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', color: '#f4f4f5' }}>
              {b.value}
            </span>
          </div>
        ))}
      </div>

      {/* Bit Breakdown */}
      <h4 style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', margin: '12px 0 6px 0', letterSpacing: '0.05em' }}>
        Bit Values
      </h4>
      <div style={{ backgroundColor: '#18181b', padding: '8px', borderRadius: '6px', border: '1px solid #27272a' }}>
        <div style={{ display: 'flex', gap: '1px', marginBottom: '6px' }}>
          {result.bits && result.bits.map((bit, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                backgroundColor: bit === 1 ? 'rgba(59,130,246,0.2)' : 'rgba(24,24,27,0.4)',
                borderRadius: '2px',
                padding: '3px 0',
                marginBottom: '2px',
              }}>
                <span style={{
                  fontSize: '10px',
                  color: bit === 1 ? '#3b82f6' : 'rgba(113,113,122,0.3)',
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>
                  {bit}
                </span>
              </div>
              <span style={{ fontSize: '8px', color: '#71717a' }}>
                {result.bitValues[i]}
              </span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '10px', color: '#a1a1aa', textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace" }}>
          {result.bitValues.filter((_, i) => result.bits[i] === 1).join('+')}
          ={result.decimal}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/NumberConverter/index.jsx
git commit -m "feat: add column 1 with number bases and bit breakdown"
```

---

## Task 7: Add Column 2 - Data Representation

**Files:**
- Modify: `frontend/src/pages/NumberConverter/index.jsx`

- [ ] **Step 1: Add Column2Data component**

```jsx
function Column2Data({ result, copied, onCopy }) {
  return (
    <div>
      {/* Bytes */}
      <h4 style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>
        As Bytes
      </h4>
      <div style={{ backgroundColor: '#18181b', padding: '10px', borderRadius: '6px', border: '1px solid #27272a', marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
          {result.bytes.bigEndian.map((byte, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor: i === result.bytes.highlighted ? 'rgba(59,130,246,0.2)' : '#27272a',
                padding: '6px',
                borderRadius: '4px',
                textAlign: 'center',
                border: i === result.bytes.highlighted ? '1px solid rgba(59,130,246,0.4)' : 'none',
              }}
            >
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: i === result.bytes.highlighted ? '#3b82f6' : '#f4f4f5' }}>
                {byte}
              </div>
              <div style={{ fontSize: '8px', color: '#71717a', marginTop: '2px' }}>
                {i === 0 ? 'MSB' : i === 3 ? 'LSB' : ''}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '10px', color: '#71717a', textAlign: 'center' }}>
          32-bit big-endian
        </div>
      </div>

      {/* ASCII */}
      {result.ascii && result.ascii.code !== undefined && (
        <>
          <h4 style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', margin: '10px 0 6px 0', letterSpacing: '0.05em' }}>
            As ASCII
          </h4>
          <div style={{ backgroundColor: '#18181b', padding: '10px', borderRadius: '6px', border: '1px solid #27272a', marginBottom: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', color: '#f4f4f5', fontFamily: "'IBM Plex Mono', monospace", marginBottom: '4px' }}>
              {result.ascii.printable ? result.ascii.char : '•'}
            </div>
            <div style={{ fontSize: '10px', color: '#71717a' }}>
              Code {result.ascii.code} {result.ascii.printable ? '' : '(non-printable)'}
            </div>
          </div>
        </>
      )}

      {/* Color */}
      {result.color && result.color.valid && (
        <>
          <h4 style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', margin: '10px 0 6px 0', letterSpacing: '0.05em' }}>
            As Color
          </h4>
          <div style={{ backgroundColor: '#18181b', padding: '8px', borderRadius: '6px', border: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              backgroundColor: result.color.hex,
              borderRadius: '4px',
              border: '2px solid #27272a',
            }} />
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#f4f4f5' }}>
                {result.color.hex}
              </div>
              <div style={{ fontSize: '9px', color: '#71717a' }}>
                RGB blue channel
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/NumberConverter/index.jsx
git commit -m "feat: add column 2 with bytes, ASCII, and color"
```

---

## Task 8: Add Column 3 - Network & Time Context

**Files:**
- Modify: `frontend/src/pages/NumberConverter/index.jsx`

- [ ] **Step 1: Add Column3Context component**

```jsx
function Column3Context({ result, copied, onCopy }) {
  return (
    <div>
      {/* IPv4 */}
      {result.ipv4 && result.ipv4.address && (
        <>
          <h4 style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>
            As IPv4
          </h4>
          <div style={{ backgroundColor: '#18181b', padding: '10px', borderRadius: '6px', border: '1px solid #27272a', marginBottom: '10px' }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', color: '#f4f4f5', textAlign: 'center' }}>
              {result.ipv4.address}
            </div>
            <div style={{ fontSize: '9px', color: '#71717a', textAlign: 'center', marginTop: '4px' }}>
              {result.ipv4.type === 'broadcast' ? 'Broadcast address' : 
               result.ipv4.type === 'network' ? 'Network address' : 
               'Last octet only'}
            </div>
          </div>
        </>
      )}

      {/* File Size */}
      <h4 style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', margin: '10px 0 6px 0', letterSpacing: '0.05em' }}>
        As File Size
      </h4>
      <div style={{ backgroundColor: '#18181b', padding: '10px', borderRadius: '6px', border: '1px solid #27272a', marginBottom: '10px' }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', color: '#f4f4f5', textAlign: 'center' }}>
          {result.fileSize.human}
        </div>
        <div style={{ fontSize: '9px', color: '#71717a', textAlign: 'center', marginTop: '4px' }}>
          {result.fileSize.kb.toFixed(2)} KB · {result.fileSize.mb.toFixed(5)} MB
        </div>
      </div>

      {/* Unix Timestamp */}
      {result.timestamp && result.timestamp.datetime && (
        <>
          <h4 style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', margin: '10px 0 6px 0', letterSpacing: '0.05em' }}>
            As Unix Time
          </h4>
          <div style={{ backgroundColor: '#18181b', padding: '10px', borderRadius: '6px', border: '1px solid #27272a', marginBottom: '10px' }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#f4f4f5', textAlign: 'center' }}>
              {result.timestamp.datetime}
            </div>
            <div style={{ fontSize: '9px', color: '#71717a', textAlign: 'center', marginTop: '4px' }}>
              {result.timestamp.duration} since epoch
            </div>
          </div>
        </>
      )}

      {/* Percentage */}
      {result.percentage !== undefined && (
        <>
          <h4 style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', margin: '10px 0 6px 0', letterSpacing: '0.05em' }}>
            As Percentage
          </h4>
          <div style={{ backgroundColor: '#18181b', padding: '10px', borderRadius: '6px', border: '1px solid #27272a' }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', color: '#f4f4f5', textAlign: 'center' }}>
              {result.percentage}%
            </div>
            <div style={{ fontSize: '9px', color: '#71717a', textAlign: 'center', marginTop: '4px' }}>
              of 8-bit max (255)
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/NumberConverter/index.jsx
git commit -m "feat: add column 3 with IP, file size, timestamp, and percentage"
```

---

## Task 9: Build and Test

**Files:**
- Test entire application

- [ ] **Step 1: Build the application**

```bash
cd /Users/vuong/workspace/vuon9/devtoolbox
go build -o bin/devtoolbox .
```

Expected: Build completes without errors

- [ ] **Step 2: Run tests**

```bash
go test ./internal/numberconverter/... -v
```

Expected: All tests pass

- [ ] **Step 3: Test manually**

Run the app and verify:
1. Enter "255" - all 3 columns show correct data
2. Click "Random" - generates random number and converts
3. Check all interpretations are accurate
4. Bit breakdown shows 8 bits with values
5. Color shows blue for #0000FF
6. IPv4 shows 0.0.0.255 as broadcast
7. File size shows 255 bytes
8. Timestamp shows 1970 date
9. Percentage shows 100%

- [ ] **Step 4: Final commit**

```bash
git commit -m "test: verify number converter functionality"
```

---

## Success Criteria Verification

- [ ] ✅ 3-column compact layout with no wasted space
- [ ] ✅ All number bases shown (binary, decimal, hex, octal)
- [ ] ✅ Bit breakdown with decimal values (128, 64, 32, etc.)
- [ ] ✅ Byte representation (4-byte view)
- [ ] ✅ ASCII character display
- [ ] ✅ Color preview (for 0-255 values)
- [ ] ✅ IPv4 address interpretation
- [ ] ✅ File size human-readable format
- [ ] ✅ Unix timestamp conversion
- [ ] ✅ Percentage of 255
- [ ] ✅ Random number generator button
- [ ] ✅ Error handling for invalid input

---

## Plan Complete

**Plan saved to:** `docs/superpowers/plans/2026-03-29-number-converter-implementation.md`

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach would you like to use?**
