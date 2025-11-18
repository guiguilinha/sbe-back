export interface QuizAnswer {
  id: number;
  answer: string;
  score: number;
  order: number;
  question_id: number;
  parent?: number;
}
