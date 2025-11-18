"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class UsersService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'users';
    }
    async createUser(userData, token) {
        console.log('[UsersService] Criando novo usuário:', { cpf: userData.cpf });
        const cleanUserData = {};
        if (userData.given_name)
            cleanUserData.given_name = userData.given_name;
        if (userData.last_name)
            cleanUserData.last_name = userData.last_name;
        if (userData.cpf)
            cleanUserData.cpf = userData.cpf;
        if (userData.email)
            cleanUserData.email = userData.email;
        if (userData.genero)
            cleanUserData.genero = userData.genero;
        if (userData.uf)
            cleanUserData.uf = userData.uf;
        if (userData.cidade)
            cleanUserData.cidade = userData.cidade;
        if (userData.data_nascimento && userData.data_nascimento.trim() !== '') {
            cleanUserData.data_nascimento = userData.data_nascimento;
        }
        console.log('[UsersService] Dados limpos para criação:', cleanUserData);
        return this.create(cleanUserData, token);
    }
    async getUserByCpf(cpf, token) {
        console.log('[UsersService] Buscando usuário por CPF:', cpf);
        const users = await this.fetch({
            filter: { cpf: { _eq: cpf } },
            limit: 1,
            token
        });
        return users[0] || null;
    }
    async updateUser(id, userData, token) {
        console.log('[UsersService] Atualizando usuário:', id);
        return this.update(id, userData, token);
    }
    async getUserById(id, token) {
        console.log('[UsersService] Buscando usuário por ID:', id);
        return this.getById(id, token);
    }
    async findOrCreateUser(userData, token) {
        console.log('[UsersService] Verificando existência do usuário...');
        const existingUser = await this.getUserByCpf(userData.cpf, token);
        if (existingUser) {
            console.log('[UsersService] Usuário já existe, retornando existente');
            return existingUser;
        }
        console.log('[UsersService] Usuário não existe, criando novo');
        return this.createUser(userData, token);
    }
}
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map