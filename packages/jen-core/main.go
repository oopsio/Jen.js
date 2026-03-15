//go:build js && wasm
// +build js,wasm

package main

import (
	"encoding/json"
	"fmt"
	"syscall/js"
)

// Global variables for exported functions
var (
	scanRoutesFunc js.Func
	matchRouteFunc js.Func
	parseCookiesFunc js.Func
)

func main() {
	// Create a channel to keep the Go runtime alive
	done := make(chan struct{})

	// Register scanRoutes function
	scanRoutesFunc = js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		if len(args) < 2 {
			return map[string]interface{}{"error": "scanRoutes requires configJSON and siteDir arguments"}
		}

		siteDir := args[1].String()

		routes, err := scanRoutes(siteDir)
		if err != nil {
			return map[string]interface{}{"error": err.Error()}
		}

		return map[string]interface{}{
			"routes": routes,
			"error":  nil,
		}
	})
	defer scanRoutesFunc.Release()

	// Register matchRoute function
	matchRouteFunc = js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		if len(args) < 2 {
			return map[string]interface{}{"error": "matchRoute requires routesJSON and pathname arguments"}
		}

		routesJSON := args[0].String()
		pathname := args[1].String()

		match, err := matchRoute(routesJSON, pathname)
		if err != nil {
			return map[string]interface{}{"error": err.Error()}
		}

		if match == nil {
			return map[string]interface{}{
				"match": nil,
				"error": nil,
			}
		}

		return map[string]interface{}{
			"match": match,
			"error": nil,
		}
	})
	defer matchRouteFunc.Release()

	// Register parseCookies function
	parseCookiesFunc = js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		if len(args) < 1 {
			return map[string]interface{}{"error": "parseCookies requires cookieHeader argument"}
		}

		cookieHeader := args[0].String()
		cookies, err := parseCookies(cookieHeader)
		if err != nil {
			return map[string]interface{}{"error": err.Error()}
		}

		return map[string]interface{}{
			"cookies": cookies,
			"error":   nil,
		}
	})
	defer parseCookiesFunc.Release()

	// Export functions to global jenGo object
	js.Global().Set("jenGo", js.ValueOf(map[string]interface{}{
		"scanRoutes":   scanRoutesFunc,
		"matchRoute":   matchRouteFunc,
		"parseCookies": parseCookiesFunc,
	}))

	// Keep the Go runtime alive
	<-done
}

// scanRoutes scans the filesystem and returns route entries
func scanRoutes(siteDir string) ([]RouteEntry, error) {
	walker := NewWalker(siteDir)
	return walker.Scan()
}

// matchRoute matches a pathname against a list of routes
func matchRoute(routesJSON string, pathname string) (*MatchResult, error) {
	var routes []RouteEntry
	if err := json.Unmarshal([]byte(routesJSON), &routes); err != nil {
		return nil, fmt.Errorf("invalid routes JSON: %w", err)
	}

	matcher := NewMatcher(routes)
	return matcher.Match(pathname)
}

// parseCookies parses an HTTP Cookie header into a map
func parseCookies(cookieHeader string) (map[string]string, error) {
	parser := NewCookieParser()
	return parser.Parse(cookieHeader)
}
