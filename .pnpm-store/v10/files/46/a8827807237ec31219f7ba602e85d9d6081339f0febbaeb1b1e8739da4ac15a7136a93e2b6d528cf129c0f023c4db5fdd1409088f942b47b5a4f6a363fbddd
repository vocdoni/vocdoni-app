import { Wallet } from '@ethersproject/wallet';
import { Signer } from '@ethersproject/abstract-signer';
import { JsonRpcSigner } from '@ethersproject/providers';
import { RemoteSigner } from '../types';

export class Signing {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  /**
   * Prefix and Sign a binary payload using the given Ethers wallet or signer.
   * @param message -
   * @param walletOrSigner -
   */
  static signTransaction(message: string, walletOrSigner: Wallet | Signer | RemoteSigner): Promise<string> {
    if (!walletOrSigner) throw new Error('Invalid wallet/signer');

    const digestedMessage = new TextEncoder().encode(message);

    return this.signRaw(digestedMessage, walletOrSigner);
  }

  /**
   * Sign a binary payload using the given Ethers wallet or signer.
   * @param request -
   * @param walletOrSigner -
   */
  static signRaw(request: Uint8Array, walletOrSigner: Wallet | Signer | RemoteSigner): Promise<string> {
    if (!walletOrSigner) throw new Error('Invalid wallet/signer');

    if (walletOrSigner instanceof Wallet) {
      return walletOrSigner.signMessage(request);
    } else if (!(walletOrSigner instanceof JsonRpcSigner)) {
      // Unexpected case, try to sign with eth_sign, even if we would prefer `personal_sign`
      return walletOrSigner.signMessage(request);
    }

    // Some providers will use eth_sign without prepending the Ethereum prefix.
    // This will break signatures in some cases (Wallet Connect, Ledger, Trezor, etc).
    // Using personal_sign instead
    return walletOrSigner
      .getAddress()
      .then((address) =>
        walletOrSigner.provider.send('personal_sign', [new TextDecoder('utf-8').decode(request), address.toLowerCase()])
      );
  }
}
