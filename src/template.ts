import * as path from 'path';
import { copyTemplate } from './utils';
import { PromptAnswers, TemplateConfig } from './types';

const templateConfigs: Record<string, TemplateConfig> = {
  basic: {
    name: 'basic',
    description: 'Minimal Next.js setup',
    dependencies: ['next', 'react', 'react-dom'],
    devDependencies: ['typescript', '@types/node', '@types/react', '@types/react-dom', 'tailwindcss', 'postcss', 'autoprefixer', 'eslint', 'eslint-config-next'],
  },
  'with-mock': {
    name: 'with-mock',
    description: 'Next.js with mock API',
    dependencies: ['next', 'react', 'react-dom', 'chokidar', 'express', 'cors'],
    devDependencies: ['typescript', '@types/node', '@types/react', '@types/react-dom', '@types/express', '@types/cors', 'tailwindcss', 'postcss', 'autoprefixer', 'eslint', 'eslint-config-next'],
  },
};

export function getTemplateConfig(templateName: string): TemplateConfig | undefined {
  return templateConfigs[templateName];
}

export function scaffoldProject(answers: PromptAnswers, templatesDir: string): void {
  const templateDir = path.join(templatesDir, answers.template);
  const projectDir = path.join(process.cwd(), answers.projectName);
  
  copyTemplate(templateDir, projectDir, {
    projectName: answers.projectName,
  });
  
  if (answers.withMock && answers.template !== 'with-mock') {
    const mockTemplateDir = path.join(templatesDir, 'with-mock');
    copyTemplate(mockTemplateDir, projectDir, {
      projectName: answers.projectName,
    });
  }
}

export { templateConfigs };
