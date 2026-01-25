#!/usr/bin/env node
import { createCommand } from "./commands/create.js";
import { addCommand } from "./commands/add.js";
import { initCommand } from "./commands/init.js";

const args = process.argv.slice(2);
const cmd = args[0];

switch (cmd) {
  case "create":
    createCommand(args.slice(1));
    break;
  case "add":
    addCommand(args.slice(1));
    break;
  case "init":
    initCommand(args.slice(1));
    break;
  default:
    console.log("Usage: myfw <create|add|init> [options]");
}
