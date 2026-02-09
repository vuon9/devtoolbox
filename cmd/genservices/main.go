package main

import (
	"flag"
	"fmt"
	"log"
	"path/filepath"
)

func main() {
	var (
		serviceDir = flag.String("services", "service", "Directory containing Go service files")
		outputDir  = flag.String("output", "frontend/src/generated", "Output directory for generated TypeScript")
	)
	flag.Parse()

	// Get absolute paths
	absServiceDir, err := filepath.Abs(*serviceDir)
	if err != nil {
		log.Fatal(err)
	}

	absOutputDir, err := filepath.Abs(*outputDir)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Parsing services from: %s\n", absServiceDir)
	fmt.Printf("Generating TypeScript to: %s\n", absOutputDir)

	// Parse services
	parser := NewParser(absServiceDir)
	services, err := parser.ParseServices()
	if err != nil {
		log.Fatal("Failed to parse services:", err)
	}

	fmt.Printf("Found %d services\n", len(services))
	for _, svc := range services {
		fmt.Printf("  - %s (%d methods)\n", svc.Name, len(svc.Methods))
	}

	// Generate TypeScript
	generator, err := NewGenerator(absOutputDir)
	if err != nil {
		log.Fatal("Failed to create generator:", err)
	}

	if err := generator.Generate(services); err != nil {
		log.Fatal("Failed to generate TypeScript:", err)
	}

	fmt.Println("✓ Generation complete!")
}
