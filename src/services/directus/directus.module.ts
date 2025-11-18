// directus.module.ts
// Importações necessárias para o TypeScript
import { HomepageService } from './homepage.service';
import { QuizService } from './quiz.service';
import { ResultsService } from './results.service';

// Importações dos serviços base
export { DirectusBaseService } from './base/directus-base.service';
export * from './base/directus.types';

// Importações dos serviços ativos
export { HomepageService } from './homepage.service';
export { QuizService } from './quiz.service';
export { ResultsService } from './results.service';

/**
 * Configuração centralizada do módulo Directus
 */
export const DirectusModuleConfig = {
  cache: {
    enabled: true,
    ttl: 300,
    maxSize: 100,
  },
  retry: {
    enabled: true,
    maxRetries: 3,
    delay: 1000,
    backoffMultiplier: 2,
  },
  logging: {
    level: 'info',
    includeTimestamp: true,
    includeServiceName: true,
  },
  timeout: 30000,
};

/**
 * Factory para criar instâncias dos serviços com configuração padrão
 */
export class DirectusServiceFactory {
  static createHomepageService(): HomepageService {
    return new HomepageService();
  }
  static createQuizService(): QuizService {
    return new QuizService();
  }
  static createResultsService(): ResultsService {
    return new ResultsService();
  }
  static createAllServices() {
    return {
      homepage: this.createHomepageService(),
      quiz: this.createQuizService(),
      results: this.createResultsService(),
    };
  }
}

