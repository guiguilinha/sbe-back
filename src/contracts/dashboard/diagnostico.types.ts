import type { ActionItem, ResourceLinkItem, StatusKind } from './dashboard.types';

export interface DiagnosticoDetail {
  id: string;
  date: string;
  overallScore: number;
  categories: Array<{
    id: string; 
    name: string; 
    score: number; 
    status: StatusKind;
    insight: string; 
    actions: ActionItem[]; 
    resources: ResourceLinkItem[];
  }>;
  notes?: string[];
}
