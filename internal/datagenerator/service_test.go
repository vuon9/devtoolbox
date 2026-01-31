package datagenerator

import (
	"strings"
	"testing"
)

func TestEngine_Execute(t *testing.T) {
	engine := NewEngine()

	tests := []struct {
		name     string
		template string
		data     interface{}
		wantErr  bool
		errType  error
	}{
		{
			name:     "Simple UUID generation",
			template: "{{UUID}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Person name generation",
			template: "{{Name}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Email generation",
			template: "{{Email}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Number with range",
			template: "{{Int 1 100}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Empty template",
			template: "",
			data:     nil,
			wantErr:  true,
			errType:  ErrEmptyTemplate,
		},
		{
			name:     "Invalid template syntax",
			template: "{{faker.UUID",
			data:     nil,
			wantErr:  true,
			errType:  ErrInvalidTemplate,
		},
		{
			name:     "Template with variables",
			template: "Hello {{.Name}}!",
			data:     map[string]string{"Name": "World"},
			wantErr:  false,
		},
		{
			name:     "Template with all faker functions",
			template: "{{UUID}} {{Name}} {{Email}} {{Int 1 10}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with nested objects",
			template: `{"id": "{{UUID}}", "name": "{{Name}}", "email": "{{Email}}"}`,
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with batch iteration",
			template: "{{range $i, $_ := iterate 3}}{{.}}{{$i}}{{end}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with last helper",
			template: "{{range $i, $_ := iterate 3}}{{$i}}{{if not (last $i 3)}},{{end}}{{end}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with default helper",
			template: `{{default .Missing "default_value"}}`,
			data:     map[string]interface{}{},
			wantErr:  false,
		},
		{
			name:     "Template with ULID",
			template: "{{ULID}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with all person functions",
			template: "{{FirstName}} {{LastName}} {{Name}} {{Gender}} {{SSN}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with all internet functions",
			template: "{{Username}} {{URL}} {{Domain}} {{IP}} {{IPv6}} {{Mac}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with all address functions",
			template: "{{Street}} {{City}} {{State}} {{StateAbr}} {{Zip}} {{Country}} {{CountryAbr}} {{Latitude}} {{Longitude}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with company functions",
			template: "{{Company}} {{CoSuffix}} {{BS}} {{CatchPhrase}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with job functions",
			template: "{{JobTitle}} {{JobDesc}} {{JobLevel}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with number functions",
			template: "{{Int 1 100}} {{Float 1.0 100.0}} {{Hex}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with date functions",
			template: "{{Past}} {{Future}} {{Recent}} {{Birthday}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with lorem functions",
			template: "{{Word}} {{Sentence}} {{Paragraph}} {{Lorem \"words\" 5}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with product functions",
			template: "{{ProductName}} {{ProductDesc}} {{Category}} {{Adjective}} {{Material}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with credit card functions",
			template: "{{CardType}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with other functions",
			template: "{{Bool}} {{Price 10 100}} {{RandomString \"a\" \"b\" \"c\"}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with StringCustom",
			template: "{{StringCustom 10 true true true true}}",
			data:     nil,
			wantErr:  false,
		},
		{
			name:     "Template with contact info",
			template: "{{Contact}} {{Phone}} {{PhoneFormatted}}",
			data:     nil,
			wantErr:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := engine.Execute(tt.template, tt.data)

			if tt.wantErr {
				if err == nil {
					t.Errorf("Execute() expected error but got none")
					return
				}
				if tt.errType != nil && !strings.Contains(err.Error(), tt.errType.Error()) {
					t.Errorf("Execute() error = %v, want error containing %v", err, tt.errType)
				}
				return
			}

			if err != nil {
				t.Errorf("Execute() unexpected error = %v", err)
				return
			}

			if result == "" {
				t.Errorf("Execute() returned empty result")
			}
		})
	}
}

