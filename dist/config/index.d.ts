export declare const config: {
    server: {
        port: string | number;
        nodeEnv: string;
    };
    directus: {
        url: string;
        token: string | undefined;
        email: string | undefined;
        password: string | undefined;
    };
    cors: {
        origin: string;
        credentials: boolean;
    };
    keycloak: {
        realm: string;
        authServerUrl: string;
        sslRequired: string;
        resource: string;
        secret: string;
        confidentialPort: number;
    };
    logging: {
        level: string;
        format: string;
    };
};
export default config;
//# sourceMappingURL=index.d.ts.map