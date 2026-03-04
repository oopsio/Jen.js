// commit.js
import { select, input, confirm } from '@inquirer/prompts';
import { execSync } from 'child_process';
import chalk from 'chalk';

// Rust-style error logging function
const logError = (msg) => console.error(`${chalk.red.bold('error')}[${chalk.red('commit')}]: ${msg}`);
const logSuccess = (msg) => console.log(`${chalk.green.bold('success')}: ${msg}`);

async function main() {
  try {
    // Check if files are staged
    const status = execSync('git diff --cached --name-only').toString();
    if (!status) {
      logError('No files staged for commit. Use "git add" first.');
      process.exit(1);
    }

    const type = await select({
      message: 'Select the commit type:',
      choices: [
        { name: 'feat:     A new feature', value: 'feat' },
        { name: 'fix:      A bug fix', value: 'fix' },
        { name: 'docs:     Documentation only changes', value: 'docs' },
        { name: 'style:    Changes that do not affect meaning', value: 'style' },
        { name: 'refactor: A code change that neither fixes nor adds feature', value: 'refactor' },
        { name: 'perf:     A code change that improves performance', value: 'perf' },
        { name: 'test:     Adding missing tests', value: 'test' },
        { name: 'chore:    Changes to build process or tools', value: 'chore' },
      ],
    });

    const scope = await input({ message: 'Enter scope (optional):' });
    const subject = await input({ message: 'Enter commit message:' });

    if (!subject) {
      logError('Commit message is required.');
      process.exit(1);
    }

    const finalMessage = `${type}${scope ? `(${scope})` : ''}: ${subject}`;
    
    console.log(`\n${chalk.cyan('Commit Message:')} ${chalk.yellow(finalMessage)}\n`);
    const confirmCommit = await confirm({ message: 'Confirm commit?' });

    if (confirmCommit) {
      execSync(`git commit -m "${finalMessage}"`, { stdio: 'inherit' });
      logSuccess('Commit created successfully!');
    } else {
      console.log(chalk.red('Commit aborted.'));
    }
  } catch (error) {
    logError(error.message);
  }
}

main();