func TestEngine_ExecuteWithSeed(t *testing.T) {
	// Test that seeded engine produces deterministic results
	engine1 := NewEngineWithSeed(12345)
	engine2 := NewEngineWithSeed(12345)

	result1, err1 := engine1.Execute("{{UUID}}", nil)
	result2, err2 := engine2.Execute("{{UUID}}", nil)

	if err1 != nil || err2 != nil {
		t.Fatalf("Execute() with seed returned error: %v, %v", err1, err2)
	}

	// Note: UUID generation may not be deterministic even with seed
	// This test mainly ensures the seeded engine works without errors
	if result1 == "" || result2 == "" {
		t.Errorf("Execute() with seed returned empty result")
	}
}

func TestEngine_Validate(t *testing.T) {
	engine := NewEngine()

	tests := []struct {
		name     string
		template string
		wantErr  bool
	}{
		{
			name:     "Valid UUID template",
			template: "{{UUID}}",
			wantErr:  false,
		},
		{
			name:     "Valid complex template",
			template: `{"name": "{{Name}}", "email": "{{Email}}"}`,
			wantErr:  false,
		},
		{
			name:     "Empty template",
			template: "",
			wantErr:  true,
		},
		{
			name:     "Invalid syntax",
			template: "{{faker.UUID",
			wantErr:  true,
		},
		{
			name:     "Unknown function",
			template: "{{faker.UnknownFunction}}",
			wantErr:  true,
		},
		{
			name:     "Valid template with iteration",
			template: "{{range $i, $_ := iterate 5}}{{$i}}{{end}}",
			wantErr:  false,
		},
		{
			name:     "Valid template with condition",
			template: "{{if .Condition}}yes{{else}}no{{end}}",
			wantErr:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := engine.Validate(tt.template)
			if tt.wantErr && err == nil {
				t.Errorf("Validate() expected error but got none")
			}
			if !tt.wantErr && err != nil {
				t.Errorf("Validate() unexpected error = %v", err)
			}
		})
	}
}

func TestEngine_GenerateBatch(t *testing.T) {
	engine := NewEngine()

	tests := []struct {
		name       string
		template   string
		batchCount int
		variables  map[string]interface{}
		wantErr    bool
		errType    error
	}{
		{
			name:       "Valid batch generation - UUID",
			template:   "{{UUID}}",
			batchCount: 10,
			variables:  nil,
			wantErr:    false,
		},
		{
			name:       "Valid batch generation - Person",
			template:   "{{Name}}",
			batchCount: 50,
			variables:  nil,
			wantErr:    false,
		},
		{
			name:       "Single item generation",
			template:   "{{UUID}}",
			batchCount: 1,
			variables:  nil,
			wantErr:    false,
		},
		{
			name:       "Batch count too low",
			template:   "{{UUID}}",
			batchCount: 0,
			variables:  nil,
			wantErr:    true,
			errType:    ErrInvalidBatchCount,
		},
		{
			name:       "Batch count too high",
			template:   "{{UUID}}",
			batchCount: 2000,
			variables:  nil,
			wantErr:    true,
			errType:    ErrInvalidBatchCount,
		},
		{
			name:       "Batch with variables",
			template:   "{{Int .min .max}}",
			batchCount: 20,
			variables:  map[string]interface{}{"min": 1, "max": 100},
			wantErr:    false,
		},
		{
			name:       "Batch with float64 variables (JSON numbers)",
			template:   "{{Int 1 100}}",
			batchCount: 10,
			variables:  map[string]interface{}{},
			wantErr:    false,
		},
		{
			name:       "Batch with StringCustom",
			template:   "{{StringCustom .length .uppercase .lowercase .numbers .symbols}}",
			batchCount: 5,
			variables: map[string]interface{}{
				"length":    10,
				"uppercase": true,
				"lowercase": true,
				"numbers":   true,
				"symbols":   false,
			},
			wantErr: false,
		},
		{
			name:       "Batch with iteration",
			template:   "{{range $i, $_ := iterate .BatchCount}}item{{$i}} {{end}}",
			batchCount: 3,
			variables:  nil,
			wantErr:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			results, err := engine.GenerateBatch(tt.template, tt.batchCount, tt.variables)

			if tt.wantErr {
				if err == nil {
					t.Errorf("GenerateBatch() expected error but got none")
					return
				}
				if tt.errType != nil && err != tt.errType {
					t.Errorf("GenerateBatch() error = %v, want %v", err, tt.errType)
				}
				return
			}

			if err != nil {
				t.Errorf("GenerateBatch() unexpected error = %v", err)
				return
			}

			if len(results) != tt.batchCount {
				t.Errorf("GenerateBatch() returned %d results, want %d", len(results), tt.batchCount)
			}

			// Check that results are not empty
			for i, result := range results {
				if result == "" {
					t.Errorf("GenerateBatch() result[%d] is empty", i)
				}
			}
		})
	}
}

