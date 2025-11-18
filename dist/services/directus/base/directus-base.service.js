"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectusBaseService = void 0;
const axios_1 = __importDefault(require("axios"));
class DirectusBaseService {
    constructor() {
        this.defaultTimeout = 30000;
    }
    get baseUrl() {
        return process.env.DIRECTUS_URL || '';
    }
    resolveToken(customToken) {
        return customToken || process.env.DIRECTUS_TOKEN;
    }
    async makeRequest(endpoint, options = {}, attempt = 1) {
        const url = `${this.baseUrl}/${endpoint}`;
        console.log('🔍 makeRequest Debug:', {
            baseUrl: this.baseUrl,
            endpoint,
            fullUrl: url,
            hasToken: !!this.resolveToken(),
            tokenLength: this.resolveToken()?.length || 0,
            envVars: {
                DIRECTUS_URL: process.env.DIRECTUS_URL,
                DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN ? '***' : 'não definido'
            },
            isUrlValid: url.startsWith('http'),
            urlLength: url.length
        });
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.resolveToken(options.token)}`,
            ...(options.headers || {})
        };
        const requestConfig = {
            url,
            method: options.method || 'GET',
            headers,
            params: options.params,
            data: options.data,
            timeout: options.timeout || this.defaultTimeout
        };
        try {
            console.info(`[Directus] Request: ${requestConfig.method} ${url}`);
            const response = await (0, axios_1.default)(requestConfig);
            return response.data;
        }
        catch (error) {
            const maxRetries = 3;
            if (attempt < maxRetries) {
                const delay = 500 * attempt;
                console.warn(`[Directus] Retry ${attempt} for ${url} in ${delay}ms`);
                await new Promise(res => setTimeout(res, delay));
                return this.makeRequest(endpoint, options, attempt + 1);
            }
            console.error(`[Directus] Request failed:`, error);
            throw error;
        }
    }
    async makeRequestWithPreview(endpoint, previewToken, options = {}, attempt = 1) {
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
        const requestConfig = {
            url,
            method: options.method || 'GET',
            headers,
            params: options.params,
            data: options.data,
            timeout: options.timeout || this.defaultTimeout
        };
        try {
            console.info(`[Directus Preview] Request: ${requestConfig.method} ${url}`);
            const response = await (0, axios_1.default)(requestConfig);
            return response.data;
        }
        catch (error) {
            const maxRetries = 3;
            if (attempt < maxRetries) {
                const delay = 500 * attempt;
                console.warn(`[Directus Preview] Retry ${attempt} for ${url} in ${delay}ms`);
                await new Promise(res => setTimeout(res, delay));
                return this.makeRequestWithPreview(endpoint, previewToken, options, attempt + 1);
            }
            console.error(`[Directus Preview] Request failed:`, error);
            throw error;
        }
    }
    async fetch(options = {}) {
        const { filter, limit, fields, ...rest } = options;
        const params = {
            ...(rest.params || {}),
            ...(filter ? { filter } : {}),
            ...(limit ? { limit } : {}),
            ...(fields ? { fields } : {})
        };
        const res = await this.makeRequest(`items/${this.serviceName}`, {
            ...rest,
            method: 'GET',
            params,
            token: options.token
        });
        return res.data;
    }
    async fetchWithPreview(previewToken, options = {}) {
        const { filter, limit, fields, ...rest } = options;
        const params = {
            ...(rest.params || {}),
            ...(filter ? { filter } : {}),
            ...(limit ? { limit } : {}),
            ...(fields ? { fields } : {})
        };
        const res = await this.makeRequestWithPreview(`items/${this.serviceName}`, previewToken, {
            ...rest,
            method: 'GET',
            params
        });
        return res.data;
    }
    async fetchSectionWithExtras(extrasConfig, options = {}) {
        const { token, filter, fields } = options;
        const params = {
            ...(filter ? { filter } : {}),
            ...(fields ? { fields: fields.join(',') } : { fields: '*' }),
        };
        const sectionPromise = this.makeRequest(`items/${this.serviceName}`, {
            params,
            token,
        });
        const extrasPromises = Object.entries(extrasConfig).map(async ([key, config]) => {
            const extraParams = {
                fields: '*',
                ...(config.sort ? { sort: config.sort } : {}),
            };
            const result = await this.makeRequest(config.endpoint, {
                params: extraParams,
                token,
            });
            return [key, result.data];
        });
        const [sectionResult, ...extras] = await Promise.all([sectionPromise, ...extrasPromises]);
        const extrasMap = Object.fromEntries(extras);
        return {
            section: sectionResult.data,
            ...extrasMap,
        };
    }
    async healthCheck() {
        try {
            await this.makeRequest('auth/me');
            return true;
        }
        catch (error) {
            console.error('[Directus] Health check failed:', error);
            return false;
        }
    }
    async create(data, token) {
        const response = await this.makeRequest(`items/${this.serviceName}`, {
            method: 'POST',
            data,
            token
        });
        return response.data;
    }
    async createMany(data, token) {
        const response = await this.makeRequest(`items/${this.serviceName}`, {
            method: 'POST',
            data,
            token
        });
        return response.data;
    }
    async update(id, data, token) {
        const response = await this.makeRequest(`items/${this.serviceName}/${id}`, {
            method: 'PATCH',
            data,
            token
        });
        return response.data;
    }
    async delete(id, token) {
        await this.makeRequest(`items/${this.serviceName}/${id}`, {
            method: 'DELETE',
            token
        });
    }
    async getById(id, token) {
        const response = await this.makeRequest(`items/${this.serviceName}/${id}`, {
            method: 'GET',
            token
        });
        return response.data;
    }
}
exports.DirectusBaseService = DirectusBaseService;
//# sourceMappingURL=directus-base.service.js.map