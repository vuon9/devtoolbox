package codeformatter

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/itchyny/gojq"
	"golang.org/x/net/html"
)

// FormatRequest represents a code formatting request
type FormatRequest struct {
	Input      string `json:"input"`
	FormatType string `json:"formatType"`
	Filter     string `json:"filter,omitempty"`
	Minify     bool   `json:"minify"`
}

// FormatResponse represents a code formatting response
type FormatResponse struct {
	Output string `json:"output"`
	Error  string `json:"error,omitempty"`
}

// CodeFormatterService defines the interface for code formatting
type CodeFormatterService interface {
	Format(req FormatRequest) FormatResponse
}

type codeFormatterService struct{}

// NewCodeFormatterService creates a new code formatter service
func NewCodeFormatterService() CodeFormatterService {
	return &codeFormatterService{}
}

// Format formats code based on the request
func (s *codeFormatterService) Format(req FormatRequest) FormatResponse {
	if strings.TrimSpace(req.Input) == "" {
		return FormatResponse{Output: ""}
	}

	switch strings.ToLower(req.FormatType) {
	case "json":
		return s.formatJSON(req)
	case "xml":
		return s.formatXML(req)
	case "html":
		return s.formatHTML(req)
	case "sql":
		return s.formatSQL(req)
	case "css":
		return s.formatCSS(req)
	case "javascript", "js":
		return s.formatJavaScript(req)
	default:
		return FormatResponse{Error: fmt.Sprintf("unsupported format type: %s", req.FormatType)}
	}
}

// formatJSON formats JSON with optional jq filter
func (s *codeFormatterService) formatJSON(req FormatRequest) FormatResponse {
	// First, validate and parse the JSON
	var data interface{}
	if err := json.Unmarshal([]byte(req.Input), &data); err != nil {
		return FormatResponse{Error: fmt.Sprintf("invalid JSON: %v", err)}
	}

	// Apply jq filter if provided
	if strings.TrimSpace(req.Filter) != "" {
		filtered, err := applyJQFilter(data, req.Filter)
		if err != nil {
			return FormatResponse{Error: fmt.Sprintf("jq filter error: %v", err)}
		}
		data = filtered
	}

	// Format output
	var output []byte
	var err error
	if req.Minify {
		output, err = json.Marshal(data)
	} else {
		output, err = json.MarshalIndent(data, "", "  ")
	}
	if err != nil {
		return FormatResponse{Error: fmt.Sprintf("failed to marshal JSON: %v", err)}
	}

	return FormatResponse{Output: string(output)}
}

// applyJQFilter applies a jq filter to JSON data
func applyJQFilter(data interface{}, filter string) (interface{}, error) {
	query, err := gojq.Parse(filter)
	if err != nil {
		return nil, fmt.Errorf("invalid jq query: %w", err)
	}

	iter := query.Run(data)
	var results []interface{}

	for {
		v, ok := iter.Next()
		if !ok {
			break
		}
		if err, isErr := v.(error); isErr {
			return nil, err
		}
		results = append(results, v)
	}

	// If single result, return it directly; otherwise return array
	if len(results) == 1 {
		return results[0], nil
	}
	return results, nil
}

// formatXML formats XML with optional XPath filter
func (s *codeFormatterService) formatXML(req FormatRequest) FormatResponse {
	input := strings.TrimSpace(req.Input)

	// Basic XML validation
	if !strings.HasPrefix(input, "<") {
		return FormatResponse{Error: "invalid XML: must start with <"}
	}

	// Apply XPath filter if provided
	if strings.TrimSpace(req.Filter) != "" {
		filtered, err := applyXPathFilter(input, req.Filter)
		if err != nil {
			return FormatResponse{Error: fmt.Sprintf("XPath filter error: %v", err)}
		}
		input = filtered
	}

	// Format XML
	if req.Minify {
		minified, err := minifyXML(input)
		if err != nil {
			return FormatResponse{Error: fmt.Sprintf("failed to minify XML: %v", err)}
		}
		return FormatResponse{Output: minified}
	}

	formatted, err := formatXMLPretty(input)
	if err != nil {
		return FormatResponse{Error: fmt.Sprintf("failed to format XML: %v", err)}
	}

	return FormatResponse{Output: formatted}
}

