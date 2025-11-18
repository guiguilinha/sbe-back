"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageService = void 0;
const hero_service_1 = require("./home/hero.service");
const benefits_service_1 = require("./home/benefits.service");
const how_it_works_service_1 = require("./home/how-it-works.service");
const maturity_levels_service_1 = require("./home/maturity-levels.service");
const faq_service_1 = require("./home/faq.service");
const footer_service_1 = require("./home/footer.service");
class HomepageService {
    constructor() {
        this.heroService = new hero_service_1.HeroService();
        this.benefitsService = new benefits_service_1.BenefitsService();
        this.howItWorksService = new how_it_works_service_1.HowItWorksService();
        this.maturityService = new maturity_levels_service_1.MaturityLevelsService();
        this.faqService = new faq_service_1.FaqService();
        this.footerService = new footer_service_1.FooterService();
    }
    async getHomepageData(previewToken) {
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
        }
        catch (error) {
            console.error('[HomepageService] Erro ao carregar dados:', error);
            throw error;
        }
    }
}
exports.HomepageService = HomepageService;
//# sourceMappingURL=homepage.service.js.map