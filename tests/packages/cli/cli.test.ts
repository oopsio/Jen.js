import { describe, it, expect } from "vitest";
import { CommandFactory } from "../../../packages/cli/command-factory";
import { NodeRunner } from "../../../packages/cli/node-runner";

describe("CLI Integration", () => {
  describe("command execution flow", () => {
    it("should parse 'dev' command and build Node args", () => {
      const factory = new CommandFactory();
      const runner = new NodeRunner();

      const cmd = factory.createCommand("dev");
      const nodeCmd = runner.buildCommand(cmd);

      expect(nodeCmd).toEqual(["node", "server.js", "dev"]);
    });

    it("should parse 'build' command and build Node args", () => {
      const factory = new CommandFactory();
      const runner = new NodeRunner();

      const cmd = factory.createCommand("build");
      const nodeCmd = runner.buildCommand(cmd);

      expect(nodeCmd).toEqual(["node", "build.js"]);
    });

    it("should parse 'start' command and build Node args", () => {
      const factory = new CommandFactory();
      const runner = new NodeRunner();

      const cmd = factory.createCommand("start");
      const nodeCmd = runner.buildCommand(cmd);

      expect(nodeCmd).toEqual(["node", "server.js"]);
    });

    it("should parse 'analyze' command and build Node args", () => {
      const factory = new CommandFactory();
      const runner = new NodeRunner();

      const cmd = factory.createCommand("analyze");
      const nodeCmd = runner.buildCommand(cmd);

      expect(nodeCmd).toEqual(["node", "build.js", "analyze"]);
    });
  });

  describe("error handling", () => {
    it("should throw error for unknown command", () => {
      const factory = new CommandFactory();
      expect(() => factory.createCommand("unknown")).toThrow(
        "Unknown command: unknown"
      );
    });

    it("should validate command args", () => {
      const runner = new NodeRunner();
      const validCmd = "server.js";
      const invalidCmd = "server.js; rm -rf /";

      expect(() => runner.validateCommand(validCmd)).not.toThrow();
      expect(() => runner.validateCommand(invalidCmd)).toThrow();
    });
  });

  describe("command availability", () => {
    it("should list all available commands", () => {
      const factory = new CommandFactory();
      const cmds = factory.allCommands();

      expect(cmds).toHaveLength(4);
      expect(cmds.map((c) => c.name)).toEqual(["dev", "start", "build", "analyze"]);
    });

    it("should include command descriptions", () => {
      const factory = new CommandFactory();
      const cmds = factory.allCommands();

      cmds.forEach((cmd) => {
        expect(cmd.desc).toBeTruthy();
        expect(cmd.desc.length).toBeGreaterThan(0);
      });
    });
  });
});
