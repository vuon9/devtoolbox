package datetimeconverter

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

// Service defines the Unix Time service interface
type Service interface {
	Convert(req ConvertRequest) ConvertResponse
	GetPresets() PresetsResponse
	CalculateDelta(req DeltaRequest) DeltaResponse
	GetAvailableTimezones() AvailableTimezonesResponse
}

// service implements the Service interface
type service struct{}

// NewService creates a new Unix Time service
func NewService() Service {
	return &service{}
}

// Convert converts a timestamp or date string to all formats
func (s *service) Convert(req ConvertRequest) ConvertResponse {
	if req.Input == "" {
		return ErrorResponse(ErrInvalidTimestamp)
	}

	// Detect input type
	inputType := DetectInputType(req.Input)

	var t time.Time
	var err error

	switch inputType {
	case InputTypeTimestamp:
		precision := Precision(req.Precision)
		if precision == PrecisionAuto {
			precision = DetectPrecision(req.Input)
		}
		t, err = ParseTimestamp(req.Input, precision)
		if err != nil {
			return ErrorResponse(err)
		}

	case InputTypeISO, InputTypeDate:
		t, err = parseDateString(req.Input)
		if err != nil {
			return ErrorResponse(err)
		}

	default:
		// Try to parse as timestamp anyway
		t, err = ParseTimestamp(req.Input, PrecisionAuto)
		if err != nil {
			return ErrorResponse(ErrInvalidTimestamp)
		}
		inputType = InputTypeTimestamp
	}

	// Apply timezone if specified
	if req.Timezone != "" && req.Timezone != "local" && req.Timezone != "UTC" {
		loc, err := time.LoadLocation(req.Timezone)
		if err == nil {
			t = t.In(loc)
		}
	}

	// Build result
	result := buildTimeResult(t)

	// Format the output
	format := FormatType(req.OutputFormat)
	if format == "" {
		format = FormatISO
	}
	result.Local = FormatTime(t, format, req.CustomFormat)

	detectedPrec := string(DetectPrecision(req.Input))
	if detectedPrec == "auto" {
		detectedPrec = "seconds"
	}

	return FromTimeResult(result, string(inputType), detectedPrec)
}

// GetPresets returns all available quick presets
func (s *service) GetPresets() PresetsResponse {
	now := time.Now()

	presets := []Preset{
		{
			ID:          "now",
			Label:       "Now",
			Description: "Current timestamp",
			Timestamp:   now.Unix(),
		},
		{
			ID:          "plus1hour",
			Label:       "+1 Hour",
			Description: "One hour from now",
			Timestamp:   now.Add(time.Hour).Unix(),
		},
		{
			ID:          "plus1day",
			Label:       "+1 Day",
			Description: "One day from now",
			Timestamp:   now.Add(24 * time.Hour).Unix(),
		},
		{
			ID:          "tomorrow9am",
			Label:       "Tomorrow 9am",
			Description: "Tomorrow at 9:00 AM",
			Timestamp:   time.Date(now.Year(), now.Month(), now.Day()+1, 9, 0, 0, 0, now.Location()).Unix(),
		},
		{
			ID:          "nextweek",
			Label:       "Next Week",
			Description: "Same time next week",
			Timestamp:   now.Add(7 * 24 * time.Hour).Unix(),
		},
		{
			ID:          "startofday",
			Label:       "Start of Day",
			Description: "Today at 00:00:00",
			Timestamp:   time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()).Unix(),
		},
		{
			ID:          "endofday",
			Label:       "End of Day",
			Description: "Today at 23:59:59",
			Timestamp:   time.Date(now.Year(), now.Month(), now.Day(), 23, 59, 59, 0, now.Location()).Unix(),
		},
		{
			ID:          "startofweek",
			Label:       "Start of Week",
			Description: "Monday 00:00:00",
			Timestamp:   getStartOfWeek(now).Unix(),
		},
		{
			ID:          "endofweek",
			Label:       "End of Week",
			Description: "Sunday 23:59:59",
			Timestamp:   getEndOfWeek(now).Unix(),
		},
		{
			ID:          "epoch",
			Label:       "Unix Epoch",
			Description: "January 1, 1970 00:00:00 UTC",
			Timestamp:   0,
		},
	}

	return PresetsResponse{Presets: presets}
}

