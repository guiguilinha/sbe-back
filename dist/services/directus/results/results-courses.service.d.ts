import { DirectusBaseService } from '../base/directus-base.service';
import { Course } from '../../../contracts/general/general.types';
export declare class ResultsCoursesService extends DirectusBaseService<Course> {
    protected serviceName: string;
    getCategoryCourses(categoryId: number, levelId: number, previewToken?: string): Promise<Course[]>;
}
//# sourceMappingURL=results-courses.service.d.ts.map