//go:build js && wasm
// +build js,wasm

package main

// RouteEntry represents a discovered route file with all metadata needed for routing and rendering.
type RouteEntry struct {
	ID         string   `json:"id"`
	FilePath   string   `json:"filePath"`
	URLPath    string   `json:"urlPath"`
	Pattern    string   `json:"pattern"`
	ParamNames []string `json:"paramNames"`
}

// MatchResult represents a successful route match operation.
type MatchResult struct {
	Route  *RouteEntry       `json:"route"`
	Params map[string]string `json:"params"`
}
