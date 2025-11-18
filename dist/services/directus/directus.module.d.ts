import { HomepageService } from './homepage.service';
import { QuizService } from './quiz.service';
import { ResultsService } from './results.service';
export { DirectusBaseService } from './base/directus-base.service';
export * from './base/directus.types';
export { HomepageService } from './homepage.service';
export { QuizService } from './quiz.service';
export { ResultsService } from './results.service';
export declare const DirectusModuleConfig: {
    cache: {
        enabled: boolean;
        ttl: number;
        maxSize: number;
    };
    retry: {
        enabled: boolean;
        maxRetries: number;
        delay: number;
        backoffMultiplier: number;
    };
    logging: {
        level: string;
        includeTimestamp: boolean;
        includeServiceName: boolean;
    };
    timeout: number;
};
export declare class DirectusServiceFactory {
    static createHomepageService(): HomepageService;
    static createQuizService(): QuizService;
    static createResultsService(): ResultsService;
    static createAllServices(): {
        homepage: HomepageService;
        quiz: QuizService;
        results: ResultsService;
    };
}
//# sourceMappingURL=directus.module.d.ts.map