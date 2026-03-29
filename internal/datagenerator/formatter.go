package datagenerator

import (
	"encoding/csv"
	"encoding/json"
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
	case "raw":
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

// formatXML formats data as XML with proper elements
func (f *Formatter) formatXML(data []string) (string, error) {
	if len(data) == 0 {
		return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<items></items>", nil
	}

	var buf strings.Builder
	buf.WriteString("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<items>\n")

	for _, item := range data {
		var obj map[string]interface{}
		if err := json.Unmarshal([]byte(item), &obj); err != nil {
			// If not valid JSON, treat as simple value element
			strVal := item
			strVal = strings.ReplaceAll(strVal, "&", "&amp;")
			strVal = strings.ReplaceAll(strVal, "<", "&lt;")
			strVal = strings.ReplaceAll(strVal, ">", "&gt;")
			strVal = strings.ReplaceAll(strVal, "\"", "&quot;")
			strVal = strings.ReplaceAll(strVal, "'", "&apos;")
			buf.WriteString("  <item>")
			buf.WriteString(strVal)
			buf.WriteString("</item>\n")
			continue
		}

		buf.WriteString("  <item>\n")
		for key, val := range obj {
			// Escape XML special characters
			strVal := fmt.Sprintf("%v", val)
			strVal = strings.ReplaceAll(strVal, "&", "&amp;")
			strVal = strings.ReplaceAll(strVal, "<", "&lt;")
			strVal = strings.ReplaceAll(strVal, ">", "&gt;")
			strVal = strings.ReplaceAll(strVal, "\"", "&quot;")
			strVal = strings.ReplaceAll(strVal, "'", "&apos;")
			buf.WriteString(fmt.Sprintf("    <%s>%s</%s>\n", key, strVal, key))
		}
		buf.WriteString("  </item>\n")
	}

	buf.WriteString("</items>")
	return buf.String(), nil
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
	if len(data) == 0 {
		return "", nil
	}

	// Try to parse each item as JSON, fall back to treating as simple strings
	var items []interface{}
	for _, item := range data {
		var obj map[string]interface{}
		if err := json.Unmarshal([]byte(item), &obj); err != nil {
			// If not valid JSON, treat as simple string value
			items = append(items, item)
		} else {
			items = append(items, obj)
		}
	}

	result, err := yaml.Marshal(items)
	if err != nil {
		return "", fmt.Errorf("failed to format YAML: %w", err)
	}

	return string(result), nil
}

// formatRaw formats data as "key: value" lines, one record per block
func (f *Formatter) formatRaw(data []string, separator string) (string, error) {
	if len(data) == 0 {
		return "", nil
	}

	var buf strings.Builder

	// Map separator names to actual separator strings
	sep := "\n\n" // default: double newline between records
	switch strings.ToLower(separator) {
	case "newline":
		sep = "\n"
	case "comma":
		sep = ","
	case "tab":
		sep = "\t"
	case "none":
		sep = ""
	default:
		// Use the separator as-is if it's not a named separator
		if separator != "" {
			sep = separator
		}
	}

	for i, item := range data {
		var obj map[string]interface{}
		if err := json.Unmarshal([]byte(item), &obj); err != nil {
			// If not valid JSON, just output the string
			buf.WriteString(item)
			if i < len(data)-1 {
				buf.WriteString(sep)
			}
			continue
		}

		// Output as "key: value" format
		for key, val := range obj {
			buf.WriteString(fmt.Sprintf("%s: %v\n", key, val))
		}

		// Add separator between records
		if i < len(data)-1 {
			buf.WriteString(sep)
		}
	}

	return buf.String(), nil
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
