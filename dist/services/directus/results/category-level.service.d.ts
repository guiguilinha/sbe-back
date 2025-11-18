import { DirectusBaseService } from '../base/directus-base.service';
export declare class CategoryLevelsRangeService extends DirectusBaseService {
    protected serviceName: string;
    getLevelForCategory(categoryId: number, score: number, previewToken?: string): Promise<{
        id: number;
        title: string;
    } | null>;
}
//# sourceMappingURL=category-level.service.d.ts.map