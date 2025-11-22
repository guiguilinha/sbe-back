/**
 * Controller para criação de empresas
 */

import { Request, Response } from 'express';
import axios from 'axios';
import { CompaniesService } from '../services/company/companies.service';
import { getKeycloakValidationService } from '../services/keycloak-validation.service';
import { UsersService } from '../services/directus/persistence/users.service';

export class CompanyController {
  private companiesService = new CompaniesService();
  private usersService = new UsersService();

  /**
   * POST /api/company/create
   * Cria uma empresa (real ou fictícia)
   */
  async createCompany(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 [CompanyController] Iniciando criação de empresa...');
      console.log('🔍 [CompanyController] Body recebido:', JSON.stringify(req.body, null, 2));
      
      // 1. Extrair token do header Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('❌ [CompanyController] Token não fornecido ou formato inválido');
        res.status(401).json({
          success: false,
          error: 'Token de autorização não fornecido ou formato inválido'
        });
        return;
      }

      const idToken = authHeader.replace('Bearer ', '');
      console.log('✅ [CompanyController] Token extraído do header');

      // 2. Validar token e obter dados do usuário
      console.log('🔍 [CompanyController] Validando token Keycloak...');
      const keycloakValidationService = getKeycloakValidationService();
      const keycloakUserData = await keycloakValidationService.validateIdToken(idToken);
      const cpf = keycloakValidationService.extractCpfFromToken(keycloakUserData);
      console.log('✅ [CompanyController] Token validado, CPF extraído:', cpf);

      // 3. Buscar ou criar usuário no Directus
      console.log('🔍 [CompanyController] Buscando/criando usuário no Directus...');
      const directusToken = process.env.DIRECTUS_TOKEN;
      if (!directusToken) {
        console.error('❌ [CompanyController] DIRECTUS_TOKEN não configurado');
        throw new Error('Token do Directus não configurado');
      }
      
      const userDataForDirectus = {
        given_name: keycloakUserData.given_name || '',
        last_name: keycloakUserData.family_name || '',
        cpf: cpf,
        data_nascimento: keycloakUserData.dataNascimento || '',
        genero: keycloakUserData.genero || '',
        uf: keycloakUserData.uf || '',
        cidade: keycloakUserData.cidade || '',
        email: keycloakUserData.email || ''
      };

      const directusUser = await this.usersService.findOrUpdateUser(userDataForDirectus, directusToken);
      console.log('✅ [CompanyController] Usuário encontrado/criado no Directus:', directusUser.id);

      // 4. Verificar tipo de criação
      const { type, companyData } = req.body;

      if (type === 'real') {
        // Criar empresa real com dados fornecidos
        if (!companyData || !companyData.cnpj || !companyData.nome) {
          res.status(400).json({
            success: false,
            error: 'CNPJ e nome da empresa são obrigatórios'
          });
          return;
        }

        const createdCompany = await this.companiesService.createRealCompany(
          directusUser.id,
          {
            cnpj: companyData.cnpj,
            nome: companyData.nome
          },
          directusToken
        );

        // Buscar relacionamento user_companies criado
        const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
        const userCompaniesResponse = await axios.get(
          `${directusUrl}/items/user_companies`,
          {
            params: {
              filter: {
                user_id: { _eq: directusUser.id },
                company_id: { _eq: createdCompany.id }
              },
              fields: ['*', 'company_id.*']
            },
            headers: { Authorization: `Bearer ${directusToken}` }
          }
        );

        const userCompany = userCompaniesResponse.data.data?.[0];

        res.status(201).json({
          success: true,
          data: {
            // IMPORTANTE: Retornar o ID da empresa (companies.id), não o ID da relação (user_companies.id)
            id: createdCompany.id, // ID da empresa na tabela companies
            cnpj: createdCompany.cnpj,
            nome: createdCompany.nome,
            isPrincipal: userCompany?.is_principal || true,
            codStatusEmpresa: userCompany?.cod_status_empresa || 'REVISAR',
            desTipoVinculo: userCompany?.des_tipo_vinculo || 'NÃO VINCULADO'
          }
        });

      } else if (type === 'fictitious') {
        // Criar empresa fictícia
        console.log('🔍 [CompanyController] Criando empresa fictícia...');
        console.log('🔍 [CompanyController] Parâmetros:', JSON.stringify({
          userId: directusUser.id,
          cpf: cpf,
          userName: keycloakUserData.name || keycloakUserData.given_name || 'Usuário',
          hasDirectusToken: !!directusToken
        }, null, 2));
        
        const fictitiousCompany = await this.companiesService.createFictitiousCompany(
          directusUser.id,
          cpf,
          keycloakUserData.name || keycloakUserData.given_name || 'Usuário',
          directusToken
        );

        console.log('✅ [CompanyController] Empresa fictícia criada:', JSON.stringify({
          id: fictitiousCompany.id,
          cnpj: fictitiousCompany.cnpj,
          nome: fictitiousCompany.nome
        }, null, 2));

        // Buscar relacionamento user_companies criado
        const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
        const userCompaniesResponse = await axios.get(
          `${directusUrl}/items/user_companies`,
          {
            params: {
              filter: {
                user_id: { _eq: directusUser.id },
                company_id: { _eq: fictitiousCompany.id }
              },
              fields: ['*', 'company_id.*']
            },
            headers: { Authorization: `Bearer ${directusToken}` }
          }
        );

        const userCompany = userCompaniesResponse.data.data?.[0];
        console.log('✅ [CompanyController] Relacionamento user_companies encontrado:', JSON.stringify({
          id: userCompany?.id,
          user_id: userCompany?.user_id,
          company_id: userCompany?.company_id?.id || userCompany?.company_id
        }, null, 2));

        res.status(201).json({
          success: true,
          data: {
            // IMPORTANTE: Retornar o ID da empresa (companies.id), não o ID da relação (user_companies.id)
            id: fictitiousCompany.id, // ID da empresa na tabela companies
            cnpj: fictitiousCompany.cnpj,
            nome: fictitiousCompany.nome,
            isPrincipal: userCompany?.is_principal || true,
            codStatusEmpresa: userCompany?.cod_status_empresa || 'FICTICIO',
            desTipoVinculo: userCompany?.des_tipo_vinculo || 'NÃO VINCULADO'
          }
        });

      } else {
        res.status(400).json({
          success: false,
          error: 'Tipo de criação inválido. Use "real" ou "fictitious"'
        });
      }

    } catch (error) {
      console.error('❌ [CompanyController] Erro ao criar empresa:', error);
      console.error('❌ [CompanyController] Stack do erro:', error instanceof Error ? error.stack : 'Sem stack');
      console.error('❌ [CompanyController] Tipo do erro:', typeof error);
      console.error('❌ [CompanyController] Erro completo:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}

export const companyController = new CompanyController();

