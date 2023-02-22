interface Config {
    YC_OAUTH_TOKEN?: string;
    YC_FOLDER_ID?: string;
    YC_API_ADDRESS?: string;
}
interface ITranslateConfig {
    texts: string | string[];
    from?: string | null;
    to: string;
    format?: 'text' | 'html';
}
export declare class Yandex {
    private YC_OAUTH_TOKEN;
    private YC_FOLDER_ID;
    private IAM_TOKEN;
    private IAM_TOKEN_EXPIRES;
    private YC_API_ADDRESS;
    constructor(config?: Config);
    setIamToken(): Promise<void>;
    translate({ texts, to, from, format }: ITranslateConfig): Promise<typeof texts>;
}
export {};
