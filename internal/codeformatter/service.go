package codeformatter

import (
	"encoding/json"
	"fmt"
	"regexp"
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

	// Handle element[@attr='value'] or element[@attr="value"] pattern - extract element with specific attribute
	if strings.Contains(xpath, "[@") && (strings.Contains(xpath, "='") || strings.Contains(xpath, "=\"")) {
		return extractElementByAttribute(xml, xpath)
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

	// Handle simple element selection: //element or /element (single element, no nested path)
	if strings.HasPrefix(xpath, "//") {
		elementName := xpath[2:]
		// Check if it's a simple element name (no nested path)
		if !strings.Contains(elementName, "/") {
			return extractXMLElements(xml, elementName)
		}
		// It's a nested path like //catalog/book, fall through to nested handling
		xpath = elementName
	} else if strings.HasPrefix(xpath, "/") {
		elementName := xpath[1:]
		// Check if it's a simple element name (no nested path)
		if !strings.Contains(elementName, "/") {
			return extractXMLElements(xml, elementName)
		}
		// It's a nested path like /catalog/book, fall through to nested handling
		xpath = elementName
	}

	// Handle nested paths like catalog/book/author or //book/author
	parts := strings.Split(xpath, "/")
	if len(parts) > 1 {
		// Multi-level path: process step by step
		return extractNestedXMLElements(xml, parts)
	}

	// Single element name without prefix (e.g., just "book")
	if xpath != "" {
		return extractXMLElements(xml, xpath)
	}

	return xml, fmt.Errorf("complex XPath expressions not yet supported, use //element, /element, or //element/child")
}

// extractElementByAttribute extracts element with specific attribute value
func extractElementByAttribute(xmlStr, xpath string) (string, error) {
	// Parse pattern like: element[@attr='value'] or //element[@attr='value']
	// Also supports: element[@attr='value']/child
	xpath = strings.TrimPrefix(xpath, "//")

	// Find the end of attribute selector ']' to check for nested path
	startBracket := strings.Index(xpath, "[@")
	if startBracket == -1 {
		return xmlStr, fmt.Errorf("invalid attribute selector")
	}

	// Find matching closing bracket
	bracketCount := 1
	endBracket := -1
	for i := startBracket + 2; i < len(xpath); i++ {
		if xpath[i] == '[' {
			bracketCount++
		} else if xpath[i] == ']' {
			bracketCount--
			if bracketCount == 0 {
				endBracket = i
				break
			}
		}
	}
	if endBracket == -1 {
		return xmlStr, fmt.Errorf("invalid attribute selector: unclosed bracket")
	}

	// Check if there's a nested path after the attribute selector
	var nestedPath []string
	if endBracket+1 < len(xpath) && xpath[endBracket+1] == '/' {
		nestedPathStr := xpath[endBracket+2:]
		if nestedPathStr != "" {
			nestedPath = strings.Split(nestedPathStr, "/")
		}
	}

	// Extract element name, attribute name, and value
	elementName := xpath[:startBracket]
	attrSelector := xpath[startBracket+2 : endBracket] // Remove '[@' and ']'

	// Find the attribute name and value
	eqIdx := strings.Index(attrSelector, "=")
	if eqIdx == -1 {
		return xmlStr, fmt.Errorf("invalid attribute selector: missing =")
	}

	attrName := strings.TrimSpace(attrSelector[:eqIdx])

	// Extract value between quotes
	valueStart := strings.IndexAny(attrSelector[eqIdx:], "'\"")
	if valueStart == -1 {
		return xmlStr, fmt.Errorf("invalid attribute selector: missing quotes")
	}
	valueStart += eqIdx

	quoteChar := attrSelector[valueStart]
	valueEnd := strings.Index(attrSelector[valueStart+1:], string(quoteChar))
	if valueEnd == -1 {
		return xmlStr, fmt.Errorf("invalid attribute selector: unclosed quotes")
	}
	valueEnd += valueStart + 1

	attrValue := attrSelector[valueStart+1 : valueEnd]

	// Find elements with matching attribute by searching for element tags first,
	// then checking if they have the specified attribute
	startTag := "<" + elementName
	endTag := "</" + elementName + ">"

	var results []string
	start := 0

	for {
		// Find the next occurrence of the element start tag
		idx := strings.Index(xmlStr[start:], startTag)
		if idx == -1 {
			break
		}
		idx += start

		// Check that this is a complete tag name (not a prefix)
		afterTag := idx + len(startTag)
		if afterTag < len(xmlStr) {
			nextChar := xmlStr[afterTag]
			if nextChar != ' ' && nextChar != '>' && nextChar != '/' {
				// This is a prefix match (e.g., "book" matching "bookmark"), skip it
				start = idx + len(startTag)
				continue
			}
		}

		// Find the end of the opening tag to extract attributes
		tagEnd := idx + len(startTag)
		for tagEnd < len(xmlStr) && xmlStr[tagEnd] != '>' && xmlStr[tagEnd] != '/' {
			tagEnd++
		}

		// Extract the tag content (attributes)
		tagContent := xmlStr[idx:tagEnd]

		// Check if this tag has the attribute with the specified value
		// Look for attr="value" or attr='value'
		attrPattern1 := attrName + "=" + string(quoteChar) + attrValue + string(quoteChar)
		attrPattern2 := attrName + "=" + string(quoteChar) + attrValue + string(quoteChar)
		if quoteChar == '\'' {
			attrPattern2 = attrName + "=\"" + attrValue + "\""
		} else {
			attrPattern2 = attrName + "='" + attrValue + "'"
		}

		if !strings.Contains(tagContent, attrPattern1) && !strings.Contains(tagContent, attrPattern2) {
			// Attribute not found in this tag, skip to next
			start = idx + len(startTag)
			continue
		}

		// Found matching element, extract it
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
		return "", fmt.Errorf("no elements found with %s[@%s='%s']", elementName, attrName, attrValue)
	}

	// If there's a nested path, apply it to the results
	if len(nestedPath) > 0 {
		var finalResults []string
		for _, result := range results {
			nestedResult, err := extractNestedXMLElements(result, nestedPath)
			if err == nil && nestedResult != "" {
				finalResults = append(finalResults, nestedResult)
			}
		}
		if len(finalResults) == 0 {
			return "", fmt.Errorf("no nested elements found with path: %s", strings.Join(nestedPath, "/"))
		}
		return strings.Join(finalResults, "\n"), nil
	}

	return strings.Join(results, "\n"), nil
}

// extractNestedXMLElements extracts elements following a path like catalog/book/author
func extractNestedXMLElements(xmlStr string, pathParts []string) (string, error) {
	if len(pathParts) == 0 {
		return xmlStr, nil
	}

	// Get the first element in the path
	currentElement := pathParts[0]

	// Extract all elements with the first name (returns slice to avoid newline issues)
	matches, err := extractXMLElementsSlice(xmlStr, currentElement)
	if err != nil {
		return "", err
	}

	// If this is the last part, return joined results
	if len(pathParts) == 1 {
		return strings.Join(matches, "\n"), nil
	}

	// Continue with the rest of the path
	var finalResults []string

	for _, match := range matches {
		if strings.TrimSpace(match) == "" {
			continue
		}
		// Process remaining path parts on each match
		result, err := extractNestedXMLElements(match, pathParts[1:])
		if err == nil && result != "" {
			finalResults = append(finalResults, result)
		}
	}

	if len(finalResults) == 0 {
		return "", fmt.Errorf("no elements found with path: %s", strings.Join(pathParts, "/"))
	}

	return strings.Join(finalResults, "\n"), nil
}

// extractXMLElements extracts elements by name from XML
func extractXMLElements(xmlStr, elementName string) (string, error) {
	elements, err := extractXMLElementsSlice(xmlStr, elementName)
	if err != nil {
		return "", err
	}
	return strings.Join(elements, "\n"), nil
}

// extractXMLElementsSlice extracts elements by name from XML and returns as a slice
func extractXMLElementsSlice(xmlStr, elementName string) ([]string, error) {
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

		// Check that this is a complete tag name (not a prefix like "item" matching "items")
		afterTag := idx + len(startTag)
		if afterTag < len(xmlStr) {
			nextChar := xmlStr[afterTag]
			if nextChar != ' ' && nextChar != '>' && nextChar != '/' {
				// This is a prefix match, skip it
				start = idx + len(startTag)
				continue
			}
		}

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
		return nil, fmt.Errorf("no elements found with name: %s", elementName)
	}

	return results, nil
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
	// Use a simple but robust approach: tokenize and rebuild
	type token struct {
		typ   string // "decl", "open", "close", "selfclose", "text", "comment"
		value string
		name  string // for tags
	}

	var tokens []token
	i := 0
	for i < len(xmlStr) {
		if xmlStr[i] == '<' {
			// Find end of tag
			end := i + 1
			for end < len(xmlStr) && xmlStr[end] != '>' {
				end++
			}
			if end >= len(xmlStr) {
				break
			}
			tagContent := xmlStr[i+1 : end]
			fullTag := xmlStr[i : end+1]

			if strings.HasPrefix(tagContent, "?") {
				tokens = append(tokens, token{typ: "decl", value: fullTag})
			} else if strings.HasPrefix(tagContent, "!--") {
				tokens = append(tokens, token{typ: "comment", value: fullTag})
			} else if strings.HasPrefix(tagContent, "/") {
				name := strings.TrimSpace(tagContent[1:])
				tokens = append(tokens, token{typ: "close", value: fullTag, name: name})
			} else if strings.HasSuffix(tagContent, "/") {
				name := strings.TrimSpace(strings.TrimSuffix(tagContent, "/"))
				if idx := strings.IndexAny(name, " \t"); idx != -1 {
					name = name[:idx]
				}
				tokens = append(tokens, token{typ: "selfclose", value: fullTag, name: name})
			} else {
				name := strings.TrimSpace(tagContent)
				if idx := strings.IndexAny(name, " \t"); idx != -1 {
					name = name[:idx]
				}
				tokens = append(tokens, token{typ: "open", value: fullTag, name: name})
			}
			i = end + 1
		} else {
			// Text content
			start := i
			for i < len(xmlStr) && xmlStr[i] != '<' {
				i++
			}
			text := strings.TrimSpace(xmlStr[start:i])
			if text != "" {
				tokens = append(tokens, token{typ: "text", value: text})
			}
		}
	}

	// Rebuild with proper indentation
	var result strings.Builder
	indent := 0
	for j, tok := range tokens {
		switch tok.typ {
		case "decl":
			result.WriteString(tok.value)
			result.WriteByte('\n')
		case "comment":
			result.WriteString(strings.Repeat("  ", indent))
			result.WriteString(tok.value)
			result.WriteByte('\n')
		case "open":
			// Check if this is an inline element (text follows and then close)
			isInline := false
			if j+2 < len(tokens) && tokens[j+1].typ == "text" && tokens[j+2].typ == "close" && tokens[j+2].name == tok.name {
				isInline = true
			}

			if !isInline && result.Len() > 0 && !strings.HasSuffix(result.String(), "\n") {
				result.WriteByte('\n')
			}
			if !isInline {
				result.WriteString(strings.Repeat("  ", indent))
			}
			result.WriteString(tok.value)
			if !isInline {
				indent++
			}
		case "close":
			// Check if previous was inline (open + text + close sequence)
			wasInline := j >= 2 && tokens[j-2].typ == "open" && tokens[j-2].name == tok.name && tokens[j-1].typ == "text"

			if !wasInline {
				indent--
				if indent < 0 {
					indent = 0
				}
				if result.Len() > 0 && !strings.HasSuffix(result.String(), "\n") {
					result.WriteByte('\n')
				}
				result.WriteString(strings.Repeat("  ", indent))
			}
			result.WriteString(tok.value)
			if j < len(tokens)-1 {
				result.WriteByte('\n')
			}
		case "selfclose":
			if result.Len() > 0 && !strings.HasSuffix(result.String(), "\n") {
				result.WriteByte('\n')
			}
			result.WriteString(strings.Repeat("  ", indent))
			result.WriteString(tok.value)
			if j < len(tokens)-1 {
				result.WriteByte('\n')
			}
		case "text":
			result.WriteString(tok.value)
		}
	}

	return strings.TrimSpace(result.String()), nil
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

	// Handle element with class selector (e.g., "div.header")
	if strings.Contains(selector, ".") && !strings.Contains(selector, " ") && !strings.Contains(selector, ">") {
		parts := strings.Split(selector, ".")
		if len(parts) == 2 {
			tagName := parts[0]
			className := parts[1]
			results := findElementsByTagAndClass(doc, tagName, className)
			if len(results) == 0 {
				return "", fmt.Errorf("no elements found matching selector: %s", selector)
			}
			return strings.Join(results, "\n"), nil
		}
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
			results = append(results, renderNodeToString(node))
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			traverse(c)
		}
	}

	traverse(n)
	return results
}

