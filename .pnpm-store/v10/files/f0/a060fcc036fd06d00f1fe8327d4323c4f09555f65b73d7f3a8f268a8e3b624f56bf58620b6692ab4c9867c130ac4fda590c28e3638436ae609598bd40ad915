"use client";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/zealWallet/zealWallet.ts
var zealWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isZealWalletInjected = hasInjectedProvider({ flag: "isZeal" });
  const shouldUseWalletConnect = !isZealWalletInjected;
  return {
    id: "zeal",
    name: "Zeal",
    rdns: "app.zeal",
    iconUrl: async () => (await import("./zealWallet-I6PCJZVZ.js")).default,
    iconBackground: "#fff0",
    iconAccent: "#00FFFF",
    downloadUrls: {
      browserExtension: "https://zeal.app",
      chrome: "https://chromewebstore.google.com/detail/zeal-wallet/heamnjbnflcikcggoiplibfommfbkjpj",
      android: "https://play.google.com/store/apps/details?id=app.zeal.wallet",
      ios: "https://testflight.apple.com/join/MP72Ytw8",
      mobile: "https://zeal.app",
      qrCode: "https://zeal.app"
    },
    mobile: {
      getUri: shouldUseWalletConnect ? (uri) => {
        return `zeal://wc?uri=${encodeURIComponent(uri)}`;
      } : void 0
    },
    qrCode: shouldUseWalletConnect ? {
      getUri: (uri) => uri,
      instructions: {
        learnMoreUrl: "https://zeal.app",
        steps: [
          {
            description: "wallet_connectors.zeal.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.zeal.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.zeal.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.zeal.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.zeal.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.zeal.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    extension: {
      instructions: {
        learnMoreUrl: "https://zeal.app",
        steps: [
          {
            description: "wallet_connectors.zeal.extension.step1.description",
            step: "install",
            title: "wallet_connectors.zeal.extension.step1.title"
          },
          {
            description: "wallet_connectors.zeal.extension.step2.description",
            step: "create",
            title: "wallet_connectors.zeal.extension.step2.title"
          },
          {
            description: "wallet_connectors.zeal.extension.step3.description",
            step: "refresh",
            title: "wallet_connectors.zeal.extension.step3.title"
          }
        ]
      }
    },
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : getInjectedConnector({ flag: "isZeal" })
  };
};

export {
  zealWallet
};