// CalculateDelta calculates the difference between two dates
func (s *service) CalculateDelta(req DeltaRequest) DeltaResponse {
	dateA, err := parseFlexibleDate(req.DateA)
	if err != nil {
		return DeltaResponse{Error: err.Error()}
	}

	dateB, err := parseFlexibleDate(req.DateB)
	if err != nil {
		return DeltaResponse{Error: err.Error()}
	}

	diff := dateB.Sub(dateA)
	absDiff := diff
	if absDiff < 0 {
		absDiff = -absDiff
	}

	days := int(absDiff.Hours() / 24)
	hours := int(absDiff.Hours()) % 24
	minutes := int(absDiff.Minutes()) % 60
	seconds := int(absDiff.Seconds()) % 60

	delta := &TimeDelta{
		Days:         days,
		Hours:        hours,
		Minutes:      minutes,
		Seconds:      seconds,
		TotalHours:   absDiff.Hours(),
		TotalMinutes: absDiff.Minutes(),
		TotalSeconds: absDiff.Seconds(),
		IsFuture:     diff > 0,
	}

	return DeltaResponse{Delta: delta}
}

// AddTime performs date arithmetic
func (s *service) AddTime(req ArithmeticRequest) ArithmeticResponse {
	baseDate, err := parseFlexibleDate(req.BaseDate)
	if err != nil {
		return ArithmeticResponse{Error: err.Error()}
	}

	unit := TimeUnit(req.Unit)
	duration := time.Duration(req.Value)

	switch unit {
	case UnitSeconds:
		duration = duration * time.Second
	case UnitMinutes:
		duration = duration * time.Minute
	case UnitHours:
		duration = duration * time.Hour
	case UnitDays:
		duration = duration * 24 * time.Hour
	case UnitWeeks:
		duration = duration * 7 * 24 * time.Hour
	case UnitMonths:
		// Add months manually
		baseDate = addMonths(baseDate, req.Value)
		duration = 0
	case UnitYears:
		// Add years manually
		baseDate = addYears(baseDate, req.Value)
		duration = 0
	default:
		return ArithmeticResponse{Error: ErrInvalidUnit.Error()}
	}

	if req.Operation == "subtract" {
		duration = -duration
	}

	result := baseDate.Add(duration)

	return ArithmeticResponse{Result: buildTimeResult(result)}
}

func (s *service) GetAvailableTimezones() AvailableTimezonesResponse {
	timezones := make([]TimezoneInfo, 0)
	for _, zoneDir = range zoneDirs {
		readTimezonesFromFile("", &timezones)
	}

	return AvailableTimezonesResponse{
		Timezones: timezones,
	}
}

// Helper functions

func parseDateString(input string) (time.Time, error) {
	// Try various date formats
	formats := []string{
		time.RFC3339,
		time.RFC3339Nano,
		time.RFC1123,
		time.RFC1123Z,
		time.RFC822,
		time.RFC822Z,
		"2006-01-02 15:04:05",
		"2006-01-02 15:04",
		"2006-01-02",
		"01/02/2006 15:04:05",
		"01/02/2006",
		"02/01/2006 15:04:05",
		"02/01/2006",
		"20060102-150405",
		"20060102",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, input); err == nil {
			return t, nil
		}
	}

	return time.Time{}, ErrInvalidDate
}

func parseFlexibleDate(input string) (time.Time, error) {
	// Try parsing as timestamp first
	if ts, err := strconv.ParseInt(input, 10, 64); err == nil {
		if ts > 1e12 {
			return time.Unix(0, ts*1e6), nil // Milliseconds
		}
		return time.Unix(ts, 0), nil
	}

	// Try parsing as date string
	return parseDateString(input)
}

func buildTimeResult(t time.Time) *TimeResult {
	nanos := t.UnixNano()

	// Calculate relative time
	now := time.Now()
	diff := t.Sub(now)
	relative := formatRelativeTime(diff)
	relativeDetails := buildRelativeBreakdown(diff, t)

	return &TimeResult{
		UnixSeconds:     t.Unix(),
		UnixMillis:      nanos / 1e6,
		UnixMicros:      nanos / 1e3,
		UnixNanos:       nanos,
		UTC:             t.UTC().Format(time.RFC3339),
		Local:           t.Local().Format("2006-01-02 15:04:05"),
		Relative:        relative,
		RelativeDetails: relativeDetails,
	}
}

