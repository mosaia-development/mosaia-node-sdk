export function isValidObjectId(id: string): boolean {
    // MongoDB ObjectID is a 24-character hexadecimal string
    const objectIdRegex = /^[a-fA-F0-9]{24}$/;
    return objectIdRegex.test(id);
}

export function parseError(error: any): Promise<any> {
    const e = {
        message: error.message || 'Unknown Error',
        status_code: error.status_code || 400,
        status: error.status || 'UNKNOWN',
        more_info: error.more_info || {}
    };

    if (e.more_info.message) e.message = e.more_info.message;
    return Promise.reject(e);
}

export function queryGenerator(params: any = {}): string {
    return Object.keys(params).reduce((a, c, i) => {
        if (i === 0) a += '?';
        else a += '&';
        if (Array.isArray(params[c])) a += params[c].reduce((b, v, j) => b += `${j > 0 ? '&' : ''}${c}[]=${v}`, "");
        else a += `${c}=${params[c]}`;

        return a;
    }, '');
}

export type FailureResponse = {
    data: null;
    error: string;
}

export type SuccessResponse<T = any> = {
    data: T;
    error: null;
}

export function failure(error: string): FailureResponse {
    return {
        data: null,
        error
    }
}

export function success<T = any>(data: T | any = null): SuccessResponse<T> {
    return {
        data,
        error: null
    }
}

export function serverErrorToString(err: any) {
    if(err.digest) {
        console.log(`${err.digest}: ${err.message}`)
    }
    const messageStr = err.digest ? 'Unexpected Error' : err.message;

    let digestStr = '';
    if (err.digest) {
        digestStr = ` (digest: ${err.digest})`;
    }

    return `${messageStr}${digestStr}`;
}
