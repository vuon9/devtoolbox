package converter

import (
	"encoding/base64"
	"encoding/csv"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"github.com/gomarkdown/markdown"
	"github.com/pelletier/go-toml/v2"
	"gopkg.in/yaml.v3"
)

type formattingConverter struct{}

func NewFormattingConverter() ConverterService {
	return &formattingConverter{}
}

func (c *formattingConverter) Convert(req ConversionRequest) (string, error) {
	method := strings.ToLower(req.Method)

	switch {
	case method == "json ↔ yaml" || method == "json -> yaml" || method == "yaml -> json":
		// Auto-detect or use specific direction if we implement it.
		// For now, let's try JSON first, then YAML.
		var obj interface{}
		if err := json.Unmarshal([]byte(req.Input), &obj); err == nil {
			res, _ := yaml.Marshal(obj)
			return string(res), nil
		}
		if err := yaml.Unmarshal([]byte(req.Input), &obj); err == nil {
			res, _ := json.MarshalIndent(obj, "", "  ")
			return string(res), nil
		}
		return "", fmt.Errorf("invalid JSON or YAML")

	case method == "yaml ↔ toml":
		var obj interface{}
		if err := yaml.Unmarshal([]byte(req.Input), &obj); err == nil {
			res, _ := toml.Marshal(obj)
			return string(res), nil
		}
		if err := toml.Unmarshal([]byte(req.Input), &obj); err == nil {
			res, _ := yaml.Marshal(obj)
			return string(res), nil
		}
		return "", fmt.Errorf("invalid YAML or TOML")

	case method == "json ↔ xml":
		// Try to detect if input is JSON or XML
		input := strings.TrimSpace(req.Input)

		// Check if input looks like XML (starts with <)
		if strings.HasPrefix(input, "<") {
			// XML to JSON
			return xmlToJSON(input)
		}

		// Assume JSON to XML
		return jsonToXML(input)

	case method == "markdown ↔ html":
		// Markdown to HTML is easier
		output := markdown.ToHTML([]byte(req.Input), nil, nil)
		return string(output), nil

	case method == "json ↔ csv / tsv" || method == "csv -> json":
		r := csv.NewReader(strings.NewReader(req.Input))
		headers, err := r.Read()
		if err != nil {
			return "", err
		}
		var result []map[string]string
		for {
			row, err := r.Read()
			if err == io.EOF {
				break
			}
			if err != nil {
				return "", err
			}
			item := make(map[string]string)
			for i, v := range row {
				if i < len(headers) {
					item[headers[i]] = v
				}
			}
			result = append(result, item)
		}
		res, _ := json.MarshalIndent(result, "", "  ")
		return string(res), nil

	case method == "csv ↔ tsv":
		// Detect input format and convert
		if strings.Contains(req.Input, "\t") {
			// TSV to CSV
			return convertTSVToCSV(req.Input)
		}
		// CSV to TSV
		return convertCSVToTSV(req.Input)

	case method == "key-value ↔ query string":
		// Try to detect format
		if strings.Contains(req.Input, "=") && (strings.Contains(req.Input, "&") || strings.Contains(req.Input, "?")) {
			// Query string to Key-Value
			return queryStringToKeyValue(req.Input)
		}
		// Key-Value to Query String
		return keyValueToQueryString(req.Input)

	case method == "number bases":
		// Assume Input is decimal for now, convert to Hex/Binary/Octal
		val, err := strconv.ParseInt(req.Input, 10, 64)
		if err != nil {
			return "", err
		}
		return fmt.Sprintf("Hex: %x\nBinary: %b\nOctal: %o", val, val, val), nil

	case method == "case swapping":
		// Implement basic case swap
		var res strings.Builder
		for _, r := range req.Input {
			if strings.ToUpper(string(r)) == string(r) {
				res.WriteString(strings.ToLower(string(r)))
			} else {
				res.WriteString(strings.ToUpper(string(r)))
			}
		}
		return res.String(), nil

	case strings.Contains(method, "properties"):
		// Properties file format (Java .properties)
		// Try to detect format: if it contains "key=value" or "key: value" format
		if isPropertiesFormat(req.Input) {
			return propertiesToJSON(req.Input)
		}
		// Assume it's JSON to Properties
		return jsonToProperties(req.Input)

	case strings.Contains(method, "ini"):
		// INI file format
		// Try to detect format: if it contains [section] headers
		if isINIFormat(req.Input) {
			return iniToJSON(req.Input)
		}
		// Assume it's JSON to INI
		return jsonToINI(req.Input)

	case method == "curl ↔ fetch":
		// Detect input format and convert bidirectionally
		input := strings.TrimSpace(req.Input)
		if strings.HasPrefix(strings.ToLower(input), "curl") {
			return curlToFetch(input)
		}
		return fetchToCurl(input)

	case method == "cron ↔ text":
		// Detect input format and convert bidirectionally
		input := strings.TrimSpace(req.Input)
		// Check if input looks like a cron expression (5 fields separated by spaces)
		if isCronExpression(input) {
			return cronToText(input)
		}
		return textToCron(input)

	case strings.Contains(method, "color"):
		return convertColor(req.Input)
	}

	return "", fmt.Errorf("formatting method %s not supported", req.Method)
}

