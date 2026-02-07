package datetimeconverter

import "fmt"

// Domain errors for unixtime package
var (
	ErrInvalidTimestamp = fmt.Errorf("invalid timestamp")
	ErrInvalidDate      = fmt.Errorf("invalid date format")
	ErrInvalidPrecision = fmt.Errorf("invalid precision")
	ErrInvalidTimezone  = fmt.Errorf("invalid timezone")
	ErrInvalidUnit      = fmt.Errorf("invalid time unit")
)
