package codeformatter

import (
	"strings"
	"testing"

	"golang.org/x/net/html"
)

func TestApplyCSSSelector(t *testing.T) {
	tests := []struct {
		name      string
		html      string
		selector  string
		want      string
		wantError bool
	}{
		{
			name:     "Element selector - find all divs",
			html:     `<div class="a">First</div><div class="b">Second</div>`,
			selector: "div",
			want:     "<div class=\"a\">First</div>\n<div class=\"b\">Second</div>",
		},
		{
			name:     "Class selector - find by class",
			html:     `<div class="container">Content</div><span class="other">Other</span>`,
			selector: ".container",
			want:     `<div class="container">Content</div>`,
		},
		{
			name:     "ID selector - find by id",
			html:     `<div id="main">Main Content</div><div id="sidebar">Sidebar</div>`,
			selector: "#main",
			want:     `<div id="main">Main Content</div>`,
		},
		{
			name:     "Element with class selector",
			html:     `<div class="header">Header</div><span class="header">Span Header</span>`,
			selector: "div.header",
			want:     `<div class="header">Header</div>`,
		},
		{
			name:     "Descendant selector with >",
			html:     `<div class="container"><h1>Title</h1><p>Text</p></div>`,
			selector: "div.container > h1",
			want:     `<h1>Title</h1>`,
		},
		{
			name:     "Descendant selector with space",
			html:     `<div class="container"><section><h1>Title</h1></section></div>`,
			selector: "div.container h1",
			want:     `<h1>Title</h1>`,
		},
		{
			name: "Complex HTML - find articles",
			html: `<!DOCTYPE html><html><body>
				<article class="post"><h2>Post 1</h2></article>
				<article class="post"><h2>Post 2</h2></article>
			</body></html>`,
			selector: "article",
			want:     "<article class=\"post\"><h2>Post 1</h2></article>\n<article class=\"post\"><h2>Post 2</h2></article>",
		},
		{
			name:     "No html/body wrapper - elements extracted directly",
			html:     `<genre>Computer</genre><genre>Tech</genre>`,
			selector: "genre",
			want:     "<genre>Computer</genre>\n<genre>Tech</genre>",
		},
		{
			name:      "No matching elements",
			html:      `<div>Content</div>`,
			selector:  "span",
			wantError: true,
		},
		{
			name:      "Non-existent ID",
			html:      `<div id="main">Main</div>`,
			selector:  "#nonexistent",
			wantError: true,
		},
		{
			name:      "Non-existent class",
			html:      `<div class="a">A</div>`,
			selector:  ".b",
			wantError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := applyCSSSelector(tt.html, tt.selector)
			if (err != nil) != tt.wantError {
				t.Errorf("applyCSSSelector() error = %v, wantError %v", err, tt.wantError)
				return
			}
			if !tt.wantError {
				// Normalize whitespace for comparison
				gotNormalized := strings.TrimSpace(got)
				wantNormalized := strings.TrimSpace(tt.want)
				if gotNormalized != wantNormalized {
					t.Errorf("applyCSSSelector() = %v, want %v", gotNormalized, wantNormalized)
				}
			}
		})
	}
}

func TestFindHTMLElements(t *testing.T) {
	html := `<div>First</div><div>Second</div><span>Third</span>`
	doc := parseHTML(t, html)

	results := findHTMLElements(doc, "div")
	if len(results) != 2 {
		t.Errorf("Expected 2 div elements, got %d", len(results))
	}

	results = findHTMLElements(doc, "span")
	if len(results) != 1 {
		t.Errorf("Expected 1 span element, got %d", len(results))
	}
}

func TestFindElementsByClass(t *testing.T) {
	html := `<div class="container main">First</div><div class="container">Second</div><span class="other">Third</span>`
	doc := parseHTML(t, html)

	results := findElementsByClass(doc, "container")
	if len(results) != 2 {
		t.Errorf("Expected 2 elements with class 'container', got %d", len(results))
	}

	results = findElementsByClass(doc, "main")
	if len(results) != 1 {
		t.Errorf("Expected 1 element with class 'main', got %d", len(results))
	}

	results = findElementsByClass(doc, "nonexistent")
	if len(results) != 0 {
		t.Errorf("Expected 0 elements with class 'nonexistent', got %d", len(results))
	}
}

func TestFindElementByID(t *testing.T) {
	html := `<div id="main">Main Content</div><div id="sidebar">Sidebar Content</div>`
	doc := parseHTML(t, html)

	result := findElementByID(doc, "main")
	if result == "" {
		t.Error("Expected to find element with id 'main'")
	}
	if !strings.Contains(result, "Main Content") {
		t.Error("Expected result to contain 'Main Content'")
	}

	result = findElementByID(doc, "nonexistent")
	if result != "" {
		t.Error("Expected empty result for non-existent id")
	}
}

func TestFindElementsByDescendant(t *testing.T) {
	html := `<div class="container"><h1>Title</h1><p>Text</p><div class="inner"><h1>Inner Title</h1></div></div>`
	doc := parseHTML(t, html)

	// Test element with class selector
	results := findElementsByDescendant(doc, "div.container > h1")
	if len(results) != 1 {
		t.Errorf("Expected 1 h1 inside div.container, got %d", len(results))
	}

	// Test simple tag selector at end
	results = findElementsByDescendant(doc, "div h1")
	if len(results) != 2 {
		t.Errorf("Expected 2 h1 elements inside div, got %d", len(results))
	}
}

// Helper function to parse HTML for testing
func parseHTML(t *testing.T, htmlContent string) *html.Node {
	t.Helper()
	doc, err := html.Parse(strings.NewReader(htmlContent))
	if err != nil {
		t.Fatalf("Failed to parse HTML: %v", err)
	}
	return doc
}