// TSV to CSV conversion
func convertTSVToCSV(input string) (string, error) {
	reader := csv.NewReader(strings.NewReader(input))
	reader.Comma = '\t'
	reader.LazyQuotes = true

	var records [][]string
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", fmt.Errorf("error reading TSV: %w", err)
		}
		records = append(records, record)
	}

	var output strings.Builder
	writer := csv.NewWriter(&output)
	for _, record := range records {
		if err := writer.Write(record); err != nil {
			return "", fmt.Errorf("error writing CSV: %w", err)
		}
	}
	writer.Flush()
	return output.String(), nil
}

// CSV to TSV conversion
func convertCSVToTSV(input string) (string, error) {
	reader := csv.NewReader(strings.NewReader(input))
	reader.LazyQuotes = true

	var records [][]string
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", fmt.Errorf("error reading CSV: %w", err)
		}
		records = append(records, record)
	}

	var output strings.Builder
	for i, record := range records {
		if i > 0 {
			output.WriteString("\n")
		}
		for j, field := range record {
			if j > 0 {
				output.WriteString("\t")
			}
			// Handle fields that contain tabs or newlines by quoting them
			if strings.ContainsAny(field, "\t\n\r") {
				output.WriteString(fmt.Sprintf("%q", field))
			} else {
				output.WriteString(field)
			}
		}
	}
	return output.String(), nil
}

// Query string to Key-Value format
func queryStringToKeyValue(input string) (string, error) {
	// Remove leading ? if present
	input = strings.TrimPrefix(input, "?")

	values, err := url.ParseQuery(input)
	if err != nil {
		return "", fmt.Errorf("invalid query string: %w", err)
	}

	var result strings.Builder
	first := true
	for key, vals := range values {
		for _, val := range vals {
			if !first {
				result.WriteString("\n")
			}
			first = false
			result.WriteString(fmt.Sprintf("%s=%s", key, val))
		}
	}
	return result.String(), nil
}

// Key-Value format to Query string
func keyValueToQueryString(input string) (string, error) {
	lines := strings.Split(input, "\n")
	values := url.Values{}

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			return "", fmt.Errorf("invalid key-value format: %s", line)
		}

		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		values.Add(key, val)
	}

	return values.Encode(), nil
}

// Properties file detection
func isPropertiesFormat(input string) bool {
	lines := strings.Split(input, "\n")
	propCount := 0
	jsonCount := 0

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") || strings.HasPrefix(line, "!") {
			continue
		}
		if strings.Contains(line, "=") || strings.Contains(line, ":") {
			propCount++
		}
		if strings.Contains(line, "{") || strings.Contains(line, "}") || strings.Contains(line, "[") {
			jsonCount++
		}
	}

	return propCount > jsonCount
}

// Properties to JSON conversion
func propertiesToJSON(input string) (string, error) {
	result := make(map[string]string)
	lines := strings.Split(input, "\n")

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") || strings.HasPrefix(line, "!") {
			continue
		}

		// Split on first = or :
		var parts []string
		if idx := strings.Index(line, "="); idx != -1 {
			parts = []string{line[:idx], line[idx+1:]}
		} else if idx := strings.Index(line, ":"); idx != -1 {
			parts = []string{line[:idx], line[idx+1:]}
		} else {
			continue
		}

		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])

		// Handle escape sequences
		val = unescapeProperties(val)

		result[key] = val
	}

	output, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to marshal JSON: %w", err)
	}
	return string(output), nil
}

