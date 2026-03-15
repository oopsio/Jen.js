//go:build js && wasm
// +build js,wasm

package main

import (
	"fmt"
	"net/url"
	"regexp"
	"strings"
)

// Matcher handles route matching and parameter extraction
type Matcher struct {
	routes []RouteEntry
}

// NewMatcher creates a new Matcher instance
func NewMatcher(routes []RouteEntry) *Matcher {
	return &Matcher{routes: routes}
}

// Match finds a matching route for the given pathname and extracts parameters
func (m *Matcher) Match(pathname string) (*MatchResult, error) {
	for _, route := range m.routes {
		re, err := regexp.Compile(route.Pattern)
		if err != nil {
			continue
		}

		matches := re.FindStringSubmatch(pathname)
		if matches == nil {
			continue
		}

		// Extract parameters from captured groups
		params := make(map[string]string)
		for i, paramName := range route.ParamNames {
			// Captured group 0 is the full match, groups 1+ are parameters
			paramValue := matches[i+1]

			// URL-decode the parameter value
			decodedValue, err := url.QueryUnescape(paramValue)
			if err != nil {
				decodedValue = paramValue
			}

			// Determine if this is a catch-all parameter
			isCatchAll := paramName == "rest" || strings.Contains(route.Pattern, ".*")

			// Validate the parameter
			if err := validateRouteParam(paramName, decodedValue, isCatchAll); err != nil {
				return nil, err
			}

			params[paramName] = decodedValue
		}

		return &MatchResult{
			Route:  &route,
			Params: params,
		}, nil
	}

	return nil, nil
}

// InvalidRouteParamError represents an invalid route parameter
type InvalidRouteParamError struct {
	ParamName string
	Message   string
}

func (e *InvalidRouteParamError) Error() string {
	return fmt.Sprintf("Invalid route parameter \"%s\": %s", e.ParamName, e.Message)
}

// validateRouteParam validates a route parameter to prevent path traversal and injection attacks
func validateRouteParam(paramName string, paramValue string, isCatchAll bool) error {
	// Check for null bytes
	if strings.Contains(paramValue, "\x00") {
		return &InvalidRouteParamError{
			ParamName: paramName,
			Message:   "contains null bytes",
		}
	}

	// Check for leading forward slash (absolute path)
	if strings.HasPrefix(paramValue, "/") {
		return &InvalidRouteParamError{
			ParamName: paramName,
			Message:   "cannot start with /",
		}
	}

	// Check for directory traversal: ".."
	if strings.Contains(paramValue, "..") {
		return &InvalidRouteParamError{
			ParamName: paramName,
			Message:   "contains .. (directory traversal)",
		}
	}

	// Check for backslash (Windows path separator)
	if strings.Contains(paramValue, "\\") {
		return &InvalidRouteParamError{
			ParamName: paramName,
			Message:   "contains backslash",
		}
	}

	// For catch-all parameters, allow more flexible paths with /
	// But still reject dangerous patterns (already checked above)
	if isCatchAll {
		return nil
	}

	// For regular route parameters, only allow safe characters
	// Allow: alphanumeric, underscore, hyphen, dot
	for _, ch := range paramValue {
		if !((ch >= 'a' && ch <= 'z') ||
			(ch >= 'A' && ch <= 'Z') ||
			(ch >= '0' && ch <= '9') ||
			ch == '_' || ch == '-' || ch == '.') {
			return &InvalidRouteParamError{
				ParamName: paramName,
				Message:   "contains invalid characters (only alphanumeric, underscore, hyphen, dot allowed)",
			}
		}
	}

	return nil
}
