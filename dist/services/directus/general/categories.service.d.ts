import { DirectusBaseService } from '../base/directus-base.service';
import { Category } from '../../../contracts/general/general.types';
export declare class CategoriesService extends DirectusBaseService<Category> {
    protected serviceName: string;
    protected endpoint: string;
    getCategories(previewToken?: string): Promise<Category[]>;
}
//# sourceMappingURL=categories.service.d.ts.map