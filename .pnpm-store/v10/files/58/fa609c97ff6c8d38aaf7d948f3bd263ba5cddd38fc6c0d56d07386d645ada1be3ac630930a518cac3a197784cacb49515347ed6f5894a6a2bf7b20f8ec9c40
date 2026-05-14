"use client";
import {
  isAndroid
} from "./chunk-RETKWSKD.js";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/bitgetWallet/bitgetWallet.ts
var bitgetWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isBitKeepInjected = hasInjectedProvider({
    namespace: "bitkeep.ethereum",
    flag: "isBitKeep"
  });
  const shouldUseWalletConnect = !isBitKeepInjected;
  return {
    id: "bitget",
    name: "Bitget Wallet",
    rdns: "com.bitget.web3",
    iconUrl: async () => (await import("./bitgetWallet-F7U5Y4MR.js")).default,
    iconAccent: "#f6851a",
    iconBackground: "#fff",
    installed: !shouldUseWalletConnect ? isBitKeepInjected : void 0,
    downloadUrls: {
      android: "https://web3.bitget.com/en/wallet-download?type=0",
      ios: "https://apps.apple.com/app/bitkeep/id1395301115",
      mobile: "https://web3.bitget.com/en/wallet-download?type=2",
      qrCode: "https://web3.bitget.com/en/wallet-download",
      chrome: "https://chrome.google.com/webstore/detail/bitkeep-crypto-nft-wallet/jiidiaalihmmhddjgbnbgdfflelocpak",
      browserExtension: "https://web3.bitget.com/en/wallet-download"
    },
    extension: {
      instructions: {
        learnMoreUrl: "https://web3.bitget.com/en/academy",
        steps: [
          {
            description: "wallet_connectors.bitget.extension.step1.description",
            step: "install",
            title: "wallet_connectors.bitget.extension.step1.title"
          },
          {
            description: "wallet_connectors.bitget.extension.step2.description",
            step: "create",
            title: "wallet_connectors.bitget.extension.step2.title"
          },
          {
            description: "wallet_connectors.bitget.extension.step3.description",
            step: "refresh",
            title: "wallet_connectors.bitget.extension.step3.description"
          }
        ]
      }
    },
    mobile: {
      getUri: shouldUseWalletConnect ? (uri) => {
        return isAndroid() ? uri : `bitkeep://wc?uri=${encodeURIComponent(uri)}`;
      } : void 0
    },
    qrCode: shouldUseWalletConnect ? {
      getUri: (uri) => uri,
      instructions: {
        learnMoreUrl: "https://web3.bitget.com/en/academy",
        steps: [
          {
            description: "wallet_connectors.bitget.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.bitget.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.bitget.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.bitget.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.bitget.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.bitget.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : getInjectedConnector({
      namespace: "bitkeep.ethereum",
      flag: "isBitKeep"
    })
  };
};

export {
  bitgetWallet
};