// JSON to Properties conversion
func jsonToProperties(input string) (string, error) {
	var data map[string]interface{}
	if err := json.Unmarshal([]byte(input), &data); err != nil {
		return "", fmt.Errorf("invalid JSON: %w", err)
	}

	var result strings.Builder
	first := true
	for key, val := range data {
		if !first {
			result.WriteString("\n")
		}
		first = false
		valueStr := fmt.Sprintf("%v", val)
		// Escape special characters
		valueStr = escapeProperties(valueStr)
		result.WriteString(fmt.Sprintf("%s=%s", key, valueStr))
	}
	return result.String(), nil
}

// INI file detection
func isINIFormat(input string) bool {
	return strings.Contains(input, "[") && strings.Contains(input, "]")
}

// INI to JSON conversion
func iniToJSON(input string) (string, error) {
	result := make(map[string]map[string]string)
	lines := strings.Split(input, "\n")
	currentSection := ""

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, ";") || strings.HasPrefix(line, "#") {
			continue
		}

		// Check for section header
		if strings.HasPrefix(line, "[") && strings.HasSuffix(line, "]") {
			currentSection = line[1 : len(line)-1]
			if _, exists := result[currentSection]; !exists {
				result[currentSection] = make(map[string]string)
			}
			continue
		}

		// Parse key=value
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			val := strings.TrimSpace(parts[1])

			if currentSection == "" {
				// Global section - use empty string or "global"
				currentSection = "global"
				if _, exists := result[currentSection]; !exists {
					result[currentSection] = make(map[string]string)
				}
			}

			result[currentSection][key] = val
		}
	}

	output, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to marshal JSON: %w", err)
	}
	return string(output), nil
}

// JSON to INI conversion
func jsonToINI(input string) (string, error) {
	var data map[string]map[string]string
	if err := json.Unmarshal([]byte(input), &data); err != nil {
		// Try flat structure
		var flatData map[string]string
		if err2 := json.Unmarshal([]byte(input), &flatData); err2 != nil {
			return "", fmt.Errorf("invalid JSON format: %w", err)
		}
		// Convert flat to nested
		data = map[string]map[string]string{"global": flatData}
	}

	var result strings.Builder
	first := true

	for section, keys := range data {
		if !first {
			result.WriteString("\n")
		}
		first = false

		if section != "" && section != "global" {
			result.WriteString(fmt.Sprintf("[%s]\n", section))
		}

		for key, val := range keys {
			result.WriteString(fmt.Sprintf("%s=%s\n", key, val))
		}
	}

	return strings.TrimSpace(result.String()), nil
}

// Escape special characters for properties file
func escapeProperties(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, "\n", "\\n")
	s = strings.ReplaceAll(s, "\r", "\\r")
	s = strings.ReplaceAll(s, "\t", "\\t")
	s = strings.ReplaceAll(s, "=", "\\=")
	s = strings.ReplaceAll(s, ":", "\\:")
	s = strings.ReplaceAll(s, "#", "\\#")
	s = strings.ReplaceAll(s, "!", "\\!")
	return s
}

// Unescape special characters from properties file
func unescapeProperties(s string) string {
	result := strings.Builder{}
	escape := false

	for i := 0; i < len(s); i++ {
		c := s[i]
		if escape {
			switch c {
			case 'n':
				result.WriteByte('\n')
			case 'r':
				result.WriteByte('\r')
			case 't':
				result.WriteByte('\t')
			default:
				result.WriteByte(c)
			}
			escape = false
		} else if c == '\\' && i+1 < len(s) {
			escape = true
		} else {
			result.WriteByte(c)
		}
	}

	return result.String()
}

// XML to JSON conversion
func xmlToJSON(input string) (string, error) {
	// Simple XML parsing - decode XML to a generic structure
	var root xmlNode
	if err := xml.Unmarshal([]byte(input), &root); err != nil {
		return "", fmt.Errorf("invalid XML: %w", err)
	}

	// Convert to a simple map structure
	result := xmlNodeToMap(&root)

	output, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to marshal JSON: %w", err)
	}
	return string(output), nil
}

// JSON to XML conversion
func jsonToXML(input string) (string, error) {
	var data interface{}
	if err := json.Unmarshal([]byte(input), &data); err != nil {
		return "", fmt.Errorf("invalid JSON: %w", err)
	}

	// Create XML structure
	root := mapToXMLNode("root", data)

	output, err := xml.MarshalIndent(root, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to marshal XML: %w", err)
	}

	// Add XML header
	return xml.Header + string(output), nil
}

// xmlNode represents a generic XML node
type xmlNode struct {
	XMLName  xml.Name   `xml:"-"`
	Attrs    []xml.Attr `xml:"-"`
	Content  string     `xml:",chardata"`
	Children []xmlNode  `xml:",any"`
}

