interface Config {
    YC_OAUTH_TOKEN?: string; // https://cloud.yandex.com/en-ru/docs/iam/concepts/authorization/oauth-token
    YC_FOLDER_ID?: string; // https://cloud.yandex.com/en-ru/docs/resource-manager/operations/folder/get-id
    YC_API_ADDRESS?: string;
}
interface ITranslateConfig {
    texts: string | string[]; // if a string - result will be a string, if array of strings - array of strings
    from?: string | null; // ISO ru, en, fr ... etc
    to: string; // ISO ru, en, fr ... etc
    format?: 'text' | 'html';
}
interface IBody {
	folderId: string;
	texts: string[];
	targetLanguageCode: string;
	sourceLanguageCode?: string | null;
	format: 'PLAIN_TEXT' | 'HTML';
}

export class Yandex {
	private YC_OAUTH_TOKEN: string;
	private YC_FOLDER_ID: string;
	private IAM_TOKEN: string;
	private IAM_TOKEN_EXPIRES: number;
	private YC_API_ADDRESS: string;

	constructor(config: Config = {}) {
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

	async setIamToken() {
		let hour = 60 * 60 * 1000;

		if (this.IAM_TOKEN && (this.IAM_TOKEN_EXPIRES - Date.now()) / hour > 11) {
			return;
		}

		const iAm = await fetch('https://iam.api.cloud.yandex.net/iam/v1/tokens', {
			method: 'POST',
			body: JSON.stringify({
				yandexPassportOauthToken: this.YC_OAUTH_TOKEN,
			}),
		})
			.then(async (data) => await data.json())
			.then((json) => {
				return json;
			});

		this.IAM_TOKEN = iAm.iamToken;

		this.IAM_TOKEN_EXPIRES = new Date(iAm.expiresAt).getTime();
	}

	async translate({ texts, to, from = null, format = 'text' }: ITranslateConfig): Promise<typeof texts> {
		await this.setIamToken();

		if (!this.IAM_TOKEN) {
			throw new Error('invalid IAM_TOKEN');
		}

		let body: IBody;
		body = {
			folderId: this.YC_FOLDER_ID,
			texts: typeof texts == 'string' ? [texts] : texts,
			targetLanguageCode: to,
			sourceLanguageCode: from,
			format: format === 'html' ? 'HTML' : 'PLAIN_TEXT',
		};

		const json = await fetch(this.YC_API_ADDRESS, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.IAM_TOKEN}`,
			},
			body: JSON.stringify(body),
		})
			.then(async (data) => await data.json())
			.then((json) => json);

		return typeof texts == 'string'
			? json.translations[0].text
			: json.translations.map((tr: { text: string }) => tr.text);
	}
}
