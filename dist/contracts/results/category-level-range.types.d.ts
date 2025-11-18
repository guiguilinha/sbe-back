export interface CategoryLevelsRange {
    id: number;
    category_id: number;
    min_score: number;
    max_score: number;
    level_id: number;
}
export interface CategoryLevelsRangeWithLevel {
    id: number;
    category_id: number;
    min_score: number;
    max_score: number;
    level_id: {
        id: number;
        title: string;
    };
}
//# sourceMappingURL=category-level-range.types.d.ts.map