// applyXPathFilter applies an XPath filter to XML
func applyXPathFilter(xml string, xpath string) (string, error) {
	// Simple XPath implementation for common cases
	// For full XPath support, we'd need a library like github.com/antchfx/xmlquery

	xpath = strings.TrimSpace(xpath)

	// Handle simple element selection: //element or /element
	if strings.HasPrefix(xpath, "//") {
		elementName := xpath[2:]
		return extractXMLElements(xml, elementName)
	}

	if strings.HasPrefix(xpath, "/") {
		elementName := xpath[1:]
		return extractXMLElements(xml, elementName)
	}

	// Handle attribute selection: //element/@attr
	if strings.Contains(xpath, "/@") {
		parts := strings.Split(xpath, "/@")
		if len(parts) == 2 {
			elementName := strings.TrimPrefix(parts[0], "//")
			attrName := parts[1]
			return extractXMLAttributes(xml, elementName, attrName)
		}
	}

	return xml, fmt.Errorf("complex XPath expressions not yet supported, use //element or //element/@attribute")
}

// extractXMLElements extracts elements by name from XML
func extractXMLElements(xmlStr, elementName string) (string, error) {
	// Simple extraction using string manipulation
	// In production, use proper XML parsing
	startTag := "<" + elementName
	endTag := "</" + elementName + ">"

	var results []string
	start := 0

	for {
		idx := strings.Index(xmlStr[start:], startTag)
		if idx == -1 {
			break
		}
		idx += start

		// Find end of this element
		endIdx := strings.Index(xmlStr[idx:], endTag)
		if endIdx == -1 {
			// Self-closing or no end tag
			closeIdx := strings.Index(xmlStr[idx:], "/>")
			if closeIdx == -1 {
				break
			}
			results = append(results, xmlStr[idx:idx+closeIdx+2])
			start = idx + closeIdx + 2
		} else {
			results = append(results, xmlStr[idx:idx+endIdx+len(endTag)])
			start = idx + endIdx + len(endTag)
		}
	}

	if len(results) == 0 {
		return "", fmt.Errorf("no elements found with name: %s", elementName)
	}

	return strings.Join(results, "\n"), nil
}

// extractXMLAttributes extracts attribute values from XML elements
func extractXMLAttributes(xmlStr, elementName, attrName string) (string, error) {
	startTag := "<" + elementName
	attrPattern := attrName + `="`

	var results []string
	start := 0

	for {
		idx := strings.Index(xmlStr[start:], startTag)
		if idx == -1 {
			break
		}
		idx += start

		// Find attribute
		tagEnd := strings.IndexAny(xmlStr[idx:], ">/")
		if tagEnd == -1 {
			break
		}

		tagContent := xmlStr[idx : idx+tagEnd]
		attrIdx := strings.Index(tagContent, attrPattern)
		if attrIdx != -1 {
			valStart := attrIdx + len(attrPattern)
			valEnd := strings.Index(tagContent[valStart:], `"`)
			if valEnd != -1 {
				results = append(results, tagContent[valStart:valStart+valEnd])
			}
		}

		start = idx + tagEnd + 1
	}

	if len(results) == 0 {
		return "", fmt.Errorf("no attributes found: %s/@%s", elementName, attrName)
	}

	return strings.Join(results, "\n"), nil
}

