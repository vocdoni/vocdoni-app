import { keccak256 } from '@ethersproject/keccak256';
import { formatUnits as ethersFormatUnits } from '@ethersproject/units';
import nacl from 'tweetnacl';
import { BigNumberish } from '@ethersproject/bignumber';

export type { MultiLanguage } from './lang';

export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export function strip0x(value: string): string {
  return value.startsWith('0x') ? value.substring(2) : value;
}

export function ensure0x(value: string): string {
  return value.startsWith('0x') ? value : '0x' + value;
}

export function getBytes(count: number): Uint8Array {
  return nacl.randomBytes(count);
}

/**
 * Generates a random seed and returns a 32 byte keccak256 hash of it (starting with "0x")
 */
export function getHex(): string {
  const bytes = getBytes(32);
  return keccak256(bytes);
}

/**
 * Compares two hex strings checking if they're the same. It ensures both
 * have hex prefix and are lowercase.
 *
 * @param hex -1
 * @param hex -2
 */
export function areEqualHexStrings(hex1?: string, hex2?: string) {
  if (!hex1 || !hex2) return false;

  return ensure0x(hex1.toLowerCase()) === ensure0x(hex2.toLowerCase());
}

/**
 * Returns a string representation of value formatted with decimals digits
 *
 * @param value - The value in native BigInt
 * @param decimals - The number of decimals
 * @returns The formatted string
 */
export function formatUnits(value: BigNumberish, decimals: number = 18): string {
  return ethersFormatUnits(value, decimals);
}

/**
 * Dot notation to object conversion. Takes any object as first argument and uses the string dot notation from the
 * second argument (i.e. 'a.child.node') to access that given object value.
 *
 * @param obj - Object to be accessed by dot notation
 * @param dot - Dot notation string to extract object data
 * @returns Return the object data
 */
export const dotobject = (obj: any, dot: string) => {
  const rec = (obj: any, dot: string[]): any => {
    if (dot.length) {
      return typeof obj[dot[0]] !== 'undefined' ? rec(obj[dot[0]], dot.slice(1)) : null;
    }
    return obj;
  };

  return rec(obj, dot.split('.'));
};
