// homepage.service.ts
import {
  HomepageData,
  HeroData,
  FullBenefitsData,
  FullHowItWorksData,
  FullMaturityData,
  FullFaqData,
  FullFooterData
} from '../../contracts';

import { HeroService } from './home/hero.service';
import { BenefitsService } from './home/benefits.service';
import { HowItWorksService } from './home/how-it-works.service';
import { MaturityLevelsService } from './home/maturity-levels.service';
import { FaqService } from './home/faq.service';
import { FooterService } from './home/footer.service';

export class HomepageService {
  private heroService = new HeroService();
  private benefitsService = new BenefitsService();
  private howItWorksService = new HowItWorksService();
  private maturityService = new MaturityLevelsService();
  private faqService = new FaqService();
  private footerService = new FooterService();

  async getHomepageData(previewToken?: string): Promise<HomepageData> {
    console.log('[HomepageService] getHomepageData:', {
      hasPreviewToken: !!previewToken,
      previewTokenLength: previewToken?.length || 0,
      previewToken: previewToken
    });

    try {
      console.log('[HomepageService] Iniciando busca de dados com previewToken:', previewToken);
      
      const hero = await this.heroService.getHero(previewToken);
      console.log('[HomepageService] Hero carregado com sucesso');
      
      const benefits = await this.benefitsService.getFullBenefits(previewToken);
      console.log('[HomepageService] Benefits carregado com sucesso');
      
      const how_it_works = await this.howItWorksService.getFullHowItWorks(previewToken);
      console.log('[HomepageService] How it works carregado com sucesso');
      
      const maturity_levels = await this.maturityService.getFullMaturityLevels(previewToken);
      console.log('[HomepageService] Maturity levels carregado com sucesso');
      
      const faq = await this.faqService.getFullFaq(previewToken);
      console.log('[HomepageService] FAQ carregado com sucesso');
      
      const footer = await this.footerService.getFullFooter(previewToken);
      console.log('[HomepageService] Footer carregado com sucesso');

      console.log('[HomepageService] Todos os dados carregados com sucesso');
      
      return {
        hero,
        benefits,
        how_it_works,
        maturity_levels,
        faq,
        footer,
      };
    } catch (error) {
      console.error('[HomepageService] Erro ao carregar dados:', error);
      throw error;
    }
  }
}