// formatXMLPretty formats XML with indentation
func formatXMLPretty(xmlStr string) (string, error) {
	var buf bytes.Buffer
	encoder := json.NewEncoder(&buf)
	encoder.SetIndent("", "  ")

	// Simple pretty printing - parse and re-serialize
	// In production, use proper XML indentation
	var result strings.Builder
	indent := 0
	inTag := false

	for i := 0; i < len(xmlStr); i++ {
		ch := xmlStr[i]

		switch ch {
		case '<':
			if i+1 < len(xmlStr) && xmlStr[i+1] == '/' {
				// Closing tag
				indent--
				if result.Len() > 0 && result.String()[result.Len()-1] == '\n' {
					result.WriteString(strings.Repeat("  ", indent))
				}
			}
			result.WriteByte(ch)
			inTag = true
		case '>':
			result.WriteByte(ch)
			inTag = false
			if i+1 < len(xmlStr) && xmlStr[i+1] != '<' && xmlStr[i+1] != ' ' && xmlStr[i+1] != '\t' && xmlStr[i+1] != '\n' {
				// Content follows
			} else if i+1 < len(xmlStr) && xmlStr[i+1] == '<' && xmlStr[i+2] != '/' {
				// Opening tag follows
				indent++
				result.WriteByte('\n')
				result.WriteString(strings.Repeat("  ", indent))
			} else if i+1 < len(xmlStr) && xmlStr[i+1] == '<' && xmlStr[i+2] == '/' {
				// Closing tag follows
				result.WriteByte('\n')
				result.WriteString(strings.Repeat("  ", indent))
			}
		case '\n', '\t':
			if !inTag {
				// Skip whitespace outside tags
			}
		default:
			result.WriteByte(ch)
		}
	}

	return result.String(), nil
}

// minifyXML removes whitespace from XML
func minifyXML(xmlStr string) (string, error) {
	var result strings.Builder
	inTag := false
	lastWasSpace := false

	for i := 0; i < len(xmlStr); i++ {
		ch := xmlStr[i]

		switch ch {
		case '<':
			inTag = true
			result.WriteByte(ch)
			lastWasSpace = false
		case '>':
			inTag = false
			result.WriteByte(ch)
			lastWasSpace = false
		case ' ', '\t', '\n', '\r':
			if inTag {
				result.WriteByte(ch)
			} else if !lastWasSpace {
				result.WriteByte(' ')
				lastWasSpace = true
			}
		default:
			result.WriteByte(ch)
			lastWasSpace = false
		}
	}

	return result.String(), nil
}

// formatHTML formats HTML with optional CSS selector filter
func (s *codeFormatterService) formatHTML(req FormatRequest) FormatResponse {
	input := strings.TrimSpace(req.Input)

	// Apply CSS selector filter if provided
	if strings.TrimSpace(req.Filter) != "" {
		filtered, err := applyCSSSelector(input, req.Filter)
		if err != nil {
			return FormatResponse{Error: fmt.Sprintf("CSS selector error: %v", err)}
		}
		input = filtered
	}

	// Format HTML
	if req.Minify {
		minified, err := minifyHTML(input)
		if err != nil {
			return FormatResponse{Error: fmt.Sprintf("failed to minify HTML: %v", err)}
		}
		return FormatResponse{Output: minified}
	}

	formatted, err := formatHTMLPretty(input)
	if err != nil {
		return FormatResponse{Error: fmt.Sprintf("failed to format HTML: %v", err)}
	}

	return FormatResponse{Output: formatted}
}

