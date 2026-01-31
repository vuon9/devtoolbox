package datagenerator

import (
	"bytes"
	"fmt"
	"strings"
	"text/template"
	"time"

	"github.com/brianvoe/gofakeit/v7"
)

// FakerFuncs holds all available faker functions
type FakerFuncs struct {
	faker *gofakeit.Faker
}

// NewFakerFuncs creates a new FakerFuncs instance
func NewFakerFuncs() *FakerFuncs {
	return &FakerFuncs{
		faker: gofakeit.New(0),
	}
}

// NewFakerFuncsWithSeed creates a new FakerFuncs instance with a specific seed
func NewFakerFuncsWithSeed(seed int64) *FakerFuncs {
	return &FakerFuncs{
		faker: gofakeit.New(uint64(seed)),
	}
}

// TemplateFunctions returns the map of template functions
func (f *FakerFuncs) TemplateFunctions() template.FuncMap {
	return template.FuncMap{
		// UUID & IDs
		"UUID": f.faker.UUID,
		"ULID": func() string {
			return f.faker.UUID() // Fallback to UUID since gofakeit doesn't have ULID
		},

		// Person
		"FirstName":      f.faker.FirstName,
		"LastName":       f.faker.LastName,
		"Name":           f.faker.Name,
		"Gender":         f.faker.Gender,
		"SSN":            f.faker.SSN,
		"Contact":        f.faker.Contact,
		"Email":          f.faker.Email,
		"Phone":          f.faker.Phone,
		"PhoneFormatted": f.faker.PhoneFormatted,

		// Internet
		"Username": f.faker.Username,
		"URL":      f.faker.URL,
		"Domain":   f.faker.DomainName,
		"IP":       f.faker.IPv4Address,
		"IPv6":     f.faker.IPv6Address,
		"Mac":      f.faker.MacAddress,
		"Password": f.faker.Password,

		// Address
		"Street":     f.faker.Street,
		"City":       f.faker.City,
		"State":      f.faker.State,
		"StateAbr":   f.faker.StateAbr,
		"Zip":        f.faker.Zip,
		"Country":    f.faker.Country,
		"CountryAbr": f.faker.CountryAbr,
		"Latitude":   f.faker.Latitude,
		"Longitude":  f.faker.Longitude,

		// Company
		"Company":     f.faker.Company,
		"CoSuffix":    f.faker.CompanySuffix,
		"BS":          f.faker.BS,
		"CatchPhrase": f.faker.BuzzWord,

		// Job
		"JobTitle": f.faker.JobTitle,
		"JobDesc":  f.faker.JobDescriptor,
		"JobLevel": f.faker.JobLevel,

		// Number
		"Int": func(min, max int) int {
			return f.faker.Number(min, max)
		},
		"Float": func(min, max float64) float64 {
			return f.faker.Float64Range(min, max)
		},
		"Hex": f.faker.HexColor,

		// Date
		"Past":   func() string { return f.faker.Date().Format(time.RFC3339) },
		"Future": func() string { return f.faker.FutureDate().Format(time.RFC3339) },
		"Recent": func() string {
			return f.faker.DateRange(time.Now().AddDate(0, 0, -30), time.Now()).Format(time.RFC3339)
		},
		"Birthday": func() string {
			return f.faker.DateRange(time.Now().AddDate(-80, 0, 0), time.Now().AddDate(-18, 0, 0)).Format(time.RFC3339)
		},

		// Lorem
		"Word":      f.faker.Word,
		"Sentence":  func() string { return f.faker.Sentence(10) },
		"Paragraph": func() string { return f.faker.Paragraph(3, 5, 10, " ") },
		"Lorem": func(loremType string, count int) string {
			switch loremType {
			case "words":
				words := make([]string, count)
				for i := 0; i < count; i++ {
					words[i] = f.faker.Word()
				}
				return strings.Join(words, " ")
			case "sentences":
				sentences := make([]string, count)
				for i := 0; i < count; i++ {
					sentences[i] = f.faker.Sentence(10)
				}
				return strings.Join(sentences, " ")
			case "paragraphs":
				paragraphs := make([]string, count)
				for i := 0; i < count; i++ {
					paragraphs[i] = f.faker.Paragraph(3, 5, 10, " ")
				}
				return strings.Join(paragraphs, "\n\n")
			default:
				return f.faker.Paragraph(3, 5, 10, " ")
			}
		},

		// Product
		"ProductName": f.faker.ProductName,
		"ProductDesc": f.faker.ProductDescription,
		"Category":    f.faker.ProductCategory,
		"Adjective":   f.faker.Adjective,
		"Material":    f.faker.ProductMaterial,

		// Credit Card
		"CardType": f.faker.CreditCardType,
		"CardNumber": func() string {
			return f.faker.CreditCardNumber(nil)
		},
		"CVV":    f.faker.CreditCardCvv,
		"Expiry": f.faker.CreditCardExp,

		// Phone
		"PhoneNum": f.faker.Phone,

		// Boolean
		"Bool": f.faker.Bool,

		// Custom string generator
		"StringCustom": f.generateCustomString,

		// Price
		"Price": func(min, max float64) float64 {
			return f.faker.Price(min, max)
		},

		// Random selection
		"RandomString": func(options ...string) string {
			if len(options) == 0 {
				return ""
			}
			return options[f.faker.Number(0, len(options)-1)]
		},

		// Template helpers
		"iterate": func(count int) []int {
			result := make([]int, count)
			for i := 0; i < count; i++ {
				result[i] = i
			}
			return result
		},
		"last": func(index, total int) bool {
			return index == total-1
		},
		"default": func(val, defaultVal interface{}) interface{} {
			if val == nil || val == "" {
				return defaultVal
			}
			return val
		},
	}
}

