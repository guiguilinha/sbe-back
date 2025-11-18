// footer.service.ts
import {
  FooterSection,
  FooterMenu,
  FooterPhone,
  FooterSocial,
  FullFooterData
} from '../../../contracts';
import { DirectusBaseService } from '../base/directus-base.service';

export class FooterService extends DirectusBaseService {
  protected serviceName = 'home_footer';

  async getFullFooter(previewToken?: string): Promise<FullFooterData> {
    console.log('[FooterService] getFullFooter:', {
      hasPreviewToken: !!previewToken,
      previewTokenLength: previewToken?.length || 0
    });

    const result = await this.fetchSectionWithExtras<FooterSection, any>({
      menu: { endpoint: 'items/home_footer_menu', sort: 'order' },
      phone: { endpoint: 'items/home_footer_phone' },
      social: { endpoint: 'items/home_footer_social' }
    }, {
      token: previewToken
    });

    return {
      section: result.section,
      menu: result.menu as FooterMenu[],
      phone: result.phone as FooterPhone[],
      social: result.social as FooterSocial[]
    };
  }
}