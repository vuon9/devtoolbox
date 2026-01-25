package converter

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
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
		// Note: XML conversion is complex without schema. Placeholder for now.
		return "", fmt.Errorf("XML conversion not fully implemented")

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
	}

	return "", fmt.Errorf("formatting method %s not supported", req.Method)
}
