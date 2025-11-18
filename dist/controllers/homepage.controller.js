"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomepage = void 0;
const homepage_service_1 = require("../services/directus/homepage.service");
const homepageService = new homepage_service_1.HomepageService();
const getHomepage = async (req, res) => {
    try {
        const token = req.query.token;
        console.log('[HomepageController] getHomepage:', {
            hasToken: !!token,
            tokenLength: token?.length || 0,
            token: token
        });
        const previewToken = token ? process.env.DIRECTUS_TOKEN : undefined;
        console.log('[HomepageController] Usando previewToken:', {
            hasPreviewToken: !!previewToken,
            previewTokenLength: previewToken?.length || 0
        });
        const data = await homepageService.getHomepageData(previewToken);
        res.json(data);
    }
    catch (error) {
        console.error('❌ Error in getHomepage:', error);
        console.error('❌ Error details:', error instanceof Error ? error.message : error);
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
        res.status(500).json({ message: 'Failed to load homepage' });
    }
};
exports.getHomepage = getHomepage;
//# sourceMappingURL=homepage.controller.js.map