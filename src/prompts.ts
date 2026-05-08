import inquirer from 'inquirer';
import { CLIOptions, PromptAnswers } from './types';
import { validateProjectName } from './utils';

const templates = [
  { name: 'basic', value: 'basic', description: 'Minimal Next.js setup with TypeScript and Tailwind' },
  { name: 'with-mock', value: 'with-mock', description: 'Next.js with built-in mock API server' },
];

const packageManagers = [
  { name: 'npm', value: 'npm' },
  { name: 'yarn', value: 'yarn' },
  { name: 'pnpm', value: 'pnpm' },
];

export async function runPrompts(cliOptions: CLIOptions, projectNameArg?: string): Promise<PromptAnswers> {
  const questions: any[] = [];

  if (!projectNameArg) {
    questions.push({
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      validate: (input: string) => {
        const result = validateProjectName(input);
        return result.valid || result.error || 'Invalid project name';
      },
    });
  }

  if (!cliOptions.template) {
    questions.push({
      type: 'list',
      name: 'template',
      message: 'Select template:',
      choices: templates.map(t => ({ name: `${t.name} - ${t.description}`, value: t.value })),
      default: 'basic',
    });
  }

  if (cliOptions.withMock === undefined) {
    questions.push({
      type: 'confirm',
      name: 'withMock',
      message: 'Include mock API server?',
      default: false,
    });
  }

  if (!cliOptions.pm) {
    questions.push({
      type: 'list',
      name: 'pm',
      message: 'Select package manager:',
      choices: packageManagers,
      default: 'npm',
    });
  }

  questions.push({
    type: 'confirm',
    name: 'initializeGit',
    message: 'Initialize git repository?',
    default: true,
  });

  const answers = await inquirer.prompt(questions);

  return {
    projectName: projectNameArg || answers.projectName,
    template: cliOptions.template || answers.template || 'basic',
    withMock: cliOptions.withMock ?? answers.withMock ?? false,
    pm: cliOptions.pm || answers.pm || 'npm',
    initializeGit: answers.initializeGit,
  };
}
