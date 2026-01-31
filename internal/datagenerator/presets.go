package datagenerator

// GetBuiltInPresets returns all built-in template presets
func GetBuiltInPresets() []TemplatePreset {
	return []TemplatePreset{
		{
			ID:          "uuid",
			Name:        "UUID",
			Description: "Generate UUID v4 identifiers",
			Template:    "{{UUID}}",
			Variables:   []Variable{},
		},
		{
			ID:          "ulid",
			Name:        "ULID",
			Description: "Generate ULID identifiers (UUID fallback)",
			Template:    "{{ULID}}",
			Variables:   []Variable{},
		},
		{
			ID:          "random-string",
			Name:        "Random String",
			Description: "Generate random strings with configurable options",
			Template:    "{{StringCustom .length .uppercase .lowercase .numbers .symbols}}",
			Variables: []Variable{
				{
					Name:        "length",
					Type:        "number",
					Default:     32,
					Min:         1,
					Max:         2048,
					Description: "Length of the generated string",
				},
				{
					Name:        "uppercase",
					Type:        "boolean",
					Default:     true,
					Description: "Include uppercase letters (A-Z)",
				},
				{
					Name:        "lowercase",
					Type:        "boolean",
					Default:     true,
					Description: "Include lowercase letters (a-z)",
				},
				{
					Name:        "numbers",
					Type:        "boolean",
					Default:     true,
					Description: "Include numbers (0-9)",
				},
				{
					Name:        "symbols",
					Type:        "boolean",
					Default:     false,
					Description: "Include special symbols (!@#$%...)",
				},
			},
		},
		{
			ID:          "lorem-ipsum",
			Name:        "Lorem Ipsum",
			Description: "Generate placeholder text",
			Template:    "{{Lorem .type .count}}",
			Variables: []Variable{
				{
					Name:        "type",
					Type:        "select",
					Default:     "paragraphs",
					Options:     []string{"paragraphs", "sentences", "words"},
					Description: "Type of lorem ipsum content",
				},
				{
					Name:        "count",
					Type:        "number",
					Default:     3,
					Min:         1,
					Max:         100,
					Description: "Number of items to generate",
				},
			},
		},
		{
			ID:          "user-profile",
			Name:        "User Profile",
			Description: "Generate user profile data with nested objects",
			Template: `{
  "id": "{{UUID}}",
  "firstName": "{{FirstName}}",
  "lastName": "{{LastName}}",
  "email": "{{Email}}",
  "phone": "{{PhoneFormatted}}",
  "age": {{Int 18 80}},
  "gender": "{{Gender}}",
  "jobTitle": "{{JobTitle}}",
  "company": "{{Company}}",
  "address": {
    "street": "{{Street}}",
    "city": "{{City}}",
    "state": "{{State}}",
    "zipCode": "{{Zip}}",
    "country": "{{Country}}"
  },
  "username": "{{Username}}",
  "website": "{{URL}}",
  "avatar": "https://i.pravatar.cc/150?u={{UUID}}"
}`,
			Variables: []Variable{},
		},
		{
			ID:          "ecommerce-product",
			Name:        "E-commerce Product",
			Description: "Generate product catalog data",
			Template: `{
  "sku": "{{StringCustom 8 true true false false}}",
  "name": "{{ProductName}}",
  "description": "{{ProductDesc}}",
  "price": {{Price 10 1000}},
  "currency": "USD",
  "category": "{{Category}}",
  "brand": "{{Company}}",
  "inStock": {{Bool}},
  "rating": {{Float 1 5}},
  "reviewCount": {{Int 0 500}},
  "tags": ["{{Adjective}}", "{{Adjective}}", "{{Material}}"],
  "images": [
    "https://picsum.photos/400/400?random={{Int 1 1000}}",
    "https://picsum.photos/400/400?random={{Int 1 1000}}"
  ]
}`,
			Variables: []Variable{},
		},
		{
			ID:          "api-response",
			Name:        "API Response",
			Description: "Generate mock REST API response with pagination",
			Template: `{
  "data": [
{{range $i, $_ := iterate .BatchCount}}
    {
      "id": {{$i}},
      "uuid": "{{UUID}}",
      "title": "{{Sentence}}",
      "content": "{{Paragraph}}",
      "author": {
        "name": "{{Name}}",
        "email": "{{Email}}"
      },
      "status": "{{RandomString "published" "draft" "archived"}}",
      "tags": ["{{Word}}", "{{Word}}"],
      "createdAt": "{{Recent}}",
      "updatedAt": "{{Recent}}"
    }{{if not (last $i $.BatchCount)}},{{end}}
{{end}}
  ],
  "pagination": {
    "page": 1,
    "perPage": {{.BatchCount}},
    "total": {{.BatchCount}},
    "totalPages": 1
  }
}`,
			Variables: []Variable{},
		},
		{
			ID:          "sql-insert",
			Name:        "SQL Insert Statements",
			Description: "Generate SQL INSERT statements for database seeding",
			Template: `{{range $i, $_ := iterate .BatchCount}}
INSERT INTO users (id, first_name, last_name, email, age, created_at) 
VALUES ('{{UUID}}', '{{FirstName}}', '{{LastName}}', '{{Email}}', {{Int 18 80}}, '{{Past}}');
{{end}}`,
			Variables: []Variable{},
		},
		{
			ID:          "log-entries",
			Name:        "Log Entries",
			Description: "Generate structured log entries",
			Template: `{{range $i, $_ := iterate .BatchCount}}
[{{Recent}}] {{RandomString "INFO" "WARN" "ERROR" "DEBUG"}}: {{Sentence}} | user={{Username}} | ip={{IP}} | duration={{Int 10 5000}}ms
{{end}}`,
			Variables: []Variable{},
		},
		{
			ID:          "credit-card",
			Name:        "Credit Card",
			Description: "Generate credit card information",
			Template: `{
  "type": "{{CardType}}",
  "number": "{{CardNumber}}",
  "cvv": "{{CVV}}",
  "expiry": "{{Expiry}}",
  "holder": "{{Name}}"
}`,
			Variables: []Variable{},
		},
	}
}

// GetPresetByID returns a preset by its ID
func GetPresetByID(id string) (TemplatePreset, bool) {
	for _, preset := range GetBuiltInPresets() {
		if preset.ID == id {
			return preset, true
		}
	}
	return TemplatePreset{}, false
}
