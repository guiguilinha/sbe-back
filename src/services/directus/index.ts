// services/directus/index.ts

// Re-exportações principais
export * from './directus.module';

// Serviços disponíveis

// Home services
export { HomepageService } from './homepage.service';
export { HeroService } from './home/hero.service';
export { BenefitsService } from './home/benefits.service';
export { HowItWorksService } from './home/how-it-works.service';
export { MaturityLevelsService } from './home/maturity-levels.service';
export { FaqService } from './home/faq.service';
export { FooterService } from './home/footer.service';

// CTA service
export { CTAService } from './general/cta.service';

// Quiz services
export { QuizService } from './quiz.service';
export { QuizHeaderService } from './quiz/header.service';
export { QuestionsService } from './quiz/questions.service';
export { AnswersService } from './quiz/answers.service';

// General services
export { CategoriesService } from './general/categories.service';
export { CoursesService } from './general/courses.service';
export { LevelsService } from './general/levels.service';
export { MGRegionService } from './general/mg-region.service';
export { ResultsService } from './results.service';

// Dashboard services
export { DashboardService } from './dashboard.service';
export { DiagnosticosService } from './diagnosticos.service';

// Serviços de persistência
export * from './persistence';

// Tipos
export * from './../../contracts/home/home.types';
export * from './../../contracts/quiz/quiz.types';
export * from '../../contracts/general/cta.types';
export * from '../../contracts/general/general.types';
export * from '../../contracts/general/mg-region.types';