export type StatusKind = 'attention' | 'evolving' | 'ok';

// 1) Nível com code+label (sem hardcode de nomes)
export type OverallLevelCode = 'L1' | 'L2' | 'L3' | 'L4';
export interface OverallLevel {
  code: OverallLevelCode;   // estável (decidido por vocês)
  label: string;            // vem do DB/Directus
}

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
  delta?: { trend: 'up' | 'down' | 'flat'; value?: number; suffix?: string };
}

export interface ActionItem { id: string; text: string; done?: boolean; }
export interface ResourceLinkItem { id: string; label: string; href: string; external?: boolean; }

export interface CategorySnapshot {
  id: string;                // estável (ex.: "presenca")
  name: string;              // label vinda do DB
  status: StatusKind;
  statusLabel?: string;      // label vinda do DB (ex.: "Atenção")
  score: number;
  insight: string;
  actions: ActionItem[];
  resources: ResourceLinkItem[];
}

export interface DashboardResponse {
  user: { name: string };

  overallLevel: OverallLevel;   // ← code+label
  overallPoints: number;        // ← backend já calcula
  deltaOverall: number;         // ← backend já calcula

  overall: Stat[];
  categories: CategorySnapshot[];

  historySample: Array<{
    id: string;
    date: string;               // ISO
    overallScore: number;
    level?: OverallLevel;       // opcional agora; ótimo se vier
    delta?: number;             // idem
  }>;

  trailCta?: {
    videoUrl: string;
    title?: string;
    theme?: string;
    whyNow?: string;
  };

  evolution?: {
    levelLabels: string[];
    months: string[];
    insightLines: string[];
    general: {
      data: Array<{
        month: string;
        level: number;
        levelLabel: string;
        score: number;
        delta: number;
      }>;
      performance: {
        percentage: number;
        trend: 'up' | 'down' | 'flat';
        period: string;
      };
    };
    categories: {
      data: Array<{
        month: string;
        topCategories: Array<{
          id: string;
          name: string;
          level: number;
          levelLabel: string;
          score: number;
          delta: number;
          color: string;
        }>;
      }>;
      performance: Record<string, {
        percentage: number;
        trend: 'up' | 'down' | 'flat';
        period: string;
      }>;
    };
  };
}