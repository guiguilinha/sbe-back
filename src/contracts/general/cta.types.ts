export interface CTASection {
  id: number;
  title: string;
  description?: string;
  label_button: string;
  url_button: string;
  page_order?: number;
  page?: string;
  overline?: string;
  image?: string;
  image_alt?: string;
  label_button_secondary?: string;
  url_button_secondary?: string;
}

export interface CTAItem {
  id: number;
  title: string;
  description?: string;
  label_button: string;
  url_button: string;
  page_order?: number;
  page?: string;
  overline?: string;
  image?: string;
  image_alt?: string;
  label_button_secondary?: string;
  url_button_secondary?: string;
}

export interface FullCTAData {
  section: CTASection;
  items: CTAItem[];
} 