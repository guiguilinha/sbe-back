import { DirectusBaseService } from '../base/directus-base.service';
import { User } from '../../../contracts/persistence/persistence.types';
import { validateUserData } from '../../../validators/user.schema';

export class UsersService extends DirectusBaseService<User> {
  protected serviceName = 'users';

  /**
   * Cria um novo usuário
   */
  async createUser(userData: {
    given_name: string;
    last_name: string;
    cpf: string;
    data_nascimento: string;
    genero: string;
    uf: string;
    cidade: string;
    email: string;
  }, token?: string): Promise<User> {
    console.log('[UsersService] Criando novo usuário:', { cpf: userData.cpf });
    
    // Filtrar campos vazios para evitar erros no Directus
    const cleanUserData: any = {};
    
    if (userData.given_name) cleanUserData.given_name = userData.given_name;
    if (userData.last_name) cleanUserData.last_name = userData.last_name;
    if (userData.cpf) cleanUserData.cpf = userData.cpf;
    if (userData.email) cleanUserData.email = userData.email;
    if (userData.genero) cleanUserData.genero = userData.genero;
    if (userData.uf) cleanUserData.uf = userData.uf;
    if (userData.cidade) cleanUserData.cidade = userData.cidade;
    
    // Só incluir data_nascimento se não for vazia
    if (userData.data_nascimento && userData.data_nascimento.trim() !== '') {
      cleanUserData.data_nascimento = userData.data_nascimento;
    }
    
    console.log('[UsersService] Dados limpos para criação:', cleanUserData);
    
    return this.create(cleanUserData, token);
  }

  /**
   * Busca usuário por CPF (identificador único)
   */
  async getUserByCpf(cpf: string, token?: string): Promise<User | null> {
    console.log('[UsersService] Buscando usuário por CPF:', cpf);
    const users = await this.fetch({
      filter: { cpf: { _eq: cpf } },
      limit: 1,
      token
    });
    return users[0] || null;
  }

  /**
   * Atualiza dados do usuário
   */
  async updateUser(id: number, userData: Partial<User>, token?: string): Promise<User> {
    console.log('[UsersService] Atualizando usuário:', id);
    return this.update(id, userData, token);
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: number, token?: string): Promise<User> {
    console.log('[UsersService] Buscando usuário por ID:', id);
    return this.getById(id, token);
  }

  /**
   * Verifica se usuário existe, se não cria um novo
   */
  async findOrCreateUser(userData: {
    given_name: string;
    last_name: string;
    cpf: string;
    data_nascimento: string;
    genero: string;
    uf: string;
    cidade: string;
    email: string;
  }, token?: string): Promise<User> {
    console.log('[UsersService] Verificando existência do usuário...');
    
    // Validar dados antes de processar
    const validation = validateUserData(userData);
    if (!validation.success) {
      throw new Error(`Dados de usuário inválidos: ${validation.error}`);
    }
    
    const existingUser = await this.getUserByCpf(userData.cpf, token);
    
    if (existingUser) {
      console.log('[UsersService] Usuário já existe, retornando existente');
      return existingUser;
    }
    
    console.log('[UsersService] Usuário não existe, criando novo');
    return this.createUser(userData, token);
  }
}