func (n *xmlNode) UnmarshalXML(d *xml.Decoder, start xml.StartElement) error {
	n.XMLName = start.Name
	n.Attrs = start.Attr

	for {
		token, err := d.Token()
		if err != nil {
			return err
		}

		switch t := token.(type) {
		case xml.StartElement:
			var child xmlNode
			if err := d.DecodeElement(&child, &t); err != nil {
				return err
			}
			n.Children = append(n.Children, child)
		case xml.EndElement:
			return nil
		case xml.CharData:
			n.Content += string(t)
		}
	}
}

func (n xmlNode) MarshalXML(e *xml.Encoder, start xml.StartElement) error {
	start.Name = n.XMLName
	start.Attr = n.Attrs

	if len(n.Children) == 0 {
		// Leaf node with just content
		return e.EncodeElement(n.Content, start)
	}

	return e.EncodeElement(struct {
		Children []xmlNode `xml:",any"`
	}{Children: n.Children}, start)
}

// Convert xmlNode to a map for JSON output
func xmlNodeToMap(n *xmlNode) interface{} {
	if len(n.Children) == 0 {
		// Leaf node
		content := strings.TrimSpace(n.Content)
		if content == "" {
			return nil
		}
		return content
	}

	// Build map from children
	result := make(map[string]interface{})

	for _, child := range n.Children {
		name := child.XMLName.Local
		value := xmlNodeToMap(&child)

		if existing, ok := result[name]; ok {
			// Multiple children with same name - convert to array
			switch v := existing.(type) {
			case []interface{}:
				result[name] = append(v, value)
			default:
				result[name] = []interface{}{v, value}
			}
		} else {
			result[name] = value
		}
	}

	return result
}

// Convert map to xmlNode for XML output
func mapToXMLNode(name string, data interface{}) *xmlNode {
	n := &xmlNode{
		XMLName: xml.Name{Local: name},
	}

	switch v := data.(type) {
	case map[string]interface{}:
		for key, val := range v {
			child := mapToXMLNode(key, val)
			n.Children = append(n.Children, *child)
		}
	case []interface{}:
		for _, val := range v {
			child := mapToXMLNode(name, val)
			n.Children = append(n.Children, *child)
		}
	case string:
		n.Content = v
	case float64:
		n.Content = strconv.FormatFloat(v, 'f', -1, 64)
	case bool:
		n.Content = strconv.FormatBool(v)
	case nil:
		n.Content = ""
	default:
		n.Content = fmt.Sprintf("%v", v)
	}

	return n
}

// curlToFetch converts a curl command to JavaScript Fetch API code
func curlToFetch(input string) (string, error) {
	// Parse curl command - simplified parser for common options
	input = strings.TrimSpace(input)

	// Extract URL
	url := ""
	method := "GET"
	headers := make(map[string]string)
	var body string
	var username, password string

	// Simple tokenization to parse curl command
	tokens := tokenizeCurl(input)

	for i := 0; i < len(tokens); i++ {
		token := tokens[i]

		switch token {
		case "-X", "--request":
			if i+1 < len(tokens) {
				method = strings.ToUpper(tokens[i+1])
				i++
			}
		case "-H", "--header":
			if i+1 < len(tokens) {
				header := tokens[i+1]
				parts := strings.SplitN(header, ":", 2)
				if len(parts) == 2 {
					headers[strings.TrimSpace(parts[0])] = strings.TrimSpace(parts[1])
				}
				i++
			}
		case "-d", "--data", "--data-raw":
			if i+1 < len(tokens) {
				body = tokens[i+1]
				i++
			}
		case "-u", "--user":
			if i+1 < len(tokens) {
				userPass := tokens[i+1]
				parts := strings.SplitN(userPass, ":", 2)
				if len(parts) == 2 {
					username = parts[0]
					password = parts[1]
				}
				i++
			}
		default:
			// Check if it's a URL
			if strings.HasPrefix(token, "http://") || strings.HasPrefix(token, "https://") ||
				strings.HasPrefix(token, "'") && (strings.Contains(token, "http://") || strings.Contains(token, "https://")) ||
				strings.HasPrefix(token, "\"") && (strings.Contains(token, "http://") || strings.Contains(token, "https://")) {
				url = strings.Trim(token, "'\"")
			}
		}
	}

	if url == "" {
		return "", fmt.Errorf("could not find URL in curl command")
	}

	// Build fetch code
	var result strings.Builder

	// Build options object
	result.WriteString("const options = {\n")
	result.WriteString(fmt.Sprintf("  method: '%s',\n", method))

	// Add headers
	if len(headers) > 0 || username != "" {
		result.WriteString("  headers: {\n")
		for key, val := range headers {
			result.WriteString(fmt.Sprintf("    '%s': '%s',\n", key, val))
		}
		// Add Authorization header if username provided
		if username != "" {
			auth := base64.StdEncoding.EncodeToString([]byte(username + ":" + password))
			result.WriteString(fmt.Sprintf("    'Authorization': 'Basic %s',\n", auth))
		}
		result.WriteString("  },\n")
	}

	// Add body for non-GET requests
	if body != "" && method != "GET" && method != "HEAD" {
		result.WriteString(fmt.Sprintf("  body: '%s',\n", body))
	}

	result.WriteString("};\n\n")
	result.WriteString(fmt.Sprintf("fetch('%s', options)\n", url))
	result.WriteString("  .then(response => response.text())\n")
	result.WriteString("  .then(data => console.log(data))\n")
	result.WriteString("  .catch(error => console.error('Error:', error));")

	return result.String(), nil
}

