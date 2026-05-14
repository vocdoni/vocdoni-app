/**
 * Sets a nested value in an object using a key path and separator.
 * Creates intermediate objects as needed.
 *
 * @param obj - The target object to modify
 * @param path - The key path (e.g., 'user.profile.name')
 * @param value - The value to set
 * @param keySeparator - The separator to use for splitting the path, or false for flat keys
 *
 * @example
 * ```typescript
 * const obj = {}
 * setNestedValue(obj, 'user.profile.name', 'John', '.')
 * // Result: { user: { profile: { name: 'John' } } }
 *
 * // With flat keys
 * setNestedValue(obj, 'user.name', 'Jane', false)
 * // Result: { 'user.name': 'Jane' }
 * ```
 */
export declare function setNestedValue(obj: Record<string, any>, path: string, value: any, keySeparator: string | false): void;
/**
 * Retrieves a nested value from an object using a key path and separator.
 *
 * @param obj - The object to search in
 * @param path - The key path (e.g., 'user.profile.name')
 * @param keySeparator - The separator to use for splitting the path, or false for flat keys
 * @returns The found value or undefined if not found
 *
 * @example
 * ```typescript
 * const obj = { user: { profile: { name: 'John' } } }
 * const name = getNestedValue(obj, 'user.profile.name', '.')
 * // Returns: 'John'
 *
 * // With flat keys
 * const flatObj = { 'user.name': 'Jane' }
 * const name = getNestedValue(flatObj, 'user.name', false)
 * // Returns: 'Jane'
 * ```
 */
export declare function getNestedValue(obj: Record<string, any>, path: string, keySeparator: string | false): any;
/**
 * Extracts all nested keys from an object, optionally with a prefix.
 * Recursively traverses the object structure to build a flat list of key paths.
 *
 * @param obj - The object to extract keys from
 * @param keySeparator - The separator to use for joining keys, or false for flat keys
 * @param prefix - Optional prefix to prepend to all keys
 * @returns Array of all nested key paths
 *
 * @example
 * ```typescript
 * const obj = {
 *   user: {
 *     profile: { name: 'John', age: 30 },
 *     settings: { theme: 'dark' }
 *   }
 * }
 *
 * const keys = getNestedKeys(obj, '.')
 * // Returns: ['user.profile.name', 'user.profile.age', 'user.settings.theme']
 *
 * // With flat keys
 * const flatObj = { 'user.name': 'Jane', 'user.age': 25 }
 * const flatKeys = getNestedKeys(flatObj, false)
 * // Returns: ['user.name', 'user.age']
 * ```
 */
export declare function getNestedKeys(obj: object, keySeparator: string | false, prefix?: string): string[];
//# sourceMappingURL=nested-object.d.ts.map