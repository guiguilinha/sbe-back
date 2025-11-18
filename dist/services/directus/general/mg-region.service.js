"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MGRegionService = void 0;
const directus_base_service_1 = require("../base/directus-base.service");
class MGRegionService extends directus_base_service_1.DirectusBaseService {
    constructor() {
        super(...arguments);
        this.serviceName = 'mg_regions_phones';
    }
    async getMGRegions(previewToken) {
        try {
            console.log('🔍 MGRegionService - Buscando regiões com relacionamentos:', {
                hasPreviewToken: !!previewToken,
                previewTokenLength: previewToken?.length || 0
            });
            let phones;
            if (previewToken) {
                phones = await this.fetchWithPreview(previewToken, {
                    fields: ['*', 'region.id', 'region.title']
                });
            }
            else {
                phones = await this.fetch({
                    fields: ['*', 'region.id', 'region.title']
                });
            }
            console.log(`✅ MGRegionService - Encontrados ${phones.length} registros de telefone`);
            const citiesMap = new Map();
            phones.forEach(phone => {
                const key = `${phone.region.id}-${phone.city}`;
                if (!citiesMap.has(key)) {
                    citiesMap.set(key, {
                        region: { id: phone.region.id, title: phone.region.title },
                        phones: []
                    });
                }
                citiesMap.get(key).phones.push(phone.phone);
            });
            const result = Array.from(citiesMap.entries()).map(([key, data]) => ({
                region: data.region,
                city: key.split('-')[1],
                phones: data.phones
            }));
            console.log(`✅ MGRegionService - Processadas ${result.length} cidades`);
            return result;
        }
        catch (error) {
            console.error('❌ Error in MGRegionService.getMGRegions:', error);
            return [];
        }
    }
}
exports.MGRegionService = MGRegionService;
//# sourceMappingURL=mg-region.service.js.map