export interface FooterSection {
    id: number;
    title: string;
}
export interface FooterMenu {
    id: number;
    title: string;
    url: string;
    order: number;
    parent: number;
}
export interface FooterPhone {
    id: number;
    phone: string;
    parent: number;
}
export interface FooterSocial {
    id: number;
    title: string;
    url: string;
    icon: string;
    order: number;
    parent: number;
}
export interface FullFooterData {
    section: FooterSection;
    menu: FooterMenu[];
    phone: FooterPhone[];
    social: FooterSocial[];
}
//# sourceMappingURL=footer.types.d.ts.map