export interface BenefitsSection {
    overline: string;
    title: string;
    description: string;
    order: number;
}
export interface BenefitCard {
    id: number;
    title: string;
    description: string;
    image: string;
    image_alt: string;
    label_button: string;
    order: number;
    parent: number;
}
export interface FullBenefitsData {
    section: BenefitsSection;
    cards: BenefitCard[];
}
//# sourceMappingURL=benefits.types.d.ts.map