// fetchToCurl converts JavaScript Fetch API code to a curl command
func fetchToCurl(input string) (string, error) {
	// Extract URL using regex
	urlPattern := regexp.MustCompile(`fetch\(['"]([^'"]+)['"]`)
	urlMatches := urlPattern.FindStringSubmatch(input)

	if len(urlMatches) < 2 {
		return "", fmt.Errorf("could not find fetch call with URL")
	}
	url := urlMatches[1]

	// Extract method
	method := "GET"
	methodPattern := regexp.MustCompile(`method\s*:\s*['"](\w+)['"]`)
	methodMatches := methodPattern.FindStringSubmatch(input)
	if len(methodMatches) >= 2 {
		method = strings.ToUpper(methodMatches[1])
	}

	// Extract headers
	headers := make(map[string]string)
	headerPattern := regexp.MustCompile(`['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]`)
	headerMatches := headerPattern.FindAllStringSubmatch(input, -1)
	for _, match := range headerMatches {
		if len(match) >= 3 {
			key := match[1]
			val := match[2]
			// Skip common non-header matches
			if key != "method" && key != "body" && key != "mode" && key != "credentials" {
				headers[key] = val
			}
		}
	}

	// Extract body
	body := ""
	bodyPattern := regexp.MustCompile(`body\s*:\s*['"]([^'"]*)['"]`)
	bodyMatches := bodyPattern.FindStringSubmatch(input)
	if len(bodyMatches) >= 2 {
		body = bodyMatches[1]
	}

	// Build curl command
	var result strings.Builder
	result.WriteString("curl")

	if method != "GET" {
		result.WriteString(fmt.Sprintf(" -X %s", method))
	}

	for key, val := range headers {
		result.WriteString(fmt.Sprintf(" -H '%s: %s'", key, val))
	}

	if body != "" {
		result.WriteString(fmt.Sprintf(" -d '%s'", body))
	}

	result.WriteString(fmt.Sprintf(" '%s'", url))

	return result.String(), nil
}

// tokenizeCurl splits a curl command into tokens, respecting quotes
func tokenizeCurl(input string) []string {
	var tokens []string
	var current strings.Builder
	inSingleQuote := false
	inDoubleQuote := false

	for i := 0; i < len(input); i++ {
		c := input[i]

		if c == '\'' && !inDoubleQuote {
			if inSingleQuote {
				inSingleQuote = false
			} else {
				inSingleQuote = true
			}
			continue
		}

		if c == '"' && !inSingleQuote {
			if inDoubleQuote {
				inDoubleQuote = false
			} else {
				inDoubleQuote = true
			}
			continue
		}

		if (c == ' ' || c == '\t') && !inSingleQuote && !inDoubleQuote {
			if current.Len() > 0 {
				tokens = append(tokens, current.String())
				current.Reset()
			}
			continue
		}

		current.WriteByte(c)
	}

	if current.Len() > 0 {
		tokens = append(tokens, current.String())
	}

	return tokens
}

// isCronExpression checks if input looks like a 5-field cron expression
func isCronExpression(input string) bool {
	fields := strings.Fields(input)
	return len(fields) == 5
}

