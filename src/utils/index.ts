import { ErrorResponse } from "../types";

/**
 * Validates if a string is a valid MongoDB ObjectID
 * 
 * MongoDB ObjectIDs are 24-character hexadecimal strings that serve as unique
 * identifiers for documents in collections. This function validates
 * the format and structure of ObjectID strings.
 * 
 * @param id - The string to validate as an ObjectID
 * @returns True if the string is a valid ObjectID, false otherwise
 * 
 * @example
 * Valid ObjectIDs:
 * ```typescript
 * isValidObjectId('507f1f77bcf86cd799439011'); // true
 * isValidObjectId('507f1f77bcf86cd799439012'); // true
 * isValidObjectId('507f1f77bcf86cd799439013'); // true
 * ```
 * 
 * @example
 * Invalid ObjectIDs:
 * ```typescript
 * isValidObjectId('invalid-id'); // false
 * isValidObjectId('123'); // false
 * isValidObjectId('507f1f77bcf86cd79943901'); // false (23 chars)
 * isValidObjectId('507f1f77bcf86cd7994390111'); // false (25 chars)
 * isValidObjectId('507f1f77bcf86cd79943901g'); // false (invalid char)
 * ```
 * 
 * @example
 * Usage in validation:
 * ```typescript
 * function validateUserId(userId: string): boolean {
 *   if (!isValidObjectId(userId)) {
 *     throw new Error('Invalid user ID format');
 *   }
 *   return true;
 * }
 * ```
 * 
 * @category Utilities
 */
export function isValidObjectId(id: string): boolean {
    // MongoDB ObjectID is a 24-character hexadecimal string
    const objectIdRegex = /^[a-fA-F0-9]{24}$/;
    return objectIdRegex.test(id);
}

/**
 * Parses and standardizes error objects
 * 
 * This function takes any error object and converts it to a standardized format
 * with consistent properties for error handling throughout the SDK. It ensures
 * that all errors have the same structure regardless of their source.
 * 
 * @param error - Any error object to parse and standardize
 * @returns Promise that rejects with a standardized error object
 * 
 * @example
 * Basic error parsing:
 * ```typescript
 * try {
 *   // Some operation that might fail
 *   await someApiCall();
 * } catch (error) {
 *   const standardizedError = await parseError(error);
 *   console.log('Error message:', standardizedError.message);
 *   console.log('Status code:', standardizedError.status_code);
 *   console.log('Status:', standardizedError.status);
 * }
 * ```
 * 
 * @example
 * Error handling in API calls:
 * ```typescript
 * async function safeApiCall() {
 *   try {
 *     const response = await fetch('/api/data');
 *     if (!response.ok) {
 *       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
 *     }
 *     return await response.json();
 *   } catch (error) {
 *     const standardizedError = await parseError(error);
 *     console.error('API Error:', {
 *       message: standardizedError.message,
 *       status: standardizedError.status,
 *       code: standardizedError.status_code,
 *       details: standardizedError.more_info
 *     });
 *     throw standardizedError;
 *   }
 * }
 * ```
 * 
 * @example
 * Custom error handling:
 * ```typescript
 * async function handleDatabaseError(error: any) {
 *   const standardizedError = await parseError(error);
 *   
 *   if (standardizedError.status_code === 404) {
 *     console.log('Resource not found');
 *   } else if (standardizedError.status_code >= 500) {
 *     console.log('Server error occurred');
 *   } else {
 *     console.log('Client error:', standardizedError.message);
 *   }
 *   
 *   return standardizedError;
 * }
 * ```
 * 
 * @category Utilities
 */
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

/**
 * Generates a URL query string from an object of parameters
 * 
 * This function converts an object of key-value pairs into a properly formatted
 * URL query string, handling both simple values and arrays. It automatically
 * handles URL encoding and array notation for query parameters.
 * 
 * @param params - Object containing query parameters
 * @returns URL query string (e.g., "?key1=value1&key2=value2&key3[]=value3&key3[]=value4")
 * 
 * @example
 * Basic query parameters:
 * ```typescript
 * const params = {
 *   limit: 10,
 *   offset: 0,
 *   search: 'john',
 *   active: true
 * };
 * 
 * const queryString = queryGenerator(params);
 * // Result: "?limit=10&offset=0&search=john&active=true"
 * ```
 * 
 * @example
 * With array parameters:
 * ```typescript
 * const params = {
 *   tags: ['ai', 'automation', 'support'],
 *   categories: ['featured', 'popular'],
 *   exclude: ['archived', 'draft']
 * };
 * 
 * const queryString = queryGenerator(params);
 * // Result: "?tags[]=ai&tags[]=automation&tags[]=support&categories[]=featured&categories[]=popular&exclude[]=archived&exclude[]=draft"
 * ```
 * 
 * @example
 * Complex filtering:
 * ```typescript
 * const filterParams = {
 *   user: 'user-123',
 *   org: 'org-456',
 *   status: ['active', 'pending'],
 *   created_after: '2024-01-01',
 *   sort_by: 'created_at',
 *   sort_order: 'desc',
 *   include_metadata: true
 * };
 * 
 * const queryString = queryGenerator(filterParams);
 * // Result: "?user=user-123&org=org-456&status[]=active&status[]=pending&created_after=2024-01-01&sort_by=created_at&sort_order=desc&include_metadata=true"
 * ```
 * 
 * @example
 * Usage in API calls:
 * ```typescript
 * async function fetchUsers(filters: any) {
 *   const queryString = queryGenerator(filters);
 *   const response = await fetch(`/api/users${queryString}`);
 *   return response.json();
 * }
 * 
 * // Usage
 * const users = await fetchUsers({
 *   limit: 20,
 *   offset: 0,
 *   search: 'john',
 *   tags: ['admin', 'verified']
 * });
 * ```
 * 
 * @category Utilities
 */
