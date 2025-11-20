/**
 * Utility functions for data transformation
 */

/**
 * Convert snake_case string to camelCase
 * @param str - String in snake_case format
 * @returns String in camelCase format
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert object keys from snake_case to camelCase recursively
 * @param obj - Object with snake_case keys
 * @returns Object with camelCase keys
 */
export function keysToCamel<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => keysToCamel(item)) as any;
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    const result: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = snakeToCamel(key);
        result[camelKey] = keysToCamel(obj[key]);
      }
    }

    return result;
  }

  return obj;
}

/**
 * Convert camelCase string to snake_case
 * @param str - String in camelCase format
 * @returns String in snake_case format
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert object keys from camelCase to snake_case recursively
 * @param obj - Object with camelCase keys
 * @returns Object with snake_case keys
 */
export function keysToSnake<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => keysToSnake(item)) as any;
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    const result: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const snakeKey = camelToSnake(key);
        result[snakeKey] = keysToSnake(obj[key]);
      }
    }

    return result;
  }

  return obj;
}

/**
 * Transform API response to camelCase format
 * This function handles common API response structures with 'data', 'response', or direct object
 * @param response - API response object
 * @returns Transformed response with camelCase keys
 */
export function transformResponse<T = any>(response: any): T {
  if (!response) {
    return response;
  }

  // Handle axios response structure
  if (response.data) {
    return keysToCamel(response.data);
  }

  // Handle direct response
  return keysToCamel(response);
}
