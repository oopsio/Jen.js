package main

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
)

// CommandStrategy defines the interface for command execution strategies
type CommandStrategy interface {
	NodeArgs() []string
}

// DevCommand implements CommandStrategy for development server
type DevCommand struct{}

func (dc *DevCommand) NodeArgs() []string {
	return []string{"server.js", "dev"}
}

// StartCommand implements CommandStrategy for production server
type StartCommand struct{}

func (sc *StartCommand) NodeArgs() []string {
	return []string{"server.js"}
}

// BuildCommand implements CommandStrategy for static site build
type BuildCommand struct{}

func (bc *BuildCommand) NodeArgs() []string {
	return []string{"build.js"}
}

// AnalyzeCommand implements CommandStrategy for bundle analysis
type AnalyzeCommand struct{}

func (ac *AnalyzeCommand) NodeArgs() []string {
	return []string{"build.js", "analyze"}
}

// CommandFactory creates command instances from string identifiers
type CommandFactory struct{}

// CreateCommand creates a command strategy from a command name
// Supported commands: dev, start, build, analyze
func (cf *CommandFactory) CreateCommand(cmd string) (CommandStrategy, error) {
	switch cmd {
	case "dev":
		return &DevCommand{}, nil
	case "start":
		return &StartCommand{}, nil
	case "build":
		return &BuildCommand{}, nil
	case "analyze":
		return &AnalyzeCommand{}, nil
	default:
		return nil, fmt.Errorf("unknown command: %s", cmd)
	}
}

// AllCommands returns a slice of all available commands with descriptions
func (cf *CommandFactory) AllCommands() []struct {
	Name string
	Desc string
} {
	return []struct {
		Name string
		Desc string
	}{
		{"dev", "Run development server"},
		{"start", "Start production server"},
		{"build", "Build static site"},
		{"analyze", "Analyze bundle and generate report"},
	}
}

// CheckNodeAvailable verifies Node.js is available in PATH
func CheckNodeAvailable() (string, error) {
	cmd := exec.Command("node", "--version")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf(
			"Node.js is not available in your system PATH.\n\n"+
				"Please ensure Node.js is installed and available in your PATH.\n"+
				"Download from: https://nodejs.org/\n\n"+
				"On macOS: brew install node\n"+
				"On Ubuntu: sudo apt-get install nodejs\n"+
				"On Windows: Download from https://nodejs.org/ or use: choco install nodejs",
		)
	}
	return strings.TrimSpace(string(output)), nil
}

// RunNode executes a Node.js command with inherited stdout/stderr
func RunNode(cmd CommandStrategy) error {
	// Check Node.js availability first
	_, err := CheckNodeAvailable()
	if err != nil {
		return err
	}

	nodeCmd := exec.Command("node", cmd.NodeArgs()...)
	nodeCmd.Stdout = os.Stdout
	nodeCmd.Stderr = os.Stderr
	nodeCmd.Stdin = os.Stdin

	if err := nodeCmd.Run(); err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			return fmt.Errorf("node process exited with code: %v", exitErr.ExitCode())
		}
		return fmt.Errorf("failed to start Node.js process: %v", err)
	}

	return nil
}

// PrintHelp displays the help message with available commands
func PrintHelp(factory *CommandFactory) {
	fmt.Println("Jen launcher - Framework command executor\n")
	fmt.Println("Usage: jen-launcher <COMMAND>\n")
	fmt.Println("Commands:")

	for _, cmd := range factory.AllCommands() {
		fmt.Printf("  %-10s %s\n", cmd.Name, cmd.Desc)
	}

	fmt.Println("\nExamples:")
	fmt.Println("  jen-launcher dev      Start development server")
	fmt.Println("  jen-launcher build    Build static site")
	fmt.Println("  jen-launcher help     Show this help message")
}

// main is the entry point for the CLI
func main() {
	factory := &CommandFactory{}

	// Get the command (default to help if none provided)
	var cmdStr string
	if len(os.Args) > 1 {
		cmdStr = os.Args[1]
	} else {
		cmdStr = "help"
	}

	switch cmdStr {
	case "help", "-h", "--help":
		PrintHelp(factory)
	case "dev", "start", "build", "analyze":
		cmd, err := factory.CreateCommand(cmdStr)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}
		if err := RunNode(cmd); err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}
	default:
		fmt.Fprintf(os.Stderr, "Error: Unknown command '%s'\n", cmdStr)
		fmt.Fprintf(os.Stderr, "Run 'jen-launcher help' for usage information.\n\n")
		PrintHelp(factory)
		os.Exit(1)
	}
}
