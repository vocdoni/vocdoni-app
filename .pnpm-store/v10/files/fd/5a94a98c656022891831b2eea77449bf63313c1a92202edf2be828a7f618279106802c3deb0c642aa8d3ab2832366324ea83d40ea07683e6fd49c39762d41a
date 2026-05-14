"use client";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/coin98Wallet/coin98Wallet.ts
var coin98Wallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isCoin98WalletInjected = hasInjectedProvider({
    namespace: "coin98.provider",
    flag: "isCoin98"
  });
  const shouldUseWalletConnect = !isCoin98WalletInjected;
  return {
    id: "coin98",
    name: "Coin98 Wallet",
    iconUrl: async () => (await import("./coin98Wallet-LBBSGIZG.js")).default,
    installed: !shouldUseWalletConnect ? isCoin98WalletInjected : void 0,
    iconAccent: "#CDA349",
    iconBackground: "#fff",
    rdns: "com.coin98",
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=coin98.crypto.finance.media",
      ios: "https://apps.apple.com/vn/app/coin98-super-app/id1561969966",
      mobile: "https://coin98.com/wallet",
      qrCode: "https://coin98.com/wallet",
      chrome: "https://chrome.google.com/webstore/detail/coin98-wallet/aeachknmefphepccionboohckonoeemg",
      browserExtension: "https://coin98.com/wallet"
    },
    mobile: {
      getUri: shouldUseWalletConnect ? (uri) => uri : void 0
    },
    qrCode: shouldUseWalletConnect ? {
      getUri: (uri) => uri,
      instructions: {
        learnMoreUrl: "https://coin98.com/wallet",
        steps: [
          {
            description: "wallet_connectors.coin98.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.coin98.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.coin98.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.coin98.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.coin98.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.coin98.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    extension: {
      instructions: {
        learnMoreUrl: "https://coin98.com/wallet",
        steps: [
          {
            description: "wallet_connectors.coin98.extension.step1.description",
            step: "install",
            title: "wallet_connectors.coin98.extension.step1.title"
          },
          {
            description: "wallet_connectors.coin98.extension.step2.description",
            step: "create",
            title: "wallet_connectors.coin98.extension.step2.title"
          },
          {
            description: "wallet_connectors.coin98.extension.step3.description",
            step: "refresh",
            title: "wallet_connectors.coin98.extension.step3.title"
          }
        ]
      }
    },
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : getInjectedConnector({
      namespace: "coin98Wallet",
      flag: "isCoin98"
    })
  };
};

export {
  coin98Wallet
};
