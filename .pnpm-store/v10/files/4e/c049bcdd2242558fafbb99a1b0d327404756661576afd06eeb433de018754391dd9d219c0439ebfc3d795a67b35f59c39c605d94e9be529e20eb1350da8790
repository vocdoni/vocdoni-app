import { Buffer } from 'buffer';
import { strip0x } from './common';
import nacl from 'tweetnacl';
import blake from 'blakejs/blake2b';
import { sha256 } from 'js-sha256';

export class Asymmetric {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  /**
   * Encrypts the given message using a secret key and returns it in base64 format.
   *
   * @param messageBytes - The payload to encrypt
   * @param secretKey - The secret key to use
   */
  static encryptBox(messageBytes: string, secretKey: string): string {
    const msg = Uint8Array.from(Buffer.from(messageBytes));
    const secretKeyHash = Uint8Array.from(Buffer.from(sha256(secretKey))).slice(0, 32);
    const keyPair = nacl.box.keyPair.fromSecretKey(secretKeyHash);
    const nonce = Uint8Array.from(Buffer.from(sha256(secretKey))).slice(0, 24);
    const encrypted = nacl.box(msg, nonce, keyPair.publicKey, keyPair.secretKey);
    return Buffer.from(encrypted).toString('base64');
  }

  /**
   * Decrypts the given encrypted base64 message using a secret key.
   *
   * @param messageBytes - The payload to decrypt
   * @param secretKey - The secret key to use
   */
  static decryptBox(messageBytes: string, secretKey: string): string {
    const msg = Buffer.from(messageBytes, 'base64');
    const secretKeyHash = Uint8Array.from(Buffer.from(sha256(secretKey))).slice(0, 32);
    const keyPair = nacl.box.keyPair.fromSecretKey(secretKeyHash);
    const nonce = Uint8Array.from(Buffer.from(sha256(secretKey))).slice(0, 24);
    return Buffer.from(nacl.box.open(msg, nonce, keyPair.publicKey, keyPair.secretKey)).toString();
  }

  /**
   * Encrypts the given buffer with NaCl SealedBox using the given hex public key.
   * Returns a buffer with the encrypted payload.
   *
   * @param messageBytes - The payload to encrypt
   * @param hexPublicKey - 32 byte public key in hex format
   */
  static encryptRaw(messageBytes: Uint8Array, hexPublicKey: string): Buffer {
    const pubKeyBytes = Buffer.from(strip0x(hexPublicKey), 'hex');

    const sealed = Asymmetric.seal(messageBytes, pubKeyBytes);
    return Buffer.from(sealed);
  }

  private static seal(m: Uint8Array, pk: Uint8Array): Uint8Array {
    const c = new Uint8Array(nacl.box.publicKeyLength + nacl.box.overheadLength + m.length);

    const ek = nacl.box.keyPair();
    c.set(ek.publicKey);

    const nonce = Asymmetric.nonceGenerator(ek.publicKey, pk);
    const boxed = nacl.box(m, nonce, pk, ek.secretKey);
    c.set(boxed, ek.publicKey.length);

    for (let i = 0; i < ek.secretKey.length; i++) {
      ek.secretKey[i] = 0;
    }

    return c;
  }

  private static nonceGenerator(pk1: Uint8Array, pk2: Uint8Array) {
    const state = blake.blake2bInit(nacl.box.nonceLength, null);
    blake.blake2bUpdate(state, pk1);
    blake.blake2bUpdate(state, pk2);
    return blake.blake2bFinal(state);
  }
}