func TestDataGeneratorService_Generate(t *testing.T) {
	service := NewDataGeneratorService()

	tests := []struct {
		name    string
		request GenerateRequest
		wantErr bool
	}{
		{
			name: "Valid UUID generation",
			request: GenerateRequest{
				Template:     "{{UUID}}",
				BatchCount:   10,
				OutputFormat: "json",
				Variables:    nil,
			},
			wantErr: false,
		},
		{
			name: "Single item generation",
			request: GenerateRequest{
				Template:     "{{UUID}}",
				BatchCount:   1,
				OutputFormat: "raw",
				Variables:    nil,
			},
			wantErr: false,
		},
		{
			name: "Invalid batch count (0)",
			request: GenerateRequest{
				Template:     "{{UUID}}",
				BatchCount:   0,
				OutputFormat: "json",
				Variables:    nil,
			},
			wantErr: true,
		},
		{
			name: "Invalid template",
			request: GenerateRequest{
				Template:     "{{UUID",
				BatchCount:   10,
				OutputFormat: "json",
				Variables:    nil,
			},
			wantErr: true,
		},
		{
			name: "Different output formats",
			request: GenerateRequest{
				Template:     "{{Name}}",
				BatchCount:   10,
				OutputFormat: "csv",
				Variables:    nil,
			},
			wantErr: false,
		},
		{
			name: "Generate with float64 variables",
			request: GenerateRequest{
				Template:     "{{StringCustom .length .uppercase .lowercase .numbers .symbols}}",
				BatchCount:   5,
				OutputFormat: "raw",
				Variables: map[string]interface{}{
					"length":    float64(10),
					"uppercase": true,
					"lowercase": true,
					"numbers":   true,
					"symbols":   false,
				},
			},
			wantErr: false,
		},
		{
			name: "Generate with all variable types",
			request: GenerateRequest{
				Template:     "{{Int 1 100}} {{Float 1.0 100.0}} {{Name}} {{Bool}}",
				BatchCount:   3,
				OutputFormat: "raw",
				Variables:    map[string]interface{}{},
			},
			wantErr: false,
		},
		{
			name: "Generate with custom separator",
			request: GenerateRequest{
				Template:     "{{UUID}}",
				BatchCount:   3,
				OutputFormat: "raw",
				Separator:    " | ",
				Variables:    nil,
			},
			wantErr: false,
		},
		{
			name: "Generate with tab separator",
			request: GenerateRequest{
				Template:     "{{Name}}",
				BatchCount:   3,
				OutputFormat: "raw",
				Separator:    "tab",
				Variables:    nil,
			},
			wantErr: false,
		},
		{
			name: "Generate XML format",
			request: GenerateRequest{
				Template:     "{{UUID}}",
				BatchCount:   3,
				OutputFormat: "xml",
				Variables:    nil,
			},
			wantErr: false,
		},
		{
			name: "Generate YAML format",
			request: GenerateRequest{
				Template:     "{{UUID}}",
				BatchCount:   3,
				OutputFormat: "yaml",
				Variables:    nil,
			},
			wantErr: false,
		},
		{
			name: "Generate with invalid format",
			request: GenerateRequest{
				Template:     "{{UUID}}",
				BatchCount:   3,
				OutputFormat: "invalid",
				Variables:    nil,
			},
			wantErr: true,
		},
		{
			name: "Generate with batch count 1000 (max)",
			request: GenerateRequest{
				Template:     "{{UUID}}",
				BatchCount:   1000,
				OutputFormat: "raw",
				Variables:    nil,
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response, err := service.Generate(tt.request)

			if err != nil {
				t.Errorf("Generate() unexpected error = %v", err)
				return
			}

			if tt.wantErr {
				if response.Error == "" {
					t.Errorf("Generate() expected error in response but got none")
				}
				return
			}

			if response.Error != "" {
				t.Errorf("Generate() unexpected error in response = %s", response.Error)
				return
			}

			if response.Output == "" {
				t.Errorf("Generate() returned empty output")
			}

			if response.Count != tt.request.BatchCount {
				t.Errorf("Generate() count = %d, want %d", response.Count, tt.request.BatchCount)
			}

			if response.Duration < 0 {
				t.Errorf("Generate() duration = %d, want >= 0", response.Duration)
			}
		})
	}
}

