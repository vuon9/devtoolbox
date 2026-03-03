package codeformatter

import (
	"strings"
	"testing"
)

func TestApplyXPathFilter(t *testing.T) {
	tests := []struct {
		name      string
		xml       string
		xpath     string
		want      string
		wantError bool
	}{
		{
			name:  "Simple element selector with //",
			xml:   `<root><item>One</item><item>Two</item></root>`,
			xpath: "//item",
			want:  "<item>One</item>\n<item>Two</item>",
		},
		{
			name:  "Simple element selector with /",
			xml:   `<root><item>One</item></root>`,
			xpath: "/root",
			want:  `<root><item>One</item></root>`,
		},
		{
			name:  "Nested path selector",
			xml:   `<catalog><book><author>John</author></book></catalog>`,
			xpath: "catalog/book/author",
			want:  `<author>John</author>`,
		},
		{
			name:  "Nested path with // prefix",
			xml:   `<catalog><book><author>John</author></book></catalog>`,
			xpath: "//catalog/book",
			want:  `<book><author>John</author></book>`,
		},
		{
			name:  "Attribute selector with =",
			xml:   `<book id="bk101"><title>XML Guide</title></book><book id="bk102"><title>Other</title></book>`,
			xpath: "//book[@id='bk101']",
			want:  `<book id="bk101"><title>XML Guide</title></book>`,
		},
		{
			name:  "Attribute selector with nested path",
			xml:   `<book id="bk101"><author>Gambardella</author></book>`,
			xpath: "//book[@id='bk101']/author",
			want:  `<author>Gambardella</author>`,
		},
		{
			name:  "Attribute extraction with /@",
			xml:   `<book id="bk101" price="44.95"><title>Book</title></book>`,
			xpath: "//book/@id",
			want:  "bk101",
		},
		{
			name:  "Double quotes in attribute value",
			xml:   `<book id="bk101">Content</book>`,
			xpath: `//book[@id="bk101"]`,
			want:  `<book id="bk101">Content</book>`,
		},
		{
			name:      "No matching elements",
			xml:       `<root><item>One</item></root>`,
			xpath:     "//nonexistent",
			wantError: true,
		},
		{
			name:      "Non-existent attribute",
			xml:       `<book id="bk101"></book>`,
			xpath:     `//book[@id='bk999']`,
			wantError: true,
		},
		{
			name:      "Non-existent nested path",
			xml:       `<catalog><book><author>Name</author></book></catalog>`,
			xpath:     "catalog/book/nonexistent",
			wantError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := applyXPathFilter(tt.xml, tt.xpath)
			if (err != nil) != tt.wantError {
				t.Errorf("applyXPathFilter() error = %v, wantError %v", err, tt.wantError)
				return
			}
			if !tt.wantError {
				// Normalize whitespace for comparison
				gotNormalized := strings.TrimSpace(got)
				wantNormalized := strings.TrimSpace(tt.want)
				if gotNormalized != wantNormalized {
					t.Errorf("applyXPathFilter() = %v, want %v", gotNormalized, wantNormalized)
				}
			}
		})
	}
}

func TestExtractXMLElements(t *testing.T) {
	xml := `<root><item>First</item><item>Second</item><other>Other</other></root>`

	results, err := extractXMLElements(xml, "item")
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	// Split by newline to count elements since function returns joined string
	elements := strings.Split(strings.TrimSpace(results), "\n")
	if len(elements) != 2 {
		t.Errorf("Expected 2 items, got %d", len(elements))
	}

	_, err = extractXMLElements(xml, "nonexistent")
	if err == nil {
		t.Error("Expected error for non-existent element")
	}
}

func TestExtractNestedXMLElements(t *testing.T) {
	xml := `<catalog>
		<book>
			<author>Author1</author>
			<title>Title1</title>
		</book>
		<book>
			<author>Author2</author>
			<title>Title2</title>
		</book>
	</catalog>`

	results, err := extractNestedXMLElements(xml, []string{"catalog", "book", "author"})
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	// Should find both authors
	if !strings.Contains(results, "Author1") || !strings.Contains(results, "Author2") {
		t.Errorf("Expected to find both authors, got: %s", results)
	}

	// Test single level - use extractXMLElementsSlice to get slice and count properly
	booksSlice, err := extractXMLElementsSlice(xml, "book")
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if len(booksSlice) != 2 {
		t.Errorf("Expected 2 books, got %d", len(booksSlice))
	}
}

func TestExtractElementByAttribute(t *testing.T) {
	xml := `<library>
		<book id="bk101" genre="fiction"><title>Book1</title></book>
		<book id="bk102" genre="tech"><title>Book2</title></book>
	</library>`

	// Test finding by attribute
	result, err := extractElementByAttribute(xml, `//book[@id='bk101']`)
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if !strings.Contains(result, "Book1") {
		t.Errorf("Expected to find book with title 'Book1', got: %s", result)
	}

	// Test finding by different attribute
	result, err = extractElementByAttribute(xml, `//book[@genre='tech']`)
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if !strings.Contains(result, "Book2") {
		t.Errorf("Expected to find book with title 'Book2', got: %s", result)
	}

	// Test with nested path
	result, err = extractElementByAttribute(xml, `//book[@id='bk101']/title`)
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if !strings.Contains(result, "Book1") {
		t.Errorf("Expected to find title 'Book1', got: %s", result)
	}

	// Test non-existent
	_, err = extractElementByAttribute(xml, `//book[@id='bk999']`)
	if err == nil {
		t.Error("Expected error for non-existent attribute value")
	}
}

func TestExtractXMLAttributes(t *testing.T) {
	xml := `<root>
		<item id="1" name="first">Content1</item>
		<item id="2" name="second">Content2</item>
	</root>`

	results, err := extractXMLAttributes(xml, "item", "id")
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	// Should find both id attributes
	if !strings.Contains(results, "1") || !strings.Contains(results, "2") {
		t.Errorf("Expected to find both id attributes, got: %s", results)
	}

	// Test different attribute
	results, err = extractXMLAttributes(xml, "item", "name")
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if !strings.Contains(results, "first") || !strings.Contains(results, "second") {
		t.Errorf("Expected to find both name attributes, got: %s", results)
	}

	// Test non-existent attribute
	_, err = extractXMLAttributes(xml, "item", "nonexistent")
	if err == nil {
		t.Error("Expected error for non-existent attribute")
	}
}
