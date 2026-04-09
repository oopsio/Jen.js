import fs from 'fs/promises';
import path from 'path';

// Reads the .gitignore file and creates a list of rules
async function getIgnoreRules() {
  try {
    const gitignore = await fs.readFile('.gitignore', 'utf8');
    return (
      gitignore
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
        // Strip trailing slashes to match directory names easily
        .map((line) => line.replace(/\/$/, ''))
    );
  } catch {
    return []; // If there is no .gitignore, just return an empty array
  }
}

// Checks if a file path should be ignored
function isIgnored(filePath, ignoreRules) {
  // Hardcode ignoring node_modules and .git to be absolutely safe
  if (filePath.includes('node_modules') || filePath.includes('.git')) {
    return true;
  }

  // Check against the rules from .gitignore
  return ignoreRules.some((rule) => filePath.includes(rule));
}

// Recursively goes through directories looking for JSON files
async function processDirectory(directory, ignoreRules) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (isIgnored(fullPath, ignoreRules)) {
      continue;
    }

    if (entry.isDirectory()) {
      await processDirectory(fullPath, ignoreRules);
    } else if (entry.isFile() && fullPath.endsWith('.json')) {
      await formatJsonFile(fullPath);
    }
  }
}

// Lints and formats a single JSON file
async function formatJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');

    // JSON.parse acts as our linter. If the JSON is broken, it throws an error.
    const parsed = JSON.parse(content);

    // Format the valid JSON with 2 spaces
    const formatted = JSON.stringify(parsed, null, 2);

    // Write the clean JSON back to the file
    await fs.writeFile(filePath, formatted, 'utf8');
    console.log(`Success: Formatted ${filePath}`);
  } catch (error) {
    // Catch and display exactly where the JSON is broken
    console.error(`Linting Error in ${filePath}: ${error.message}`);
  }
}

// Main execution function
async function run() {
  console.log('Starting JSON Linter & Formatter...');
  const ignoreRules = await getIgnoreRules();
  await processDirectory('.', ignoreRules);
  console.log('Finished checking all JSON files.');
}

run();