// applyCSSSelector applies a CSS selector to HTML
func applyCSSSelector(htmlStr, selector string) (string, error) {
	doc, err := html.Parse(strings.NewReader(htmlStr))
	if err != nil {
		return "", fmt.Errorf("failed to parse HTML: %w", err)
	}

	// Simple CSS selector support
	// For full CSS selector support, use github.com/PuerkitoBio/goquery

	selector = strings.TrimSpace(selector)

	// Handle element selector (e.g., "div", "h1")
	if !strings.ContainsAny(selector, "#.[]") {
		results := findHTMLElements(doc, selector)
		if len(results) == 0 {
			return "", fmt.Errorf("no elements found matching selector: %s", selector)
		}
		return strings.Join(results, "\n"), nil
	}

	// Handle class selector (e.g., ".class")
	if strings.HasPrefix(selector, ".") {
		className := selector[1:]
		results := findElementsByClass(doc, className)
		if len(results) == 0 {
			return "", fmt.Errorf("no elements found with class: %s", className)
		}
		return strings.Join(results, "\n"), nil
	}

	// Handle ID selector (e.g., "#id")
	if strings.HasPrefix(selector, "#") {
		id := selector[1:]
		result := findElementByID(doc, id)
		if result == "" {
			return "", fmt.Errorf("no element found with id: %s", id)
		}
		return result, nil
	}

	// Handle descendant selector (e.g., "div.container > h1")
	if strings.Contains(selector, " ") || strings.Contains(selector, ">") {
		results := findElementsByDescendant(doc, selector)
		if len(results) == 0 {
			return "", fmt.Errorf("no elements found matching selector: %s", selector)
		}
		return strings.Join(results, "\n"), nil
	}

	return htmlStr, fmt.Errorf("complex CSS selectors not yet fully supported")
}

// findHTMLElements finds elements by tag name
func findHTMLElements(n *html.Node, tagName string) []string {
	var results []string

	var traverse func(*html.Node)
	traverse = func(node *html.Node) {
		if node.Type == html.ElementNode && node.Data == tagName {
			var buf strings.Builder
			html.Render(&buf, node)
			results = append(results, buf.String())
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			traverse(c)
		}
	}

	traverse(n)
	return results
}

// findElementsByClass finds elements by class name
func findElementsByClass(n *html.Node, className string) []string {
	var results []string

	var traverse func(*html.Node)
	traverse = func(node *html.Node) {
		if node.Type == html.ElementNode {
			for _, attr := range node.Attr {
				if attr.Key == "class" {
					classes := strings.Fields(attr.Val)
					for _, c := range classes {
						if c == className {
							var buf strings.Builder
							html.Render(&buf, node)
							results = append(results, buf.String())
							break
						}
					}
				}
			}
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			traverse(c)
		}
	}

	traverse(n)
	return results
}

// findElementByID finds element by ID
func findElementByID(n *html.Node, id string) string {
	var result string

	var traverse func(*html.Node)
	traverse = func(node *html.Node) {
		if result != "" {
			return
		}
		if node.Type == html.ElementNode {
			for _, attr := range node.Attr {
				if attr.Key == "id" && attr.Val == id {
					var buf strings.Builder
					html.Render(&buf, node)
					result = buf.String()
					return
				}
			}
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			traverse(c)
		}
	}

	traverse(n)
	return result
}

// findElementsByDescendant finds elements by descendant selector
func findElementsByDescendant(n *html.Node, selector string) []string {
	// Parse simple descendant selectors like "div.container > h1"
	parts := strings.FieldsFunc(selector, func(r rune) bool {
		return r == ' ' || r == '>'
	})

	if len(parts) == 0 {
		return nil
	}

	// For now, just find the last element
	lastPart := parts[len(parts)-1]

	// Check if it has a class
	if strings.Contains(lastPart, ".") {
		classParts := strings.Split(lastPart, ".")
		tagName := classParts[0]
		className := classParts[1]

		var results []string
		var traverse func(*html.Node)
		traverse = func(node *html.Node) {
			if node.Type == html.ElementNode && (tagName == "" || node.Data == tagName) {
				for _, attr := range node.Attr {
					if attr.Key == "class" {
						classes := strings.Fields(attr.Val)
						for _, c := range classes {
							if c == className {
								var buf strings.Builder
								html.Render(&buf, node)
								results = append(results, buf.String())
								break
							}
						}
					}
				}
			}
			for c := node.FirstChild; c != nil; c = c.NextSibling {
				traverse(c)
			}
		}
		traverse(n)
		return results
	}

	return findHTMLElements(n, lastPart)
}