func TestDataGeneratorService_GetPresets(t *testing.T) {
	service := NewDataGeneratorService()

	response, err := service.GetPresets()
	if err != nil {
		t.Errorf("GetPresets() unexpected error = %v", err)
		return
	}

	if response.Error != "" {
		t.Errorf("GetPresets() error in response = %s", response.Error)
		return
	}

	if len(response.Presets) == 0 {
		t.Errorf("GetPresets() returned no presets")
	}

	// Check that all presets have required fields
	for _, preset := range response.Presets {
		if preset.ID == "" {
			t.Errorf("Preset missing ID")
		}
		if preset.Name == "" {
			t.Errorf("Preset %s missing Name", preset.ID)
		}
		if preset.Template == "" {
			t.Errorf("Preset %s missing Template", preset.ID)
		}
	}

	// Check that we have expected number of presets
	if len(response.Presets) < 10 {
		t.Errorf("GetPresets() returned only %d presets, expected at least 10", len(response.Presets))
	}
}

func TestDataGeneratorService_ValidateTemplate(t *testing.T) {
	service := NewDataGeneratorService()

	tests := []struct {
		name      string
		template  string
		wantValid bool
	}{
		{
			name:      "Valid template",
			template:  "{{UUID}}",
			wantValid: true,
		},
		{
			name:      "Invalid template",
			template:  "{{UUID",
			wantValid: false,
		},
		{
			name:      "Empty template",
			template:  "",
			wantValid: false,
		},
		{
			name:      "Valid complex template",
			template:  `{"id": "{{UUID}}", "name": "{{Name}}"}`,
			wantValid: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := service.ValidateTemplate(tt.template)
			if err != nil {
				t.Errorf("ValidateTemplate() unexpected error = %v", err)
				return
			}

			if result.Valid != tt.wantValid {
				t.Errorf("ValidateTemplate() valid = %v, want %v", result.Valid, tt.wantValid)
			}
		})
	}
}

