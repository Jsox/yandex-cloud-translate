"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Yandex = void 0;
class Yandex {
    constructor(config = {}) {
        const { YC_OAUTH_TOKEN, YC_FOLDER_ID, YC_API_ADDRESS } = config;
        this.YC_OAUTH_TOKEN = YC_OAUTH_TOKEN || process.env.YC_OAUTH_TOKEN || '';
        this.YC_FOLDER_ID = YC_FOLDER_ID || process.env.YC_FOLDER_ID || '';
        this.YC_API_ADDRESS =
            YC_API_ADDRESS ||
                process.env.YC_API_ADDRESS ||
                'https://translate.api.cloud.yandex.net/translate/v2/translate';
        this.IAM_TOKEN = '';
        this.IAM_TOKEN_EXPIRES = Date.now();
        if (!this.YC_OAUTH_TOKEN) {
            throw new Error('invalid YC_OAUTH_TOKEN (add to .env YC_OAUTH_TOKEN)');
        }
        if (!this.YC_FOLDER_ID) {
            throw new Error('invalid YC_FOLDER_ID (add to .env YC_FOLDER_ID)');
        }
        if (typeof fetch != 'function') {
            throw new Error('You don`t have fetch function. Setup or use nodejs version >= 18');
        }
    }
    setIamToken() {
        return __awaiter(this, void 0, void 0, function* () {
            let hour = 60 * 60 * 1000;
            if (this.IAM_TOKEN && (this.IAM_TOKEN_EXPIRES - Date.now()) / hour > 11) {
                return;
            }
            const iAm = yield fetch('https://iam.api.cloud.yandex.net/iam/v1/tokens', {
                method: 'POST',
                body: JSON.stringify({
                    yandexPassportOauthToken: this.YC_OAUTH_TOKEN,
                }),
            })
                .then((data) => __awaiter(this, void 0, void 0, function* () { return yield data.json(); }))
                .then((json) => {
                return json;
            });
            this.IAM_TOKEN = iAm.iamToken;
            this.IAM_TOKEN_EXPIRES = new Date(iAm.expiresAt).getTime();
        });
    }
    translate({ texts, to, from = null, format = 'text' }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setIamToken();
            if (!this.IAM_TOKEN) {
                throw new Error('invalid IAM_TOKEN');
            }
            let body;
            body = {
                folderId: this.YC_FOLDER_ID,
                texts: typeof texts == 'string' ? [texts] : texts,
                targetLanguageCode: to,
                sourceLanguageCode: from,
                format: format === 'html' ? 'HTML' : 'PLAIN_TEXT',
            };
            const json = yield fetch(this.YC_API_ADDRESS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.IAM_TOKEN}`,
                },
                body: JSON.stringify(body),
            })
                .then((data) => __awaiter(this, void 0, void 0, function* () { return yield data.json(); }))
                .then((json) => json);
            return typeof texts == 'string'
                ? json.translations[0].text
                : json.translations.map((tr) => tr.text);
        });
    }
}
exports.Yandex = Yandex;
