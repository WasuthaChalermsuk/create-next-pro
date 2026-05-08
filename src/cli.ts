import { Command } from 'commander';
import { CLIOptions } from './types';

const program = new Command();

export function parseArguments(): CLIOptions {
  program
    .name('create-next-pro')
    .description('CLI to scaffold Next.js projects with built-in mock API')
    .version('1.0.0')
    .argument('[project-name]', 'Name of the project to create')
    .option('-t, --template <name>', 'Template to use (basic, full-stack, with-mock)')
    .option('--with-mock', 'Include mock API server')
    .option('--pm <manager>', 'Package manager (npm, yarn, pnpm)', 'npm')
    .option('--typescript', 'Use TypeScript', true)
    .option('--tailwind', 'Include Tailwind CSS', true)
    .option('--eslint', 'Include ESLint', true)
    .option('--skip-install', 'Skip dependency installation')
    .option('--force', 'Overwrite existing directory')
    .parse();

  const options = program.opts();
  const [projectName] = program.args;

  return {
    template: options.template,
    withMock: options.withMock,
    pm: options.pm,
    typescript: options.typescript,
    tailwind: options.tailwind,
    eslint: options.eslint,
    skipInstall: options.skipInstall,
    force: options.force,
  };
}

export function getProjectNameFromArgs(): string | undefined {
  return program.args[0];
}

export { program };
