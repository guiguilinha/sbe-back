export interface FaqSection {
  id: number;
  overline: string;
  title: string;
  description: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  order: number;
  parent: number;
}

export interface FullFaqData {
  section: FaqSection;
  items: FaqItem[];
}
