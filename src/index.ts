import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { parseArguments, getProjectNameFromArgs } from './cli';
import { runPrompts } from './prompts';
import { scaffoldProject } from './template';
import { installDependencies, initializeGit } from './utils';
import { PromptAnswers } from './types';

async function main() {
  console.log(chalk.bold.blue('\n🚀 Create Next Pro\n'));

  try {
    const cliOptions = parseArguments();
    const projectNameArg = getProjectNameFromArgs();

    if (projectNameArg) {
      const validation = validateProjectName(projectNameArg);
      if (!validation.valid) {
        console.error(chalk.red(`Error: ${validation.error}`));
        process.exit(1);
      }
    }

    const answers: PromptAnswers = await runPrompts(cliOptions, projectNameArg);

    const spinner = ora('Creating project...').start();

    const templatesDir = path.join(__dirname, '..', 'templates');
    scaffoldProject(answers, templatesDir);

    spinner.succeed('Project created');

    if (!cliOptions.skipInstall) {
      const installSpinner = ora('Installing dependencies...').start();
      installDependencies(answers.projectName, answers.pm);
      installSpinner.succeed('Dependencies installed');
    }

    if (answers.initializeGit) {
      const gitSpinner = ora('Initializing git...').start();
      initializeGit(answers.projectName);
      gitSpinner.succeed('Git initialized');
    }

    console.log(chalk.green('\n✅ Project created successfully!\n'));
    console.log(chalk.white('Next steps:'));
    console.log(chalk.cyan(`  cd ${answers.projectName}`));
    console.log(chalk.cyan('  npm run dev'));
    
    if (answers.withMock) {
      console.log(chalk.gray('\n  Mock API will start automatically on port 3001'));
    }
    
    console.log();

  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function validateProjectName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Project name cannot be empty' };
  }
  
  if (!/^[a-z0-9-_]+$/i.test(name)) {
    return { valid: false, error: 'Project name can only contain letters, numbers, hyphens, and underscores' };
  }
  
  return { valid: true };
}

main();
