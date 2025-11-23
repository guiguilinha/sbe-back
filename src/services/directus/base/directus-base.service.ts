import axios, { AxiosRequestConfig } from 'axios';
import { DirectusResponse, DirectusRequestOptions } from './directus.types';

export abstract class DirectusBaseService<T = any> {
  protected abstract serviceName: string;

  // private readonly baseUrl = process.env.DIRECTUS_PORTAINER_URL || '';
  // private readonly token = process.env.DIRECTUS_PORTAINER_TOKEN;
  private get baseUrl(): string {
    return process.env.DIRECTUS_URL || '';
  }

  private resolveToken(customToken?: string): string | undefined {
    return customToken || process.env.DIRECTUS_TOKEN;
  }  
  
  private readonly defaultTimeout = 30000;

  protected async makeRequest<R = T>(
    endpoint: string,
    options: DirectusRequestOptions & { token?: string } = {},
    attempt = 1
  ): Promise<DirectusResponse<R>> {
    const url = `${this.baseUrl}/${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.resolveToken(options.token)}`,
      ...(options.headers || {})
    };

    const requestConfig: AxiosRequestConfig = {
      url,
      method: options.method || 'GET',
      headers,
      params: options.params,
      data: options.data,
      timeout: options.timeout || this.defaultTimeout
    };

