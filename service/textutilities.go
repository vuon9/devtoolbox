package service

import (
	"context"
	"devtoolbox/internal/converter"
	"sort"
	"strings"
	"unicode"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type TextUtilitiesService struct {
	app *application.App
	svc converter.ConverterService
}

func NewTextUtilitiesService(app *application.App) *TextUtilitiesService {
	return &TextUtilitiesService{app: app, svc: converter.NewEscapeConverter()}
}

func (s *TextUtilitiesService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	return nil
}

func (s *TextUtilitiesService) Escape(input, method string) (string, error) {
	return s.svc.Convert(converter.ConversionRequest{
		Input:    input,
		Category: "Escape",
		Method:   method,
		Config:   map[string]interface{}{"subMode": "Escape"},
	})
}

func (s *TextUtilitiesService) Unescape(input, method string) (string, error) {
	return s.svc.Convert(converter.ConversionRequest{
		Input:    input,
		Category: "Escape",
		Method:   method,
		Config:   map[string]interface{}{"subMode": "Unescape"},
	})
}

func (s *TextUtilitiesService) SortLines(input string, reverse bool) (string, error) {
	if input == "" {
		return "", nil
	}
	lines := strings.Split(input, "\n")
	sort.Strings(lines)
	if reverse {
		for i, j := 0, len(lines)-1; i < j; i, j = i+1, j-1 {
			lines[i], lines[j] = lines[j], lines[i]
		}
	}
	return strings.Join(lines, "\n"), nil
}

func (s *TextUtilitiesService) RemoveDuplicates(input string) (string, error) {
	if input == "" {
		return "", nil
	}
	lines := strings.Split(input, "\n")
	seen := make(map[string]bool)
	result := make([]string, 0, len(lines))
	for _, line := range lines {
		if !seen[line] {
			seen[line] = true
			result = append(result, line)
		}
	}
	return strings.Join(result, "\n"), nil
}

func (s *TextUtilitiesService) TrimLines(input string) (string, error) {
	if input == "" {
		return "", nil
	}
	lines := strings.Split(input, "\n")
	for i, line := range lines {
		lines[i] = strings.TrimSpace(line)
	}
	return strings.Join(lines, "\n"), nil
}

func (s *TextUtilitiesService) RemoveEmptyLines(input string) (string, error) {
	if input == "" {
		return "", nil
	}
	lines := strings.Split(input, "\n")
	result := make([]string, 0, len(lines))
	for _, line := range lines {
		if strings.TrimSpace(line) != "" {
			result = append(result, line)
		}
	}
	return strings.Join(result, "\n"), nil
}

func (s *TextUtilitiesService) ConvertCase(input, targetCase string) (string, error) {
	switch targetCase {
	case "upper":
		return strings.ToUpper(input), nil
	case "lower":
		return strings.ToLower(input), nil
	case "camel":
		return toCamelCase(input), nil
	case "pascal":
		return toPascalCase(input), nil
	case "snake":
		return toSnakeCase(input), nil
	case "kebab":
		return toKebabCase(input), nil
	case "sentence":
		return toSentenceCase(input), nil
	default:
		return input, nil
	}
}

func (s *TextUtilitiesService) GetStats(input string) (map[string]interface{}, error) {
	chars := len(input)
	words := 0
	if strings.TrimSpace(input) != "" {
		words = len(strings.Fields(input))
	}
	lines := 0
	if input != "" {
		lines = len(strings.Split(input, "\n"))
	}
	bytes := len([]byte(input))
	sentences := 0
	if strings.TrimSpace(input) != "" {
		sentences = countSentences(input)
	}
	return map[string]interface{}{
		"chars":     chars,
		"words":     words,
		"lines":     lines,
		"bytes":     bytes,
		"sentences": sentences,
	}, nil
}

func toCamelCase(input string) string {
	words := strings.Fields(input)
	for i, word := range words {
		word = strings.ToLower(word)
		if i > 0 {
			word = titleCase(word)
		}
		words[i] = word
	}
	return strings.Join(words, "")
}

func toPascalCase(input string) string {
	words := strings.Fields(input)
	for i, word := range words {
		words[i] = titleCase(strings.ToLower(word))
	}
	return strings.Join(words, "")
}

func toSnakeCase(input string) string {
	var result strings.Builder
	for i, r := range input {
		if unicode.IsUpper(r) && i > 0 {
			result.WriteRune('_')
		}
		if r == ' ' || r == '-' {
			result.WriteRune('_')
		} else {
			result.WriteRune(unicode.ToLower(r))
		}
	}
	return result.String()
}

func toKebabCase(input string) string {
	var result strings.Builder
	for i, r := range input {
		if unicode.IsUpper(r) && i > 0 {
			result.WriteRune('-')
		}
		if r == ' ' || r == '_' {
			result.WriteRune('-')
		} else {
			result.WriteRune(unicode.ToLower(r))
		}
	}
	return result.String()
}

func toSentenceCase(input string) string {
	if input == "" {
		return ""
	}
	r := []rune(input)
	r[0] = unicode.ToUpper(r[0])
	return string(r)
}

func titleCase(s string) string {
	if s == "" {
		return ""
	}
	r := []rune(s)
	r[0] = unicode.ToUpper(r[0])
	for i := 1; i < len(r); i++ {
		r[i] = unicode.ToLower(r[i])
	}
	return string(r)
}

func countSentences(input string) int {
	count := 0
	parts := strings.FieldsFunc(input, func(r rune) bool {
		return r == '.' || r == '!' || r == '?'
	})
	for _, part := range parts {
		if strings.TrimSpace(part) != "" {
			count++
		}
	}
	return count
}
