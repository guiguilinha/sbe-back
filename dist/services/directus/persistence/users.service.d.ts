import { DirectusBaseService } from '../base/directus-base.service';
import { User } from '../../../contracts/persistence/persistence.types';
export declare class UsersService extends DirectusBaseService<User> {
    protected serviceName: string;
    createUser(userData: {
        given_name: string;
        last_name: string;
        cpf: string;
        data_nascimento: string;
        genero: string;
        uf: string;
        cidade: string;
        email: string;
    }, token?: string): Promise<User>;
    getUserByCpf(cpf: string, token?: string): Promise<User | null>;
    updateUser(id: number, userData: Partial<User>, token?: string): Promise<User>;
    getUserById(id: number, token?: string): Promise<User>;
    findOrCreateUser(userData: {
        given_name: string;
        last_name: string;
        cpf: string;
        data_nascimento: string;
        genero: string;
        uf: string;
        cidade: string;
        email: string;
    }, token?: string): Promise<User>;
}
//# sourceMappingURL=users.service.d.ts.map