export interface CalculatedCategoryLevel {
  category_id: number;
  score: number;
  level: {
    id: number;
    title: string;
  };
}
