import type { DiagnosticoDetail } from '../../contracts/dashboard/diagnostico.types';
export declare class DiagnosticosService {
    list(): Promise<Array<{
        id: string;
        date: string;
        overallScore: number;
    }>>;
    getById(id: string): Promise<DiagnosticoDetail | null>;
}
//# sourceMappingURL=diagnosticos.service.d.ts.map