// cronToText converts a cron expression to human-readable text
func cronToText(input string) (string, error) {
	fields := strings.Fields(input)
	if len(fields) != 5 {
		return "", fmt.Errorf("cron expression must have exactly 5 fields: minute hour day month weekday")
	}

	minute, hour, day, month, weekday := fields[0], fields[1], fields[2], fields[3], fields[4]

	var parts []string

	// Parse minute and hour
	if minute == "*" && hour == "*" {
		parts = append(parts, "Every minute")
	} else if minute == "0" && hour == "*" {
		parts = append(parts, "Every hour")
	} else if minute == "0" && hour != "*" {
		hourVal := hour
		if h, err := strconv.Atoi(hour); err == nil && h < 12 {
			hourVal = fmt.Sprintf("%02d:00 AM", h)
		} else if h, err := strconv.Atoi(hour); err == nil && h == 12 {
			hourVal = "12:00 PM"
		} else if h, err := strconv.Atoi(hour); err == nil && h > 12 {
			hourVal = fmt.Sprintf("%02d:00 PM", h-12)
		}
		parts = append(parts, fmt.Sprintf("At %s", hourVal))
	} else {
		parts = append(parts, fmt.Sprintf("At %s:%s", hour, minute))
	}

	// Parse day of month
	if day != "*" {
		parts = append(parts, fmt.Sprintf("on day %s of the month", day))
	}

	// Parse month
	if month != "*" {
		monthNames := map[string]string{
			"1": "January", "2": "February", "3": "March", "4": "April",
			"5": "May", "6": "June", "7": "July", "8": "August",
			"9": "September", "10": "October", "11": "November", "12": "December",
		}
		if name, ok := monthNames[month]; ok {
			parts = append(parts, fmt.Sprintf("in %s", name))
		} else {
			parts = append(parts, fmt.Sprintf("in month %s", month))
		}
	}

	// Parse day of week
	if weekday != "*" {
		weekdayNames := map[string]string{
			"0": "Sunday", "1": "Monday", "2": "Tuesday", "3": "Wednesday",
			"4": "Thursday", "5": "Friday", "6": "Saturday",
			"7": "Sunday",
		}

		// Handle ranges like "1-5"
		if strings.Contains(weekday, "-") {
			rangeParts := strings.Split(weekday, "-")
			if len(rangeParts) == 2 {
				start, end := rangeParts[0], rangeParts[1]
				startName := weekdayNames[start]
				endName := weekdayNames[end]
				if startName != "" && endName != "" {
					parts = append(parts, fmt.Sprintf("from %s through %s", startName, endName))
				}
			}
		} else {
			if name, ok := weekdayNames[weekday]; ok {
				parts = append(parts, fmt.Sprintf("on %s", name))
			} else {
				parts = append(parts, fmt.Sprintf("on weekday %s", weekday))
			}
		}
	}

	return strings.Join(parts, ", "), nil
}

// textToCron converts human-readable text to a cron expression (basic implementation)
func textToCron(input string) (string, error) {
	input = strings.ToLower(input)

	// Handle common patterns
	if strings.Contains(input, "every minute") {
		return "* * * * *", nil
	}

	if strings.Contains(input, "every hour") {
		return "0 * * * *", nil
	}

	if strings.Contains(input, "every day") || strings.Contains(input, "daily") {
		return "0 0 * * *", nil
	}

	// Extract time (e.g., "09:00", "9am", "9:00 am")
	minute := "0"
	hour := "*"

	// Match patterns like "at 09:00" or "at 9:00 am"
	timePattern := regexp.MustCompile(`at\s+(\d{1,2}):(\d{2})(?:\s*(am|pm))?`)
	timeMatches := timePattern.FindStringSubmatch(input)
	if len(timeMatches) >= 3 {
		hour = timeMatches[1]
		minute = timeMatches[2]

		// Convert to 24-hour format if AM/PM specified
		if len(timeMatches) >= 4 && timeMatches[3] != "" {
			h, _ := strconv.Atoi(hour)
			if timeMatches[3] == "pm" && h != 12 {
				h += 12
				hour = strconv.Itoa(h)
			} else if timeMatches[3] == "am" && h == 12 {
				hour = "0"
			}
		}
	}

	// Handle weekdays
	weekday := "*"
	if strings.Contains(input, "monday through friday") ||
		strings.Contains(input, "weekday") ||
		strings.Contains(input, "weekdays") {
		weekday = "1-5"
	} else if strings.Contains(input, "monday") {
		weekday = "1"
	} else if strings.Contains(input, "tuesday") {
		weekday = "2"
	} else if strings.Contains(input, "wednesday") {
		weekday = "3"
	} else if strings.Contains(input, "thursday") {
		weekday = "4"
	} else if strings.Contains(input, "friday") {
		weekday = "5"
	} else if strings.Contains(input, "saturday") {
		weekday = "6"
	} else if strings.Contains(input, "sunday") {
		weekday = "0"
	}

	// Pad with leading zeros if needed
	if len(minute) == 1 {
		minute = "0" + minute
	}
	if len(hour) == 1 {
		hour = "0" + hour
	}

	return fmt.Sprintf("%s %s * * %s", minute, hour, weekday), nil
}

