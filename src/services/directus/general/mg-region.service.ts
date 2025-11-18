import { DirectusBaseService } from '../base/directus-base.service';
import { MGRegionPhone, MGRegion } from '../../../contracts/general/mg-region.types';

export class MGRegionService extends DirectusBaseService<MGRegionPhone> {
  protected serviceName = 'mg_regions_phones';

  async getMGRegions(previewToken?: string): Promise<MGRegion[]> {
    try {
      console.log('🔍 MGRegionService - Buscando regiões com relacionamentos:', {
        hasPreviewToken: !!previewToken,
        previewTokenLength: previewToken?.length || 0
      });
      
      // Buscar dados com relacionamento da região
      let phones;
      if (previewToken) {
        phones = await this.fetchWithPreview(previewToken, {
          fields: ['*', 'region.id', 'region.title']
        });
      } else {
        phones = await this.fetch({
          fields: ['*', 'region.id', 'region.title']
        });
      }
      
      console.log(`✅ MGRegionService - Encontrados ${phones.length} registros de telefone`);
      
      // Agrupar por cidade
      const citiesMap = new Map<string, { region: { id: number; title: string }; phones: string[] }>();
      
      phones.forEach(phone => {
        const key = `${phone.region.id}-${phone.city}`;
        if (!citiesMap.has(key)) {
          citiesMap.set(key, { 
            region: { id: phone.region.id, title: phone.region.title }, 
            phones: [] 
          });
        }
        citiesMap.get(key)!.phones.push(phone.phone);
      });
      
      // Converter para array de MGRegion
      const result = Array.from(citiesMap.entries()).map(([key, data]) => ({
        region: data.region,
        city: key.split('-')[1],
        phones: data.phones
      }));
      
      console.log(`✅ MGRegionService - Processadas ${result.length} cidades`);
      return result;
    } catch (error) {
      console.error('❌ Error in MGRegionService.getMGRegions:', error);
      return [];
    }
  }
} 