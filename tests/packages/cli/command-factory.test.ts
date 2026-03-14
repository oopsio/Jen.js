import { describe, it, expect } from "vitest";
import {
  CommandFactory,
  DevCommand,
  StartCommand,
  BuildCommand,
  AnalyzeCommand,
} from "../../../packages/cli/command-factory";

describe("CommandFactory", () => {
  describe("createCommand", () => {
    it("should create DevCommand for 'dev'", () => {
      const factory = new CommandFactory();
      const cmd = factory.createCommand("dev");
      expect(cmd).toBeInstanceOf(DevCommand);
      expect(cmd.nodeArgs()).toEqual(["server.js", "dev"]);
    });

    it("should create StartCommand for 'start'", () => {
      const factory = new CommandFactory();
      const cmd = factory.createCommand("start");
      expect(cmd).toBeInstanceOf(StartCommand);
      expect(cmd.nodeArgs()).toEqual(["server.js"]);
    });

    it("should create BuildCommand for 'build'", () => {
      const factory = new CommandFactory();
      const cmd = factory.createCommand("build");
      expect(cmd).toBeInstanceOf(BuildCommand);
      expect(cmd.nodeArgs()).toEqual(["build.js"]);
    });

    it("should create AnalyzeCommand for 'analyze'", () => {
      const factory = new CommandFactory();
      const cmd = factory.createCommand("analyze");
      expect(cmd).toBeInstanceOf(AnalyzeCommand);
      expect(cmd.nodeArgs()).toEqual(["build.js", "analyze"]);
    });

    it("should throw error for unknown command", () => {
      const factory = new CommandFactory();
      expect(() => factory.createCommand("invalid")).toThrow(
        "Unknown command: invalid"
      );
    });
  });

  describe("allCommands", () => {
    it("should return all available commands", () => {
      const factory = new CommandFactory();
      const commands = factory.allCommands();

      expect(commands).toHaveLength(4);
      expect(commands[0]).toEqual({ name: "dev", desc: "Run development server" });
      expect(commands[1]).toEqual({ name: "start", desc: "Start production server" });
      expect(commands[2]).toEqual({ name: "build", desc: "Build static site" });
      expect(commands[3]).toEqual({
        name: "analyze",
        desc: "Analyze bundle and generate report",
      });
    });
  });
});

describe("Command implementations", () => {
  it("DevCommand should return correct node args", () => {
    const cmd = new DevCommand();
    expect(cmd.nodeArgs()).toEqual(["server.js", "dev"]);
  });

  it("StartCommand should return correct node args", () => {
    const cmd = new StartCommand();
    expect(cmd.nodeArgs()).toEqual(["server.js"]);
  });

  it("BuildCommand should return correct node args", () => {
    const cmd = new BuildCommand();
    expect(cmd.nodeArgs()).toEqual(["build.js"]);
  });

  it("AnalyzeCommand should return correct node args", () => {
    const cmd = new AnalyzeCommand();
    expect(cmd.nodeArgs()).toEqual(["build.js", "analyze"]);
  });
});