// Color conversion functions
func convertColor(input string) (string, error) {
	input = strings.TrimSpace(input)

	var r, g, b int
	var err error

	// Try to detect format and parse
	if strings.HasPrefix(input, "#") {
		// HEX format
		r, g, b, err = parseHex(input)
	} else if strings.HasPrefix(input, "rgb") {
		// RGB format: rgb(255, 128, 0)
		r, g, b, err = parseRGB(input)
	} else if strings.HasPrefix(input, "hsl") {
		// HSL format: hsl(120, 50%, 50%)
		r, g, b, err = parseHSL(input)
	} else if strings.HasPrefix(input, "hsv") || strings.HasPrefix(input, "hsb") {
		// HSV/HSB format: hsv(120, 50%, 50%)
		r, g, b, err = parseHSV(input)
	} else {
		// Try comma-separated RGB
		r, g, b, err = parseCommaRGB(input)
	}

	if err != nil {
		return "", fmt.Errorf("invalid color format: %w", err)
	}

	// Generate all output formats
	var result strings.Builder
	result.WriteString(fmt.Sprintf("HEX: %s\n", rgbToHex(r, g, b)))
	result.WriteString(fmt.Sprintf("RGB: rgb(%d, %d, %d)\n", r, g, b))

	h, s, l := rgbToHSL(r, g, b)
	result.WriteString(fmt.Sprintf("HSL: hsl(%d, %d%%, %d%%)\n", h, s, l))

	h2, s2, v := rgbToHSV(r, g, b)
	result.WriteString(fmt.Sprintf("HSV: hsv(%d, %d%%, %d%%)", h2, s2, v))

	return result.String(), nil
}

func parseHex(input string) (int, int, int, error) {
	input = strings.TrimPrefix(input, "#")

	// Handle shorthand: #RGB -> #RRGGBB
	if len(input) == 3 {
		input = string(input[0]) + string(input[0]) + string(input[1]) + string(input[1]) + string(input[2]) + string(input[2])
	}

	if len(input) != 6 {
		return 0, 0, 0, fmt.Errorf("invalid hex length")
	}

	val, err := strconv.ParseInt(input, 16, 64)
	if err != nil {
		return 0, 0, 0, err
	}

	r := int((val >> 16) & 0xFF)
	g := int((val >> 8) & 0xFF)
	b := int(val & 0xFF)

	return r, g, b, nil
}

func rgbToHex(r, g, b int) string {
	return fmt.Sprintf("#%02X%02X%02X", r, g, b)
}

func parseRGB(input string) (int, int, int, error) {
	// Extract numbers from rgb(255, 128, 0)
	re := regexp.MustCompile(`rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)`)
	matches := re.FindStringSubmatch(input)
	if len(matches) != 4 {
		return 0, 0, 0, fmt.Errorf("invalid RGB format")
	}

	r, _ := strconv.Atoi(matches[1])
	g, _ := strconv.Atoi(matches[2])
	b, _ := strconv.Atoi(matches[3])

	return clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255), nil
}

func parseCommaRGB(input string) (int, int, int, error) {
	// Try format: 255, 128, 0
	parts := strings.Split(input, ",")
	if len(parts) != 3 {
		return 0, 0, 0, fmt.Errorf("invalid comma-separated RGB")
	}

	r, err1 := strconv.Atoi(strings.TrimSpace(parts[0]))
	g, err2 := strconv.Atoi(strings.TrimSpace(parts[1]))
	b, err3 := strconv.Atoi(strings.TrimSpace(parts[2]))

	if err1 != nil || err2 != nil || err3 != nil {
		return 0, 0, 0, fmt.Errorf("invalid RGB values")
	}

	return clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255), nil
}