// renderNodeToString renders a single HTML node to string without wrapping in html/body
func renderNodeToString(node *html.Node) string {
	if node == nil {
		return ""
	}

	var buf strings.Builder

	// Write opening tag
	buf.WriteString("<")
	buf.WriteString(node.Data)

	// Write attributes
	for _, attr := range node.Attr {
		buf.WriteString(" ")
		buf.WriteString(attr.Key)
		buf.WriteString(`="`)
		buf.WriteString(html.EscapeString(attr.Val))
		buf.WriteString(`"`)
	}
	buf.WriteString(">")

	// Write children
	for c := node.FirstChild; c != nil; c = c.NextSibling {
		switch c.Type {
		case html.ElementNode:
			buf.WriteString(renderNodeToString(c))
		case html.TextNode:
			buf.WriteString(html.EscapeString(c.Data))
		case html.CommentNode:
			buf.WriteString("<!--")
			buf.WriteString(c.Data)
			buf.WriteString("-->")
		}
	}

	// Write closing tag
	buf.WriteString("</")
	buf.WriteString(node.Data)
	buf.WriteString(">")

	return buf.String()
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
							results = append(results, renderNodeToString(node))
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

// findElementsByTagAndClass finds elements by tag name and class
func findElementsByTagAndClass(n *html.Node, tagName, className string) []string {
	var results []string

	var traverse func(*html.Node)
	traverse = func(node *html.Node) {
		if node.Type == html.ElementNode && node.Data == tagName {
			for _, attr := range node.Attr {
				if attr.Key == "class" {
					classes := strings.Fields(attr.Val)
					for _, c := range classes {
						if c == className {
							results = append(results, renderNodeToString(node))
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
					result = renderNodeToString(node)
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

// cssSelectorPart represents a part of a CSS selector chain
type cssSelectorPart struct {
	selector    string
	directChild bool
}

// findElementsByDescendant finds elements by descendant selector
func findElementsByDescendant(n *html.Node, selector string) []string {
	// Parse selector into parts with relationship info
	// e.g., "div.container > h1" becomes [(div.container, >), (h1, )]
	var parts []cssSelectorPart
	current := ""
	directChild := false

	for i, r := range selector {
		if r == '>' {
			if strings.TrimSpace(current) != "" {
				parts = append(parts, cssSelectorPart{selector: strings.TrimSpace(current), directChild: directChild})
			}
			current = ""
			directChild = true
		} else if r == ' ' {
			// Check if next non-space char is >
			nextIsDirect := false
			for j := i + 1; j < len(selector); j++ {
				if selector[j] == '>' {
					nextIsDirect = true
					break
				} else if selector[j] != ' ' {
					break
				}
			}

			if strings.TrimSpace(current) != "" && !nextIsDirect {
				parts = append(parts, cssSelectorPart{selector: strings.TrimSpace(current), directChild: directChild})
				current = ""
				directChild = false
			}
		} else {
			current += string(r)
		}
	}

	if strings.TrimSpace(current) != "" {
		parts = append(parts, cssSelectorPart{selector: strings.TrimSpace(current), directChild: directChild})
	}

	if len(parts) == 0 {
		return nil
	}

	// Find elements matching the full selector chain
	return findElementsMatchingSelectorChain(n, parts)
}

// findElementsMatchingSelectorChain finds elements matching a chain of selectors
func findElementsMatchingSelectorChain(n *html.Node, parts []cssSelectorPart) []string {
	if len(parts) == 0 {
		return nil
	}

	// Find all nodes matching the first selector
	firstMatches := findNodesMatchingSimpleSelector(n, parts[0].selector)

	if len(parts) == 1 {
		// Last part - convert nodes to strings (deduplicate)
		seen := make(map[*html.Node]bool)
		var results []string
		for _, node := range firstMatches {
			if !seen[node] {
				seen[node] = true
				results = append(results, renderNodeToString(node))
			}
		}
		return results
	}

	// For each match, search its descendants for the rest of the chain
	// Use a map to deduplicate nodes (same node found through different paths)
	seen := make(map[*html.Node]bool)
	var results []string

	for _, matchNode := range firstMatches {
		if parts[1].directChild {
			// For direct child (>), check if immediate children match the next selector
			for c := matchNode.FirstChild; c != nil; c = c.NextSibling {
				if c.Type == html.ElementNode && matchesSimpleSelector(c, parts[1].selector) {
					// Found a match - continue with rest of chain
					if len(parts) == 2 {
						// This is the last selector in chain
						if !seen[c] {
							seen[c] = true
							results = append(results, renderNodeToString(c))
						}
					} else {
						// More selectors to match - search from this node
						subResults := findElementsMatchingSelectorChain(c, parts[2:])
						for _, r := range subResults {
							results = append(results, r)
						}
					}
				}
			}
		} else {
			// For descendant (space), search entire subtree
			for c := matchNode.FirstChild; c != nil; c = c.NextSibling {
				subResults := findElementsMatchingSelectorChain(c, parts[1:])
				for _, r := range subResults {
					results = append(results, r)
				}
			}
		}
	}

	// Deduplicate results by string content
	seenStr := make(map[string]bool)
	var uniqueResults []string
	for _, r := range results {
		if !seenStr[r] {
			seenStr[r] = true
			uniqueResults = append(uniqueResults, r)
		}
	}

	return uniqueResults
}

// findNodesMatchingSimpleSelector finds nodes (not strings) matching a simple selector
func findNodesMatchingSimpleSelector(n *html.Node, selector string) []*html.Node {
	var results []*html.Node

	var traverse func(*html.Node)
	traverse = func(node *html.Node) {
		if node.Type == html.ElementNode && matchesSimpleSelector(node, selector) {
			results = append(results, node)
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			traverse(c)
		}
	}

	traverse(n)
	return results
}

// findElementsMatchingSimpleSelector finds elements matching a simple selector (e.g., "div", ".class", "div.class")
func findElementsMatchingSimpleSelector(n *html.Node, selector string) []string {
	var results []string

	var traverse func(*html.Node)
	traverse = func(node *html.Node) {
		if node.Type == html.ElementNode && matchesSimpleSelector(node, selector) {
			results = append(results, renderNodeToString(node))
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			traverse(c)
		}
	}

	traverse(n)
	return results
}

// matchesSimpleSelector checks if a node matches a simple CSS selector
func matchesSimpleSelector(node *html.Node, selector string) bool {
	selector = strings.TrimSpace(selector)

	// Handle class selector: .classname or tag.classname
	if strings.Contains(selector, ".") {
		parts := strings.Split(selector, ".")
		tagName := parts[0]
		className := parts[1]

		// Check tag name if specified
		if tagName != "" && node.Data != tagName {
			return false
		}

		// Check class
		for _, attr := range node.Attr {
			if attr.Key == "class" {
				classes := strings.Fields(attr.Val)
				for _, c := range classes {
					if c == className {
						return true
					}
				}
			}
		}
		return false
	}

	// Handle ID selector: #id or tag#id
	if strings.Contains(selector, "#") {
		parts := strings.Split(selector, "#")
		tagName := parts[0]
		id := parts[1]

		// Check tag name if specified
		if tagName != "" && node.Data != tagName {
			return false
		}

		// Check ID
		for _, attr := range node.Attr {
			if attr.Key == "id" && attr.Val == id {
				return true
			}
		}
		return false
	}

	// Simple tag selector
	return node.Data == selector
}

// formatHTMLPretty formats HTML with indentation
func formatHTMLPretty(htmlStr string) (string, error) {
	doc, err := html.Parse(strings.NewReader(htmlStr))
	if err != nil {
		return "", err
	}

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
	re, err := regexp.Compile(pattern)
	if err != nil {
		return s
	}
	return re.ReplaceAllString(s, replacement)
}
