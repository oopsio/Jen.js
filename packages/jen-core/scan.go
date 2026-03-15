//go:build js && wasm
// +build js,wasm

package main

import (
	"fmt"
	"io/fs"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// Walker handles filesystem traversal and route discovery
type Walker struct {
	siteDir string
}

// NewWalker creates a new Walker instance
func NewWalker(siteDir string) *Walker {
	return &Walker{siteDir: siteDir}
}

// Scan walks the filesystem and returns discovered routes
func (w *Walker) Scan() ([]RouteEntry, error) {
	absPath, err := filepath.Abs(w.siteDir)
	if err != nil {
		return nil, fmt.Errorf("failed to resolve site directory: %w", err)
	}

	var routes []RouteEntry

	err = filepath.WalkDir(absPath, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}

		// Check file extension
		ext := filepath.Ext(path)
		if !isSupportedExtension(ext) {
			return nil
		}

		// Check if filename matches route pattern
		filename := d.Name()
		m := matchRoutePattern(filename)
		if m == nil {
			return nil
		}

		// Extract route name from parentheses
		routeName := (*m)[1]

		// Calculate relative path and directory
		relPath, err := filepath.Rel(absPath, path)
		if err != nil {
			return err
		}

		relDir := filepath.Dir(relPath)
		if relDir == "." {
			relDir = ""
		}

		// Normalize path separators to forward slashes
		relPath = normalizeSlashes(relPath)
		relDir = normalizeSlashes(relDir)

		// Build URL path
		urlPath := buildURLPath(routeName, relDir)

		// Build regex pattern
		pattern, paramNames := buildRoutePattern(urlPath)

		// Create route entry ID
		id := strings.ReplaceAll(relPath, "/", "_")
		id = strings.ReplaceAll(id, ".", "_")

		routes = append(routes, RouteEntry{
			ID:         id,
			FilePath:   path,
			URLPath:    urlPath,
			Pattern:    pattern,
			ParamNames: paramNames,
		})

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to walk directory: %w", err)
	}

	// Sort by specificity: static routes first, then dynamic/catch-all
	sortRoutesBySpecificity(routes)

	return routes, nil
}

// isSupportedExtension checks if a file extension is supported
func isSupportedExtension(ext string) bool {
	supported := map[string]bool{
		".tsx": true,
		".ts":  true,
		".jsx": true,
		".js":  true,
	}
	return supported[ext]
}

// matchRoutePattern checks if filename matches (name) pattern
func matchRoutePattern(filename string) *[]string {
	// Pattern: (something).ext
	pattern := regexp.MustCompile(`^\(([^)]+)\)\.[a-z]+$`)
	matches := pattern.FindStringSubmatch(filename)
	if matches == nil {
		return nil
	}
	return &matches
}

// normalizeSlashes converts backslashes to forward slashes
func normalizeSlashes(p string) string {
	return strings.ReplaceAll(p, "\\", "/")
}

// buildURLPath constructs the URL path from route name and directory
func buildURLPath(routeName string, relDir string) string {
	var urlPath string

	// Handle special route names
	if routeName == "home" {
		// (home) becomes root of its directory
		if relDir == "" {
			urlPath = "/"
		} else {
			urlPath = "/" + relDir
		}
	} else if strings.HasPrefix(routeName, "$") {
		// ($paramName) becomes /:paramName
		paramName := routeName[1:]
		if relDir == "" {
			urlPath = "/:" + paramName
		} else {
			urlPath = "/" + relDir + "/:" + paramName
		}
	} else if strings.HasPrefix(routeName, "...") {
		// (...restName) becomes /*restName
		restName := routeName[3:]
		if relDir == "" {
			urlPath = "/*" + restName
		} else {
			urlPath = "/" + relDir + "/*" + restName
		}
	} else {
		// Regular segment name becomes /name
		if relDir == "" {
			urlPath = "/" + routeName
		} else {
			urlPath = "/" + relDir + "/" + routeName
		}
	}

	// Normalize double slashes
	urlPath = strings.ReplaceAll(urlPath, "//", "/")

	return urlPath
}

// buildRoutePattern converts URL path to regex pattern and parameter names
func buildRoutePattern(urlPath string) (string, []string) {
	parts := strings.Split(strings.Trim(urlPath, "/"), "/")
	if len(parts) == 1 && parts[0] == "" {
		// Root path
		return "^/?$", []string{}
	}

	var paramNames []string
	var regexParts []string

	for _, p := range parts {
		if p == "" {
			continue
		}

		if strings.HasPrefix(p, ":") {
			// Dynamic parameter
			paramName := p[1:]
			paramNames = append(paramNames, paramName)
			regexParts = append(regexParts, "([^/]+)")
		} else if strings.HasPrefix(p, "*") {
			// Catch-all parameter
			paramName := p[1:]
			paramNames = append(paramNames, paramName)
			regexParts = append(regexParts, "(.*)")
		} else {
			// Static segment
			regexParts = append(regexParts, escapeRegex(p))
		}
	}

	pattern := "^/" + strings.Join(regexParts, "/") + "/?$"
	return pattern, paramNames
}

// escapeRegex escapes special regex characters
func escapeRegex(s string) string {
	specials := []string{".", "*", "+", "?", "^", "$", "{", "}", "(", ")", "[", "]", "\\", "|"}
	result := s
	for _, char := range specials {
		result = strings.ReplaceAll(result, char, "\\"+char)
	}
	return result
}

// sortRoutesBySpecificity sorts routes with static routes first
func sortRoutesBySpecificity(routes []RouteEntry) {
	sort.Slice(routes, func(i, j int) bool {
		aDyn := strings.Contains(routes[i].URLPath, ":") || strings.Contains(routes[i].URLPath, "*")
		bDyn := strings.Contains(routes[j].URLPath, ":") || strings.Contains(routes[j].URLPath, "*")

		// Static routes before dynamic
		if aDyn != bDyn {
			return !aDyn
		}

		// Same category: sort by URL path
		return routes[i].URLPath < routes[j].URLPath
	})
}