func parseHSL(input string) (int, int, int, error) {
	// Extract numbers from hsl(120, 50%, 50%)
	re := regexp.MustCompile(`hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)`)
	matches := re.FindStringSubmatch(input)
	if len(matches) != 4 {
		return 0, 0, 0, fmt.Errorf("invalid HSL format")
	}

	h, _ := strconv.Atoi(matches[1])
	s, _ := strconv.Atoi(matches[2])
	l, _ := strconv.Atoi(matches[3])

	return hslToRGB(h, s, l)
}

func rgbToHSL(r, g, b int) (int, int, int) {
	rf := float64(r) / 255.0
	gf := float64(g) / 255.0
	bf := float64(b) / 255.0

	max := max(rf, max(gf, bf))
	min := min(rf, min(gf, bf))
	l := (max + min) / 2

	var s, h float64

	if max == min {
		s, h = 0, 0
	} else {
		d := max - min
		if l > 0.5 {
			s = d / (2 - max - min)
		} else {
			s = d / (max + min)
		}

		switch max {
		case rf:
			h = (gf - bf) / d
			if gf < bf {
				h += 6
			}
		case gf:
			h = (bf-rf)/d + 2
		case bf:
			h = (rf-gf)/d + 4
		}
		h /= 6
	}

	return int(h * 360), int(s * 100), int(l * 100)
}

func hslToRGB(h, s, l int) (int, int, int, error) {
	hf := float64(h) / 360.0
	sf := float64(s) / 100.0
	lf := float64(l) / 100.0

	var r, g, b float64

	if sf == 0 {
		r, g, b = lf, lf, lf
	} else {
		var q float64
		if lf < 0.5 {
			q = lf * (1 + sf)
		} else {
			q = lf + sf - lf*sf
		}
		p := 2*lf - q

		r = hueToRGB(p, q, hf+1.0/3.0)
		g = hueToRGB(p, q, hf)
		b = hueToRGB(p, q, hf-1.0/3.0)
	}

	return int(r * 255), int(g * 255), int(b * 255), nil
}

func hueToRGB(p, q, t float64) float64 {
	if t < 0 {
		t += 1
	}
	if t > 1 {
		t -= 1
	}
	if t < 1.0/6.0 {
		return p + (q-p)*6*t
	}
	if t < 1.0/2.0 {
		return q
	}
	if t < 2.0/3.0 {
		return p + (q-p)*(2.0/3.0-t)*6
	}
	return p
}

func parseHSV(input string) (int, int, int, error) {
	// Extract numbers from hsv(120, 50%, 50%)
	re := regexp.MustCompile(`(?:hsv|hsb)\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)`)
	matches := re.FindStringSubmatch(input)
	if len(matches) != 4 {
		return 0, 0, 0, fmt.Errorf("invalid HSV format")
	}

	h, _ := strconv.Atoi(matches[1])
	s, _ := strconv.Atoi(matches[2])
	v, _ := strconv.Atoi(matches[3])

	return hsvToRGB(h, s, v)
}

func rgbToHSV(r, g, b int) (int, int, int) {
	rf := float64(r) / 255.0
	gf := float64(g) / 255.0
	bf := float64(b) / 255.0

	max := max(rf, max(gf, bf))
	min := min(rf, min(gf, bf))
	v := max

	d := max - min
	var s float64
	if max == 0 {
		s = 0
	} else {
		s = d / max
	}

	var h float64
	if max == min {
		h = 0
	} else {
		switch max {
		case rf:
			h = (gf - bf) / d
			if gf < bf {
				h += 6
			}
		case gf:
			h = (bf-rf)/d + 2
		case bf:
			h = (rf-gf)/d + 4
		}
		h /= 6
	}

	return int(h * 360), int(s * 100), int(v * 100)
}

func hsvToRGB(h, s, v int) (int, int, int, error) {
	hf := float64(h) / 360.0
	sf := float64(s) / 100.0
	vf := float64(v) / 100.0

	i := int(hf * 6)
	f := hf*6 - float64(i)
	p := vf * (1 - sf)
	q := vf * (1 - f*sf)
	t := vf * (1 - (1-f)*sf)

	var r, g, b float64

	switch i % 6 {
	case 0:
		r, g, b = vf, t, p
	case 1:
		r, g, b = q, vf, p
	case 2:
		r, g, b = p, vf, t
	case 3:
		r, g, b = p, q, vf
	case 4:
		r, g, b = t, p, vf
	case 5:
		r, g, b = vf, p, q
	}

	return int(r * 255), int(g * 255), int(b * 255), nil
}

func clamp(v, min, max int) int {
	if v < min {
		return min
	}
	if v > max {
		return max
	}
	return v
}

func max(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
}

func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}