// formatHTMLPretty formats HTML with indentation
func formatHTMLPretty(htmlStr string) (string, error) {
	doc, err := html.Parse(strings.NewReader(htmlStr))
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	encoder := html.NewTokenizer(&buf)
	_ = encoder

	// Use html.Render and then pretty print
	var rawBuf strings.Builder
	if err := html.Render(&rawBuf, doc); err != nil {
		return "", err
	}

	// Simple pretty printing
	return formatXMLPretty(rawBuf.String())
}

// minifyHTML removes whitespace from HTML
func minifyHTML(htmlStr string) (string, error) {
	doc, err := html.Parse(strings.NewReader(htmlStr))
	if err != nil {
		return "", err
	}

	var buf strings.Builder
	if err := html.Render(&buf, doc); err != nil {
		return "", err
	}

	return minifyXML(buf.String())
}

// formatSQL formats SQL
func (s *codeFormatterService) formatSQL(req FormatRequest) FormatResponse {
	// Simple SQL formatting - in production, use a proper SQL parser
	formatted := formatSQLSimple(req.Input, !req.Minify)
	return FormatResponse{Output: formatted}
}

// formatSQLSimple performs basic SQL formatting
func formatSQLSimple(sql string, pretty bool) string {
	if !pretty {
		// Minify: remove extra whitespace
		return strings.Join(strings.Fields(sql), " ")
	}

	// Keywords to capitalize and put on new lines
	keywords := []string{
		"SELECT", "FROM", "WHERE", "AND", "OR", "INSERT", "UPDATE", "DELETE",
		"JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "GROUP", "BY",
		"ORDER", "HAVING", "LIMIT", "OFFSET", "UNION", "ALL", "VALUES",
		"SET", "CREATE", "TABLE", "ALTER", "DROP", "INDEX", "PRIMARY",
		"KEY", "FOREIGN", "REFERENCES", "NOT", "NULL", "DEFAULT", "AUTO_INCREMENT",
	}

	result := sql

	// Capitalize keywords
	for _, kw := range keywords {
		// Use regex for word boundaries
		pattern := "\\b" + strings.ToLower(kw) + "\\b"
		result = regexpReplaceAllString(result, pattern, kw)
	}

	// Add newlines after certain keywords
	newlineKeywords := []string{"SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "HAVING", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN"}
	for _, kw := range newlineKeywords {
		result = strings.ReplaceAll(result, kw, "\n"+kw)
	}

	// Clean up multiple newlines
	result = regexpReplaceAllString(result, "\n+", "\n")
	result = strings.TrimSpace(result)

	return result
}

// formatCSS formats CSS
func (s *codeFormatterService) formatCSS(req FormatRequest) FormatResponse {
	formatted := formatCSSSimple(req.Input, !req.Minify)
	return FormatResponse{Output: formatted}
}

// formatCSSSimple performs basic CSS formatting
func formatCSSSimple(css string, pretty bool) string {
	if !pretty {
		// Minify
		return minifyCSS(css)
	}

	// Pretty print
	var result strings.Builder
	indent := 0
	inRule := false

	for i := 0; i < len(css); i++ {
		ch := css[i]

		switch ch {
		case '{':
			result.WriteByte(ch)
			result.WriteByte('\n')
			indent++
			result.WriteString(strings.Repeat("  ", indent))
			inRule = true
		case '}':
			result.WriteByte('\n')
			indent--
			result.WriteString(strings.Repeat("  ", indent))
			result.WriteByte(ch)
			result.WriteByte('\n')
			if indent > 0 {
				result.WriteString(strings.Repeat("  ", indent))
			}
			inRule = false
		case ';':
			result.WriteByte(ch)
			if inRule {
				result.WriteByte('\n')
				result.WriteString(strings.Repeat("  ", indent))
			}
		case '\n', '\t':
			// Skip existing whitespace
		case ' ':
			if result.Len() > 0 && result.String()[result.Len()-1] != ' ' {
				result.WriteByte(ch)
			}
		default:
			result.WriteByte(ch)
		}
	}

	return strings.TrimSpace(result.String())
}

