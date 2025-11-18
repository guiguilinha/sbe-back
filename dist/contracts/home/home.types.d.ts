import type { FullBenefitsData } from './benefits.types';
import type { FullFaqData } from './faq.types';
import type { FullFooterData } from './footer.types';
import type { HeroData } from './hero.types';
import type { FullHowItWorksData } from './how-it-works.types';
import type { FullMaturityData } from './maturity-explanation.types';
export * from './hero.types';
export * from './benefits.types';
export * from './how-it-works.types';
export * from './maturity-explanation.types';
export * from './faq.types';
export * from './footer.types';
export interface HomepageData {
    hero: HeroData;
    benefits: FullBenefitsData;
    how_it_works: FullHowItWorksData;
    maturity_levels: FullMaturityData;
    faq: FullFaqData;
    footer: FullFooterData;
}
//# sourceMappingURL=home.types.d.ts.map