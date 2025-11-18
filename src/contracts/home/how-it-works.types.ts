export interface HowItWorksSection {
  id: number;
  overline: string;
  title: string;
  description: string;
}

export interface HowItWorksCard {
  id: number;
  overline: string;
  title: string;
  description: string;
  order: number;
  parent: number;
}

export interface FullHowItWorksData {
  section: HowItWorksSection;
  cards: HowItWorksCard[];
}