// minifyCSS removes whitespace from CSS
func minifyCSS(css string) string {
	var result strings.Builder
	lastWasSpace := false

	for i := 0; i < len(css); i++ {
		ch := css[i]

		switch ch {
		case ' ', '\t', '\n', '\r':
			if !lastWasSpace {
				result.WriteByte(' ')
				lastWasSpace = true
			}
		default:
			result.WriteByte(ch)
			lastWasSpace = false
		}
	}

	return strings.TrimSpace(result.String())
}

// formatJavaScript formats JavaScript
func (s *codeFormatterService) formatJavaScript(req FormatRequest) FormatResponse {
	// For JavaScript, we can use the JSON formatter for basic formatting
	// In production, use a proper JS formatter like prettier or js-beautify

	if req.Minify {
		minified := minifyJS(req.Input)
		return FormatResponse{Output: minified}
	}

	formatted := formatJSSimple(req.Input)
	return FormatResponse{Output: formatted}
}

// formatJSSimple performs basic JavaScript formatting
func formatJSSimple(js string) string {
	var result strings.Builder
	indent := 0

	for i := 0; i < len(js); i++ {
		ch := js[i]

		switch ch {
		case '{':
			result.WriteByte(ch)
			result.WriteByte('\n')
			indent++
			result.WriteString(strings.Repeat("  ", indent))
		case '}':
			result.WriteByte('\n')
			indent--
			result.WriteString(strings.Repeat("  ", indent))
			result.WriteByte(ch)
		case ';':
			result.WriteByte(ch)
			result.WriteByte('\n')
			result.WriteString(strings.Repeat("  ", indent))
		case '\n', '\t':
			// Skip existing whitespace
		case ' ':
			if result.Len() > 0 {
				lastChar := result.String()[result.Len()-1]
				if lastChar != ' ' && lastChar != '\n' {
					result.WriteByte(ch)
				}
			}
		default:
			result.WriteByte(ch)
		}
	}

	return strings.TrimSpace(result.String())
}

// minifyJS removes whitespace from JavaScript
func minifyJS(js string) string {
	var result strings.Builder
	lastWasSpace := false
	inString := false
	stringChar := byte(0)

	for i := 0; i < len(js); i++ {
		ch := js[i]

		// Handle strings
		if !inString && (ch == '"' || ch == '\'') {
			inString = true
			stringChar = ch
			result.WriteByte(ch)
			lastWasSpace = false
			continue
		}

		if inString {
			result.WriteByte(ch)
			if ch == stringChar && (i == 0 || js[i-1] != '\\') {
				inString = false
			}
			continue
		}

		// Handle comments
		if ch == '/' && i+1 < len(js) {
			if js[i+1] == '/' {
				// Single line comment
				for i < len(js) && js[i] != '\n' {
					i++
				}
				continue
			}
			if js[i+1] == '*' {
				// Multi-line comment
				i += 2
				for i < len(js)-1 && !(js[i] == '*' && js[i+1] == '/') {
					i++
				}
				i++
				continue
			}
		}

		switch ch {
		case ' ', '\t', '\n', '\r':
			if !lastWasSpace {
				result.WriteByte(' ')
				lastWasSpace = true
			}
		default:
			result.WriteByte(ch)
			lastWasSpace = false
		}
	}

	return strings.TrimSpace(result.String())
}

// regexpReplaceAllString is a helper for regex replacement
func regexpReplaceAllString(s, pattern, replacement string) string {
	// Simple implementation - in production use regexp package
	// This is a placeholder
	return s
}
