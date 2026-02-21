package main

import (
	"fmt"
	"os"
	"os/exec"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "No argument provided")
		printUsage()
		os.Exit(1)
	}

	arg := os.Args[1]

	switch arg {
	case "dev":
		runNode([]string{"server.js", "dev"})
	case "start":
		runNode([]string{"server.js"})
	case "build":
		runNode([]string{"build.js"})
	default:
		fmt.Fprintf(os.Stderr, "Unknown argument: %s\n", arg)
		printUsage()
		os.Exit(1)
	}
}

func runNode(args []string) {
	cmd := exec.Command("node", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err := cmd.Run()
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			fmt.Fprintf(os.Stderr, "Node process exited with code: %d\n", exitErr.ExitCode())
			os.Exit(exitErr.ExitCode())
		} else {
			fmt.Fprintf(os.Stderr, "Failed to start Node.js process: %v\n", err)
			os.Exit(1)
		}
	}
}

func printUsage() {
	fmt.Println("Usage:")
	fmt.Println("  jen dev     -> runs `node server.js dev`")
	fmt.Println("  jen start   -> runs `node server.js`")
	fmt.Println("  jen build   -> runs `node build.js`")
}