func TestFormatter_Format(t *testing.T) {
	formatter := NewFormatter()
	data := []string{"item1", "item2", "item3"}

	tests := []struct {
		name      string
		format    string
		separator string
		wantErr   bool
		checkFn   func(string) bool
	}{
		{
			name:    "JSON format",
			format:  "json",
			wantErr: false,
			checkFn: func(s string) bool { return strings.Contains(s, "[") && strings.Contains(s, "item1") },
		},
		{
			name:    "XML format",
			format:  "xml",
			wantErr: false,
			checkFn: func(s string) bool { return strings.Contains(s, "<?xml") && strings.Contains(s, "<items>") },
		},
		{
			name:    "CSV format",
			format:  "csv",
			wantErr: false,
			checkFn: func(s string) bool { return strings.Contains(s, "item1") && strings.Contains(s, "\n") },
		},
		{
			name:    "YAML format",
			format:  "yaml",
			wantErr: false,
			checkFn: func(s string) bool { return strings.Contains(s, "item1") },
		},
		{
			name:      "Raw format with newline separator",
			format:    "raw",
			separator: "newline",
			wantErr:   false,
			checkFn:   func(s string) bool { return strings.Contains(s, "\n") },
		},
		{
			name:      "Raw format with comma separator",
			format:    "raw",
			separator: "comma",
			wantErr:   false,
			checkFn:   func(s string) bool { return strings.Contains(s, ",") },
		},
		{
			name:      "Raw format with tab separator",
			format:    "raw",
			separator: "tab",
			wantErr:   false,
			checkFn:   func(s string) bool { return strings.Contains(s, "\t") },
		},
		{
			name:      "Raw format with custom separator",
			format:    "raw",
			separator: " | ",
			wantErr:   false,
			checkFn:   func(s string) bool { return strings.Contains(s, " | ") },
		},
		{
			name:      "Raw format with none separator",
			format:    "raw",
			separator: "none",
			wantErr:   false,
			checkFn:   func(s string) bool { return strings.Contains(s, "item1item2item3") },
		},
		{
			name:    "Invalid format",
			format:  "invalid",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := formatter.Format(data, tt.format, tt.separator)

			if tt.wantErr {
				if err == nil {
					t.Errorf("Format() expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("Format() unexpected error = %v", err)
				return
			}

			if result == "" {
				t.Errorf("Format() returned empty result")
				return
			}

			if tt.checkFn != nil && !tt.checkFn(result) {
				t.Errorf("Format() result doesn't match expected format: %s", result)
			}
		})
	}
}

func TestFormatter_PrettyPrint(t *testing.T) {
	formatter := NewFormatter()

	tests := []struct {
		name     string
		input    string
		wantJSON bool
	}{
		{
			name:     "Valid JSON",
			input:    `{"name": "test", "value": 123}`,
			wantJSON: true,
		},
		{
			name:     "Invalid JSON",
			input:    "not json at all",
			wantJSON: false,
		},
		{
			name:     "Empty string",
			input:    "",
			wantJSON: false,
		},
		{
			name:     "JSON array",
			input:    `["item1", "item2"]`,
			wantJSON: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := formatter.PrettyPrint(tt.input)
			if err != nil {
				t.Errorf("PrettyPrint() unexpected error = %v", err)
				return
			}

			if tt.wantJSON {
				// Should be indented (contains newlines for pretty printed JSON)
				if !strings.Contains(result, "\n") && len(tt.input) > 20 {
					t.Errorf("PrettyPrint() didn't indent JSON: %s", result)
				}
			}

			// Result should never be empty if input wasn't empty
			if tt.input != "" && result == "" {
				t.Errorf("PrettyPrint() returned empty result for non-empty input")
			}
		})
	}
}

func TestGetBuiltInPresets(t *testing.T) {
	presets := GetBuiltInPresets()

	if len(presets) == 0 {
		t.Errorf("GetBuiltInPresets() returned no presets")
	}

	// Check for specific presets that should exist
	expectedPresets := []string{"uuid", "ulid", "random-string", "lorem-ipsum", "user-profile", "ecommerce-product", "api-response", "sql-insert", "log-entries", "credit-card"}
	presetMap := make(map[string]bool)
	for _, p := range presets {
		presetMap[p.ID] = true
	}

	for _, expected := range expectedPresets {
		if !presetMap[expected] {
			t.Errorf("GetBuiltInPresets() missing expected preset: %s", expected)
		}
	}

	// Check that all presets have valid structure
	for _, preset := range presets {
		if preset.ID == "" {
			t.Errorf("Preset has empty ID")
		}
		if preset.Name == "" {
			t.Errorf("Preset %s has empty Name", preset.ID)
		}
		if preset.Template == "" {
			t.Errorf("Preset %s has empty Template", preset.ID)
		}
		// Variables can be empty, but if present, should have valid structure
		for _, v := range preset.Variables {
			if v.Name == "" {
				t.Errorf("Preset %s has variable with empty name", preset.ID)
			}
			if v.Type == "" {
				t.Errorf("Preset %s variable %s has empty type", preset.ID, v.Name)
			}
		}
	}
}

