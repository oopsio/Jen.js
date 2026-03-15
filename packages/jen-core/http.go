//go:build js && wasm
// +build js,wasm

package main

import (
	"net/url"
	"strings"
)

// CookieParser handles HTTP Cookie header parsing
type CookieParser struct{}

// NewCookieParser creates a new CookieParser instance
func NewCookieParser() *CookieParser {
	return &CookieParser{}
}

// Parse parses an HTTP Cookie header into a map of name-value pairs
// Cookie format (RFC 6265):
// - Multiple cookies separated by semicolons
// - Each cookie is name=value with optional whitespace
// - Cookie values are URL-encoded and must be decoded
func (cp *CookieParser) Parse(cookieHeader string) (map[string]string, error) {
	cookies := make(map[string]string)

	if cookieHeader == "" {
		return cookies, nil
	}

	// Split by semicolon
	parts := strings.Split(cookieHeader, ";")

	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}

		// Split on first equals sign only
		eqIdx := strings.Index(part, "=")
		if eqIdx == -1 {
			continue
		}

		name := strings.TrimSpace(part[:eqIdx])
		value := strings.TrimSpace(part[eqIdx+1:])

		// Filter out empty names or values
		if name == "" || value == "" {
			continue
		}

		// URL-decode the value to handle special characters
		decodedValue, err := url.QueryUnescape(value)
		if err != nil {
			// If decoding fails, use the original value
			decodedValue = value
		}

		cookies[name] = decodedValue
	}

	return cookies, nil
}
