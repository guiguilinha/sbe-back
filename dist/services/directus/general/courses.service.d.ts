import { DirectusBaseService } from '../base/directus-base.service';
import { Course } from '../../../contracts/general/general.types';
export declare class CoursesService extends DirectusBaseService<Course> {
    protected serviceName: string;
    getCourses(previewToken?: string): Promise<Course[]>;
}
//# sourceMappingURL=courses.service.d.ts.map