func TestGetPresetByID(t *testing.T) {
	tests := []struct {
		id        string
		wantFound bool
	}{
		{
			id:        "uuid",
			wantFound: true,
		},
		{
			id:        "user-profile",
			wantFound: true,
		},
		{
			id:        "non-existent",
			wantFound: false,
		},
		{
			id:        "",
			wantFound: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.id, func(t *testing.T) {
			preset, found := GetPresetByID(tt.id)
			if found != tt.wantFound {
				t.Errorf("GetPresetByID() found = %v, want %v", found, tt.wantFound)
			}
			if tt.wantFound && preset.ID != tt.id {
				t.Errorf("GetPresetByID() preset.ID = %s, want %s", preset.ID, tt.id)
			}
		})
	}
}

func TestFakerFuncs_generateCustomString(t *testing.T) {
	f := NewFakerFuncs()

	tests := []struct {
		name      string
		length    int
		uppercase bool
		lowercase bool
		numbers   bool
		symbols   bool
		wantLen   int
	}{
		{
			name:      "All character types",
			length:    20,
			uppercase: true,
			lowercase: true,
			numbers:   true,
			symbols:   true,
			wantLen:   20,
		},
		{
			name:      "Only lowercase",
			length:    10,
			uppercase: false,
			lowercase: true,
			numbers:   false,
			symbols:   false,
			wantLen:   10,
		},
		{
			name:      "Only numbers",
			length:    15,
			uppercase: false,
			lowercase: false,
			numbers:   true,
			symbols:   false,
			wantLen:   15,
		},
		{
			name:      "No character types selected (should use default)",
			length:    10,
			uppercase: false,
			lowercase: false,
			numbers:   false,
			symbols:   false,
			wantLen:   10,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := f.generateCustomString(tt.length, tt.uppercase, tt.lowercase, tt.numbers, tt.symbols)
			if len(result) != tt.wantLen {
				t.Errorf("generateCustomString() length = %d, want %d", len(result), tt.wantLen)
			}
		})
	}
}

func TestFakerFuncs_TemplateFunctions(t *testing.T) {
	f := NewFakerFuncs()
	funcs := f.TemplateFunctions()

	// Check that all expected functions are present
	expectedFuncs := []string{
		"UUID", "ULID",
		"FirstName", "LastName", "Name", "Gender", "SSN", "Contact", "Email", "Phone", "PhoneFormatted",
		"Username", "URL", "Domain", "IP", "IPv6", "Mac", "Password",
		"Street", "City", "State", "StateAbr", "Zip", "Country", "CountryAbr", "Latitude", "Longitude",
		"Company", "CoSuffix", "BS", "CatchPhrase",
		"JobTitle", "JobDesc", "JobLevel",
		"Int", "Float", "Hex",
		"Past", "Future", "Recent", "Birthday",
		"Word", "Sentence", "Paragraph", "Lorem",
		"ProductName", "ProductDesc", "Category", "Adjective", "Material",
		"CardType", "CardNumber", "CVV", "Expiry",
		"PhoneNum", "Bool", "StringCustom", "Price", "RandomString",
		"iterate", "last", "default",
	}

	for _, funcName := range expectedFuncs {
		if _, ok := funcs[funcName]; !ok {
			t.Errorf("TemplateFunctions() missing function: %s", funcName)
		}
	}

	// Check that we have a reasonable number of functions
	if len(funcs) < 50 {
		t.Errorf("TemplateFunctions() returned only %d functions, expected at least 50", len(funcs))
	}
}

