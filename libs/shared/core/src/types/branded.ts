/**
 * Generic Brand type for creating Opaque Types.
 * Prevents accidental assignment of primitive values (like strings) to domain concepts (like IDs).
 *
 * @example
 * export type UserId = Brand<string, 'UserId'>;
 * const myId = '123' as UserId;
 */
export type Brand<K, T> = K & { readonly __brand: T };

/**
 * Helper to cast a primitive value to a Branded type.
 * Use this in Mappers, Factories, or DTO conversions where input validation is assumed or performed elsewhere.
 *
 * @param value The primitive value (e.g. string)
 */
export function asBrand<T extends Brand<any, any>>(value: any): T {
  return value as T;
}