    try {
      console.info(`[Directus] Request: ${requestConfig.method} ${url}`);
      const response = await axios(requestConfig);
      return response.data as DirectusResponse<R>;
    } catch (error) {
      const maxRetries = 3;
      if (attempt < maxRetries) {
        const delay = 500 * attempt;
        console.warn(`[Directus] Retry ${attempt} for ${url} in ${delay}ms`);
        await new Promise(res => setTimeout(res, delay));
        return this.makeRequest<R>(endpoint, options, attempt + 1);
      }

      console.error(`[Directus] Request failed:`, error);
      throw error;
    }
  }

  /**
   * Método específico para requisições com preview token
   * Usado quando o Directus envia um preview token para visualizar conteúdo não publicado
   */
  protected async makeRequestWithPreview<R = T>(
    endpoint: string,
    previewToken: string,
    options: DirectusRequestOptions = {},
    attempt = 1
  ): Promise<DirectusResponse<R>> {
    const url = `${this.baseUrl}/${endpoint}`;

    console.log('🔍 makeRequestWithPreview Debug:', {
      baseUrl: this.baseUrl,
      endpoint,
      fullUrl: url,
      hasPreviewToken: !!previewToken,
      previewTokenLength: previewToken?.length || 0,
      isUrlValid: url.startsWith('http')
    });

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${previewToken}`,
      ...(options.headers || {})
    };

    const requestConfig: AxiosRequestConfig = {
      url,
      method: options.method || 'GET',
      headers,
      params: options.params,
      data: options.data,
      timeout: options.timeout || this.defaultTimeout
    };

    try {
      console.info(`[Directus Preview] Request: ${requestConfig.method} ${url}`);
      const response = await axios(requestConfig);
      return response.data as DirectusResponse<R>;
    } catch (error) {
      const maxRetries = 3;
      if (attempt < maxRetries) {
        const delay = 500 * attempt;
        console.warn(`[Directus Preview] Retry ${attempt} for ${url} in ${delay}ms`);
        await new Promise(res => setTimeout(res, delay));
        return this.makeRequestWithPreview<R>(endpoint, previewToken, options, attempt + 1);
      }

      console.error(`[Directus Preview] Request failed:`, error);
      throw error;
    }
  }

  protected async fetch(options: DirectusRequestOptions & {
    filter?: Record<string, any>;
    limit?: number;
    offset?: number;
    fields?: string[];
  } & { token?: string } = {}): Promise<T[]> {
    const { filter, limit, offset, fields, ...rest } = options;

    const params = {
      ...(rest.params || {}),
      ...(filter ? { filter } : {}),
      ...(limit ? { limit } : {}),
      ...(offset !== undefined ? { offset } : {}),
      ...(fields ? { fields } : {})
    };

    // Log detalhado para collection diagnostics
    if (this.serviceName === 'diagnostics' && filter) {
      console.log('[DirectusBaseService] 🔍 FETCH DIAGNÓSTICOS:');
      console.log('[DirectusBaseService] - Collection:', this.serviceName);
      console.log('[DirectusBaseService] - Endpoint completo:', `${this.baseUrl}/items/${this.serviceName}`);
      console.log('[DirectusBaseService] - Filtro:', JSON.stringify(filter, null, 2));
      console.log('[DirectusBaseService] - Parâmetros completos:', JSON.stringify(params, null, 2));
    }

    const res = await this.makeRequest<T[]>(`items/${this.serviceName}`, {
      ...rest,
      method: 'GET',
      params,
      token: options.token
    });

    // Log da resposta para diagnostics
    if (this.serviceName === 'diagnostics' && filter) {
      console.log('[DirectusBaseService] ✅ RESPOSTA FETCH DIAGNÓSTICOS:');
      console.log('[DirectusBaseService] - Total retornado:', Array.isArray(res.data) ? res.data.length : 0);
      if (Array.isArray(res.data) && res.data.length > 0) {
        console.log('[DirectusBaseService] - Primeiros diagnósticos:', res.data.slice(0, 5).map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          performed_at: d.performed_at,
          overall_score: d.overall_score
        })));
      }
    }

    return res.data;
  }

  protected async fetchWithPreview(previewToken: string, options: DirectusRequestOptions & {
    filter?: Record<string, any>;
    limit?: number;
    fields?: string[];
  } = {}): Promise<T[]> {
    const { filter, limit, fields, ...rest } = options;

    const params = {
      ...(rest.params || {}),
      ...(filter ? { filter } : {}),
      ...(limit ? { limit } : {}),
      ...(fields ? { fields } : {})
    };

    const res = await this.makeRequestWithPreview<T[]>(`items/${this.serviceName}`, previewToken, {
      ...rest,
      method: 'GET',
      params
    });

    return res.data;
  }

  public async fetchSectionWithExtras<S, E = any>(
    extrasConfig: Record<string, { endpoint: string; sort?: string }>,
    options: {
      token?: string;
      filter?: Record<string, any>;
      fields?: string[];
    } = {}
  ): Promise<{ section: S } & Record<string, E[]>> {
    const { token, filter, fields } = options;
  
    const params = {
      ...(filter ? { filter } : {}),
      ...(fields ? { fields: fields.join(',') } : { fields: '*' }),
    };
  
    const sectionPromise = this.makeRequest<S>(`items/${this.serviceName}`, {
      params,
      token,
    });
  
    const extrasPromises = Object.entries(extrasConfig).map(async ([key, config]) => {
      const extraParams = {
        fields: '*',
        ...(config.sort ? { sort: config.sort } : {}),
      };
  
      const result = await this.makeRequest<E[]>(config.endpoint, {
        params: extraParams,
        token,
      });
  
      return [key, result.data] as const;
    });
  
    const [sectionResult, ...extras] = await Promise.all([sectionPromise, ...extrasPromises]);
    const extrasMap = Object.fromEntries(extras) as Record<string, E[]>;
  
    return {
      section: sectionResult.data,
      ...extrasMap,
    } as { section: S } & Record<string, E[]>;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest('auth/me');
      return true;
    } catch (error) {
      console.error('[Directus] Health check failed:', error);
      return false;
    }
  }

  /**
   * Cria um novo item na collection
   */
  protected async create(data: Partial<T>, token?: string): Promise<T> {
    const response = await this.makeRequest<T>(`items/${this.serviceName}`, {
      method: 'POST',
      data,
      token
    });
    return response.data;
  }

  /**
   * Cria múltiplos itens de uma vez (batch)
   */
  protected async createMany(data: Partial<T>[], token?: string): Promise<T[]> {
    const response = await this.makeRequest<T[]>(`items/${this.serviceName}`, {
      method: 'POST',
      data,
      token
    });
    return response.data;
  }

  /**
   * Atualiza um item existente por ID
   */
  protected async update(id: string | number, data: Partial<T>, token?: string): Promise<T> {
    const response = await this.makeRequest<T>(`items/${this.serviceName}/${id}`, {
      method: 'PATCH',
      data,
      token
    });
    return response.data;
  }

  /**
   * Deleta um item por ID
   */
  protected async delete(id: string | number, token?: string): Promise<void> {
    await this.makeRequest(`items/${this.serviceName}/${id}`, {
      method: 'DELETE',
      token
    });
  }

  /**
   * Busca um item específico por ID
   */
  protected async getById(id: string | number, token?: string): Promise<T> {
    const response = await this.makeRequest<T>(`items/${this.serviceName}/${id}`, {
      method: 'GET',
      token
    });
    return response.data;
  }
}
