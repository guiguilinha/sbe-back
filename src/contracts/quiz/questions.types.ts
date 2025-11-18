export interface QuizQuestion {
  id: number;
  question: string;
  order: number;
  category_id: number;
  parent?: number;
}
