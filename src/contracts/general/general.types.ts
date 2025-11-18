export interface Category {
  id: number;
  title: string;
}

export interface Levels {
  id: number;
  title: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  image: string;
  image_alt: string;
  url: string;
  levels: Array<{ level_id: { id: number; title: string } }>;
  categories: Array<{ category_id: { id: number; title: string } }>;
}
