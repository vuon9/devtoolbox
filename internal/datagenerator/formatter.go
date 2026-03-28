package datagenerator

import (
	"encoding/csv"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"strings"

	"gopkg.in/yaml.v3"
)

// Formatter handles output formatting for different formats
type Formatter struct{}

// NewFormatter creates a new formatter
func NewFormatter() *Formatter {
	return &Formatter{}
}

// Format formats the generated data according to the specified format
func (f *Formatter) Format(data []string, format string, separator string) (string, error) {
	switch strings.ToLower(format) {
	case "json":
		return f.formatJSON(data)
	case "xml":
		return f.formatXML(data)
	case "csv":
		return f.formatCSV(data)
	case "tsv":
		return f.formatTSV(data)
	case "yaml":
		return f.formatYAML(data)
	case "raw", "":
		return f.formatRaw(data, separator)
	default:
		return "", ErrInvalidFormat
	}
}

// formatJSON formats data as JSON array
func (f *Formatter) formatJSON(data []string) (string, error) {
	// Try to parse each item as JSON and combine into array
	var items []interface{}
	for _, item := range data {
		var obj interface{}
		if err := json.Unmarshal([]byte(item), &obj); err != nil {
			// If not valid JSON, treat as string
			items = append(items, item)
		} else {
			items = append(items, obj)
		}
	}

	result, err := json.MarshalIndent(items, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to format JSON: %w", err)
	}

	return string(result), nil
}

// formatXML formats data as XML
func (f *Formatter) formatXML(data []string) (string, error) {
	type Item struct {
		Value string `xml:",cdata"`
	}
	type Items struct {
		XMLName xml.Name `xml:"items"`
		Item    []Item   `xml:"item"`
	}

	items := Items{
		Item: make([]Item, len(data)),
	}
	for i, d := range data {
		items.Item[i] = Item{Value: d}
	}

	result, err := xml.MarshalIndent(items, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to format XML: %w", err)
	}

	return xml.Header + string(result), nil
}

// formatCSV formats data as CSV with headers
func (f *Formatter) formatCSV(data []string) (string, error) {
	if len(data) == 0 {
		return "", nil
	}

	var buf strings.Builder
	writer := csv.NewWriter(&buf)

	// Parse first item to get headers
	var firstItem map[string]interface{}
	if err := json.Unmarshal([]byte(data[0]), &firstItem); err != nil {
		// If not valid JSON, fall back to single column
		for _, item := range data {
			if err := writer.Write([]string{item}); err != nil {
				return "", fmt.Errorf("failed to format CSV: %w", err)
			}
		}
		writer.Flush()
		return buf.String(), nil
	}

	// Extract headers in order
	headers := make([]string, 0, len(firstItem))
	for key := range firstItem {
		headers = append(headers, key)
	}

	// Write headers
	if err := writer.Write(headers); err != nil {
		return "", fmt.Errorf("failed to write CSV headers: %w", err)
	}

	// Write data rows
	for _, item := range data {
		var obj map[string]interface{}
		if err := json.Unmarshal([]byte(item), &obj); err != nil {
			return "", fmt.Errorf("failed to parse JSON for CSV: %w", err)
		}

		row := make([]string, len(headers))
		for i, key := range headers {
			if val, ok := obj[key]; ok {
				row[i] = fmt.Sprintf("%v", val)
			}
		}

		if err := writer.Write(row); err != nil {
			return "", fmt.Errorf("failed to write CSV row: %w", err)
		}
	}

	writer.Flush()
	return buf.String(), nil
}

// formatTSV formats data as TSV (tab-separated values) with headers
func (f *Formatter) formatTSV(data []string) (string, error) {
	if len(data) == 0 {
		return "", nil
	}

	// Parse first item to get headers
	var firstItem map[string]interface{}
	if err := json.Unmarshal([]byte(data[0]), &firstItem); err != nil {
		// If not valid JSON, fall back to single column
		var result strings.Builder
		for _, item := range data {
			result.WriteString(item)
			result.WriteString("\n")
		}
		return result.String(), nil
	}

	// Extract headers in order
	headers := make([]string, 0, len(firstItem))
	for key := range firstItem {
		headers = append(headers, key)
	}

	var result strings.Builder

	// Write headers
	result.WriteString(strings.Join(headers, "\t"))
	result.WriteString("\n")

	// Write data rows
	for _, item := range data {
		var obj map[string]interface{}
		if err := json.Unmarshal([]byte(item), &obj); err != nil {
			return "", fmt.Errorf("failed to parse JSON for TSV: %w", err)
		}

		row := make([]string, len(headers))
		for i, key := range headers {
			if val, ok := obj[key]; ok {
				row[i] = fmt.Sprintf("%v", val)
			}
		}

		result.WriteString(strings.Join(row, "\t"))
		result.WriteString("\n")
	}

	return result.String(), nil
}

// formatYAML formats data as YAML
func (f *Formatter) formatYAML(data []string) (string, error) {
	result, err := yaml.Marshal(data)
	if err != nil {
		return "", fmt.Errorf("failed to format YAML: %w", err)
	}

	return string(result), nil
}

// formatRaw returns data as-is, joined by separator
func (f *Formatter) formatRaw(data []string, separator string) (string, error) {
	var sep string
	switch separator {
	case "comma":
		sep = ","
	case "tab":
		sep = "\t"
	case "none":
		sep = ""
	case "newline":
		sep = "\n"
	default:
		// Custom separator (can be any string like " | " or ";;")
		sep = separator
	}
	return strings.Join(data, sep), nil
}

// PrettyPrint attempts to pretty print the data if it's valid JSON
func (f *Formatter) PrettyPrint(data string) (string, error) {
	var obj interface{}
	if err := json.Unmarshal([]byte(data), &obj); err != nil {
		// Not JSON, return as-is
		return data, nil
	}

	result, err := json.MarshalIndent(obj, "", "  ")
	if err != nil {
		return data, nil
	}

	return string(result), nil
}