// generateCustomString generates a custom string based on options
func (f *FakerFuncs) generateCustomString(length int, uppercase, lowercase, numbers, symbols bool) string {
	var chars string
	if uppercase {
		chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	}
	if lowercase {
		chars += "abcdefghijklmnopqrstuvwxyz"
	}
	if numbers {
		chars += "0123456789"
	}
	if symbols {
		chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"
	}

	if chars == "" {
		chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	}

	result := make([]byte, length)
	for i := 0; i < length; i++ {
		result[i] = chars[f.faker.Number(0, len(chars)-1)]
	}
	return string(result)
}

// Engine handles template parsing and execution
type Engine struct {
	fakerFuncs *FakerFuncs
}

// NewEngine creates a new template engine
func NewEngine() *Engine {
	return &Engine{
		fakerFuncs: NewFakerFuncs(),
	}
}

// NewEngineWithSeed creates a new template engine with a specific seed
func NewEngineWithSeed(seed int64) *Engine {
	return &Engine{
		fakerFuncs: NewFakerFuncsWithSeed(seed),
	}
}

// Execute parses and executes a template with the given data
func (e *Engine) Execute(templateStr string, data interface{}) (string, error) {
	if strings.TrimSpace(templateStr) == "" {
		return "", ErrEmptyTemplate
	}

	// Create template with custom functions
	tmpl, err := template.New("datagen").
		Funcs(e.fakerFuncs.TemplateFunctions()).
		Parse(templateStr)
	if err != nil {
		return "", fmt.Errorf("%w: %v", ErrInvalidTemplate, err)
	}

	// Execute template
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("%w: %v", ErrGenerationFailed, err)
	}

	return buf.String(), nil
}

// Validate checks if a template is valid
func (e *Engine) Validate(templateStr string) error {
	if strings.TrimSpace(templateStr) == "" {
		return ErrEmptyTemplate
	}

	_, err := template.New("validate").
		Funcs(e.fakerFuncs.TemplateFunctions()).
		Parse(templateStr)

	if err != nil {
		return fmt.Errorf("%w: %v", ErrInvalidTemplate, err)
	}

	return nil
}

// GenerateBatch generates multiple records using a template
func (e *Engine) GenerateBatch(templateStr string, batchCount int, variables map[string]interface{}) ([]string, error) {
	if batchCount < 1 || batchCount > 1000 {
		return nil, ErrInvalidBatchCount
	}

	// Prepare data with batch count
	data := make(map[string]interface{})
	for k, v := range variables {
		data[k] = v
	}
	data["BatchCount"] = batchCount

	results := make([]string, batchCount)
	for i := 0; i < batchCount; i++ {
		// Create a new faker for each iteration to ensure randomness
		seed := time.Now().UnixNano() + int64(i)
		e.fakerFuncs = NewFakerFuncsWithSeed(seed)

		result, err := e.Execute(templateStr, data)
		if err != nil {
			return nil, err
		}
		results[i] = result
	}

	return results, nil
}
