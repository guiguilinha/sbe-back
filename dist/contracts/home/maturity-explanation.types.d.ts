export interface MaturityLevelSection {
    id: number;
    overline: string;
    title: string;
    description: string;
}
export interface MaturityExplanationCard {
    id: number;
    overline: string;
    title: string;
    description: string;
    image: string;
    image_alt: string;
    bg_image: string;
    order: number;
    parent: number;
}
export interface FullMaturityData {
    section: MaturityLevelSection;
    cards: MaturityExplanationCard[];
}
//# sourceMappingURL=maturity-explanation.types.d.ts.map