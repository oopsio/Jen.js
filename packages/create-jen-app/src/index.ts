#!/usr/bin/env node

import { createJenApp } from "./create.js";

createJenApp().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exit(1);
});
