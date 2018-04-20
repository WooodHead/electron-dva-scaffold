import * as qs from 'query-string';

// interface RequestResult {
//     status: number;
//     message?: string;
//     item?: any;
// }

async function filterRes(res: Response) {
    let result: any;
    try {
        result = await res.json();
    } catch (error) {
        result = null;
    }

    if (__DEV__) {
        console.groupCollapsed('Response: ' + res.url);
        console.log('status: ' + res.status);
        console.log('statusText: ' + res.statusText);
        console.log(result);
        console.groupEnd();
    }

    if (result || (res.status >= 200 && res.status < 400)) {
        return result;
    } else {
        const error = new Error(res.statusText || `服务器未知错误: ${res.status}`);
        error['status'] = res.status;
        error['statusText'] = res.statusText;
        throw error;
    }
}

export interface GetOptions {
    prefix?: string;
    headers?: { [key: string]: any };
    params?: { [key: string]: any };
}

const defaultHeaders = {
    'X-Requested-With': 'XMLHttpRequest',
};

export async function get(path: string, options?: GetOptions) {
    let url: string;
    options = options || {};

    if (!options.headers) {
        options.headers = Object.assign({}, defaultHeaders);
    }

    url = (options.prefix || '') + path;
    if (options.params) {
        url += `?${qs.stringify(options.params)}`;
    }

    const init: RequestInit = {
        method: 'GET',
        headers: options.headers,
    };

    if (__DEV__) {
        console.groupCollapsed('Request: ', url);
        console.info({ ...init, params: options.params });
        console.groupEnd();
    }

    return filterRes(await fetch(url, init));
}

export interface PostOptions {
    prefix?: string;
    headers?: { [key: string]: any };
    body?: object;
}

export async function post(path: string, options?: PostOptions) {
    let url: string;
    options = options || {};

    url = (options.prefix || '') + path;

    if (!options.headers) {
        options.headers = Object.assign({}, defaultHeaders);
    }

    options.headers = {
        ...{
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        ...options.headers
    };

    if (!options.body) {
        options.body = {};
    }

    const json = options.headers['Content-Type'] === 'application/json';
    let requestBody: any;
    if (options.body instanceof FormData) {
        requestBody = options.body;
    } else {
        requestBody = json ? JSON.stringify(options.body) : qs.stringify(options.body);
    }

    const init: RequestInit = {
        method: 'POST',
        headers: options.headers,
        body: requestBody
    };

    if (__DEV__) {
        console.groupCollapsed('Requset: ', url);
        console.log(init);
        console.groupEnd();
    }

    return filterRes(await fetch(url, init));
}