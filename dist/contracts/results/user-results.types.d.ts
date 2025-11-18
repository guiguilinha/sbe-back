export interface UserResultsData {
    "hero-section": {
        "hero-start": string;
        "hero-content": string;
        "hero-general-level": string;
        "hero-insight": string;
        "hero-icon": string;
        "hero-score-text": string;
        "hero-score": string;
        "hero-percent": string;
        "hero-image": string;
    };
    "advice-section": {
        "advice-title": string;
        "advice-general-level": string;
        "advice-content": string;
    };
    "category-section": {
        "category-title": string;
        "category-itens": Array<{
            "category-item-title": string;
            "category-item-level": string;
            "category-item-score": string;
            "category-item-percent": string;
            "category-item-advice": string;
            "category-item-insight": string;
            "category-item-recomendations": Array<{
                "content-course-title": string;
                "content-course-description": string;
                "content-course-image": string;
                "content-course-image_alt": string;
                "content-course-link": string;
                "content-course-levels": string[];
                "content-course-categories": string[];
            }>;
        }>;
    };
    "cta-section": {
        "cta-title": string;
        "cta-content": string;
        "cta-button-text": string;
        "cta-general-level": string;
        "trail-link": string;
    };
    "conclusion-section": {
        "conclusion-title": string;
        "conclusion-positive-feedback": string;
        "conclusion-attention-feeback": string;
        "conclusion-advice": string;
    };
    "content-section": {
        "content-title": string;
        "content-text": string;
        "content-general-level": string;
        "content-courses": Array<{
            "content-course-title": string;
            "content-course-description": string;
            "content-course-image": string;
            "content-course-image_alt": string;
            "content-course-link": string;
            "content-course-levels": string[];
            "content-course-categories": string[];
        }>;
    };
    "map-section": {
        "map-title": string;
        "map-content": string;
        "map-region": Array<{
            "map-region-title": string;
            "map-region-city-title": string;
            "map-region-phone-number": string;
        }>;
    };
}
//# sourceMappingURL=user-results.types.d.ts.map