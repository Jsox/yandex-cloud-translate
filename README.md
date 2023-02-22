
# yandex-cloud-translate

Translate text with Yandex Cloud AI API

## Features

- ts included


## Installation

Install my-project with npm

```bash
  npm i yandex-cloud-translate
```
or
```bash
  yarn add yandex-cloud-translate
```

    
## Usage/Examples

```javascript
import { Yandex } from 'yandex-cloud-translate';

const config = {
    YC_OAUTH_TOKEN = 'token', // https://cloud.yandex.com/en-ru/docs/iam/concepts/authorization/oauth-token
    YC_FOLDER_ID = 'folder_id' // https://cloud.yandex.com/en-ru/docs/resource-manager/operations/folder/get-id
}

const Ya = new Yandex(config);
```

or if you have valid process.env, just create in .env file YC_OAUTH_TOKEN and YC_FOLDER_ID
```javascript
import { Yandex } from 'yandex-cloud-translate';
const Ya = new Yandex();
const translated = await Ya.translate({
    to: 'fr',
    from: 'en', // or auto
    texts: ['text one', 'text two'], // or texts: 'text one'
    format: 'text' // or 'html'
});

// 
interface ITranslateConfig {
    texts: string | string[]; // if a string - result will be a string, if array of strings - array of strings
    from?: string | null; // ISO ru, en, fr ... etc
    to: string; // ISO ru, en, fr ... etc
    format?: 'text' | 'html';
}

```
## Authors

- [@jsix](https://jsix.ru)
