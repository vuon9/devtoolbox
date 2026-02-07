package main

import (
	"fmt"
)

// GreetService struct
type GreetService struct{}

// Greet returns a greeting for the given name
func (a *GreetService) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
