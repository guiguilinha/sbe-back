import type { CalculatedCategoryLevel } from "./calculated-category-level.types";
export interface CalculatedResult {
    total_score: number;
    general_level: {
        id: number;
        title: string;
    };
    categories: CalculatedCategoryLevel[];
}
//# sourceMappingURL=calculated-result.types.d.ts.map