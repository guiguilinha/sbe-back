export interface MaturityLevelsRange {
    id: number;
    min_score: number;
    max_score: number;
    level_id: number;
}
export interface MaturityLevelsRangeWithLevel {
    id: number;
    min_score: number;
    max_score: number;
    level_id: {
        id: number;
        title: string;
    };
}
//# sourceMappingURL=maturity-level-range.types.d.ts.map