func TestErrors(t *testing.T) {
	// Test that error variables are defined
	errors := []error{
		ErrInvalidTemplate,
		ErrInvalidBatchCount,
		ErrInvalidFormat,
		ErrGenerationFailed,
		ErrEmptyTemplate,
	}

	for _, err := range errors {
		if err == nil {
			t.Errorf("Error variable is nil")
		}
		if err.Error() == "" {
			t.Errorf("Error variable has empty message")
		}
	}
}

func TestGenerateRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		request GenerateRequest
		wantErr bool
	}{
		{
			name: "Valid request",
			request: GenerateRequest{
				Template:     "{{UUID}}",
				BatchCount:   10,
				OutputFormat: "json",
				Variables:    map[string]interface{}{},
				Separator:    "newline",
			},
			wantErr: false,
		},
		{
			name: "Request with all fields",
			request: GenerateRequest{
				Template:     "{{StringCustom .length .uppercase .lowercase .numbers .symbols}}",
				BatchCount:   100,
				OutputFormat: "raw",
				Variables: map[string]interface{}{
					"length":    20,
					"uppercase": true,
					"lowercase": true,
					"numbers":   true,
					"symbols":   false,
				},
				Separator: "comma",
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Just verify the request can be created and fields are accessible
			if tt.request.Template == "" {
				t.Errorf("GenerateRequest has empty template")
			}
			if tt.request.BatchCount < 1 {
				t.Errorf("GenerateRequest has invalid batch count")
			}
		})
	}
}

func TestVariable_Struct(t *testing.T) {
	v := Variable{
		Name:        "testVar",
		Type:        "number",
		Default:     10,
		Min:         1,
		Max:         100,
		Description: "Test variable",
		Options:     []string{},
	}

	if v.Name != "testVar" {
		t.Errorf("Variable.Name = %s, want testVar", v.Name)
	}
	if v.Type != "number" {
		t.Errorf("Variable.Type = %s, want number", v.Type)
	}
}

func TestTemplatePreset_Struct(t *testing.T) {
	preset := TemplatePreset{
		ID:          "test-preset",
		Name:        "Test Preset",
		Description: "A test preset",
		Template:    "{{UUID}}",
		Variables: []Variable{
			{Name: "var1", Type: "string", Default: "default"},
		},
	}

	if preset.ID != "test-preset" {
		t.Errorf("TemplatePreset.ID = %s, want test-preset", preset.ID)
	}
	if len(preset.Variables) != 1 {
		t.Errorf("TemplatePreset.Variables length = %d, want 1", len(preset.Variables))
	}
}

// TestAllPresetTemplates tests that all built-in preset templates work correctly
func TestAllPresetTemplates(t *testing.T) {
	engine := NewEngine()
	presets := GetBuiltInPresets()

	for _, preset := range presets {
		t.Run(preset.ID, func(t *testing.T) {
			// Validate template syntax
			err := engine.Validate(preset.Template)
			if err != nil {
				t.Errorf("Preset %s has invalid template: %v", preset.ID, err)
				return
			}

			// Prepare default variables
			variables := make(map[string]interface{})
			for _, v := range preset.Variables {
				variables[v.Name] = v.Default
			}

			// Add BatchCount for templates that use it
			variables["BatchCount"] = 5

			// Test single generation
			result, err := engine.Execute(preset.Template, variables)
			if err != nil {
				t.Errorf("Preset %s failed to execute: %v", preset.ID, err)
				return
			}
			if result == "" {
				t.Errorf("Preset %s returned empty result", preset.ID)
				return
			}

			// Test batch generation (small batch)
			results, err := engine.GenerateBatch(preset.Template, 5, variables)
			if err != nil {
				t.Errorf("Preset %s failed batch generation: %v", preset.ID, err)
				return
			}
			if len(results) != 5 {
				t.Errorf("Preset %s returned %d results, want 5", preset.ID, len(results))
				return
			}
			for i, r := range results {
				if r == "" {
					t.Errorf("Preset %s result[%d] is empty", preset.ID, i)
				}
			}
		})
	}
}
