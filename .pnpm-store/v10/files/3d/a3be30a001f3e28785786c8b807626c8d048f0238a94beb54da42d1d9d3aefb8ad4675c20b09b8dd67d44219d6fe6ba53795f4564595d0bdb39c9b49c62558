import { Census, CensusType } from './census';
import invariant from 'tiny-invariant';

/**
 * Represents a published census
 */
export class CspCensus extends Census {
  /**
   * Constructs a CSP census
   *
   * @param publicKey - The public
   * @param cspURI - The URI of the CSP server
   */
  public constructor(publicKey: string, cspURI: string) {
    invariant(/^(0x)?[0-9a-fA-F]+$/.test(publicKey), 'Public key is missing or invalid');
    try {
      new URL(cspURI);
    } catch (_) {
      invariant(false, 'CSP URI is missing or invalid');
    }
    super(publicKey, cspURI, CensusType.CSP);
  }
}
