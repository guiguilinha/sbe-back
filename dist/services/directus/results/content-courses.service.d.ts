import { DirectusBaseService } from '../base/directus-base.service';
import { Course } from '../../../contracts/general/general.types';
export declare class ContentCoursesService extends DirectusBaseService<Course> {
    protected serviceName: string;
    getAllCourses(previewToken?: string): Promise<Course[]>;
}
//# sourceMappingURL=content-courses.service.d.ts.map