func formatRelativeTime(diff time.Duration) string {
	if diff == 0 {
		return "now"
	}

	absDiff := diff
	isFuture := diff > 0
	if absDiff < 0 {
		absDiff = -absDiff
	}

	days := int(absDiff.Hours() / 24)
	hours := int(absDiff.Hours()) % 24
	minutes := int(absDiff.Minutes()) % 60
	seconds := int(absDiff.Seconds()) % 60

	var parts []string
	if days > 0 {
		parts = append(parts, fmt.Sprintf("%d day%s", days, plural(days)))
	}
	if hours > 0 {
		parts = append(parts, fmt.Sprintf("%d hour%s", hours, plural(hours)))
	}
	if minutes > 0 && days == 0 {
		parts = append(parts, fmt.Sprintf("%d minute%s", minutes, plural(minutes)))
	}
	if seconds > 0 && days == 0 && hours == 0 {
		parts = append(parts, fmt.Sprintf("%d second%s", seconds, plural(seconds)))
	}

	result := strings.Join(parts, ", ")
	if isFuture {
		return "in " + result
	}
	return result + " ago"
}

func buildRelativeBreakdown(diff time.Duration, t time.Time) RelativeBreakdown {
	absDiff := diff
	if absDiff < 0 {
		absDiff = -absDiff
	}

	days := int(absDiff.Hours() / 24)
	hours := int(absDiff.Hours()) % 24
	minutes := int(absDiff.Minutes()) % 60
	seconds := int(absDiff.Seconds()) % 60

	// Days since epoch
	epoch := UnixEpoch()
	daysSinceEpoch := int(t.Sub(epoch).Hours() / 24)

	return RelativeBreakdown{
		Days:           days,
		Hours:          hours,
		Minutes:        minutes,
		Seconds:        seconds,
		TotalHours:     int(absDiff.Hours()),
		TotalMinutes:   int(absDiff.Minutes()),
		TotalSeconds:   int(absDiff.Seconds()),
		DaysSinceEpoch: daysSinceEpoch,
	}
}

func plural(n int) string {
	if n == 1 {
		return ""
	}
	return "s"
}

func getStartOfWeek(t time.Time) time.Time {
	// Monday is start of week
	weekday := int(t.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	daysSinceMonday := weekday - 1
	return time.Date(t.Year(), t.Month(), t.Day()-daysSinceMonday, 0, 0, 0, 0, t.Location())
}

func getEndOfWeek(t time.Time) time.Time {
	// Sunday is end of week
	weekday := int(t.Weekday())
	if weekday == 0 {
		return time.Date(t.Year(), t.Month(), t.Day(), 23, 59, 59, 0, t.Location())
	}
	daysUntilSunday := 7 - weekday
	return time.Date(t.Year(), t.Month(), t.Day()+daysUntilSunday, 23, 59, 59, 0, t.Location())
}

func addMonths(t time.Time, months int) time.Time {
	newMonth := t.Month() + time.Month(months)
	newYear := t.Year()

	for newMonth > 12 {
		newMonth -= 12
		newYear++
	}
	for newMonth < 1 {
		newMonth += 12
		newYear--
	}

	// Handle day overflow (e.g., Jan 31 + 1 month = Feb 28/29)
	daysInMonth := daysIn(newMonth, newYear)
	newDay := t.Day()
	if newDay > daysInMonth {
		newDay = daysInMonth
	}

	return time.Date(newYear, newMonth, newDay, t.Hour(), t.Minute(), t.Second(), t.Nanosecond(), t.Location())
}

func addYears(t time.Time, years int) time.Time {
	newYear := t.Year() + years

	// Handle Feb 29 on non-leap years
	if t.Month() == time.February && t.Day() == 29 {
		if !isLeapYear(newYear) {
			return time.Date(newYear, time.February, 28, t.Hour(), t.Minute(), t.Second(), t.Nanosecond(), t.Location())
		}
	}

	return time.Date(newYear, t.Month(), t.Day(), t.Hour(), t.Minute(), t.Second(), t.Nanosecond(), t.Location())
}

func daysIn(m time.Month, year int) int {
	switch m {
	case time.January, time.March, time.May, time.July, time.August, time.October, time.December:
		return 31
	case time.April, time.June, time.September, time.November:
		return 30
	case time.February:
		if isLeapYear(year) {
			return 29
		}
		return 28
	}
	return 0
}

func isLeapYear(year int) bool {
	return year%4 == 0 && (year%100 != 0 || year%400 == 0)
}