export function queryGenerator(params: any = {}): string {
    return Object.keys(params).reduce((a, c, i) => {
        if (i === 0) a += '?';
        else a += '&';
        if (Array.isArray(params[c])) a += params[c].reduce((b, v, j) => b += `${j > 0 ? '&' : ''}${c}[]=${v}`, "");
        else a += `${c}=${params[c]}`;

        return a;
    }, '');
}

/**
 * Type for standardized failure responses
 */
export type FailureResponse = {
    data: null;
    error: string;
}

/**
 * Type for standardized success responses
 */
export type SuccessResponse<T = any> = {
    data: T;
    error: null;
}

/**
 * Validates if a timestamp string is expired
 * 
 * This function parses a timestamp string (typically from JWT tokens) and checks
 * if it represents a time that has already passed.
 * 
 * @param timestamp - The timestamp string to validate (e.g., '1754078962511')
 * @returns True if the timestamp is in the past (expired), false otherwise
 * 
 * @example
 * ```typescript
 * isTimestampExpired('1754078962511'); // true if current time > 1754078962511
 * isTimestampExpired('9999999999999'); // false (future timestamp)
 * isTimestampExpired(''); // false (invalid timestamp)
 * ```
 */
export function isTimestampExpired(timestamp: string): boolean {
    if (!timestamp || timestamp.trim() === '') {
        return false;
    }
    
    // Check if the string contains non-numeric characters (except for the first character which could be a minus sign)
    if (!/^-?\d+$/.test(timestamp)) {
        return false;
    }
    
    const parsedTimestamp = parseInt(timestamp, 10);
    if (isNaN(parsedTimestamp)) {
        return false;
    }
    
    return parsedTimestamp < Date.now();
}

/**
 * Creates a standardized failure response
 * 
 * @param error - Error message describing the failure
 * @returns FailureResponse object with null data and the error message
 * 
 * @example
 * ```typescript
 * const result = failure('User not found');
 * // Result: { data: null, error: 'User not found' }
 * ```
 */
export function failure(error: string): FailureResponse {
    return {
        data: null,
        error
    }
}

/**
 * Creates a standardized success response
 * 
 * @param data - The data to include in the success response
 * @returns SuccessResponse object with the data and null error
 * 
 * @example
 * ```typescript
 * const result = success({ id: '123', name: 'John' });
 * // Result: { data: { id: '123', name: 'John' }, error: null }
 * ```
 */
export function success<T = any>(data: T | any = null): SuccessResponse<T> {
    return {
        data,
        error: null
    }
}

/**
 * Converts server errors to readable string format
 * 
 * This function takes server error objects and converts them to human-readable
 * string messages, handling cases where errors have digest information.
 * 
 * @param err - Server error object
 * @returns Formatted error string
 * 
 * @example
 * ```typescript
 * try {
 *   // Some server operation
 * } catch (error) {
 *   const errorMessage = serverErrorToString(error);
 *   console.log('Server error:', errorMessage);
 * }
 * ```
 */
export function serverErrorToString(err: any) {
    if (err.digest) {
        console.log(`${err.digest}: ${err.message}`)
    }
    const messageStr = err.digest ? 'Unexpected Error' : err.message;

    let digestStr = '';
    if (err.digest) {
        digestStr = ` (digest: ${err.digest})`;
    }

    return `${messageStr}${digestStr}`;
}

/**
 * Type guard to check if an error is an SDK error
 * 
 * This function checks if an error object has the structure of an SDK error
 * by verifying it has the required properties: message, code, and status.
 * 
 * @param err - Any error object to check
 * @returns True if the error is an SDK error, false otherwise
 * 
 * @example
 * ```typescript
 * try {
 *   const users = await mosaia.users.get();
 * } catch (error) {
 *   if (isSdkError(error)) {
 *     console.log('SDK Error:', error.message);
 *     console.log('Error Code:', error.code);
 *     console.log('Status:', error.status);
 *   } else {
 *     console.log('Unexpected error:', error);
 *   }
 * }
 * ```
 */
export function isSdkError(err: any): err is ErrorResponse {
    const potentialSdkError = err as ErrorResponse;

    if ('message' in potentialSdkError && 'code' in potentialSdkError && 'status' in potentialSdkError) return true;

    return false;
}
