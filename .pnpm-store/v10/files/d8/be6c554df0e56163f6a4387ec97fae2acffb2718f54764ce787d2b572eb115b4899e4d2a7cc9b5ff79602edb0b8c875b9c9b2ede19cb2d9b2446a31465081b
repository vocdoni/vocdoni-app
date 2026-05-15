"use client";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/mewWallet/mewWallet.ts
var mewWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isMEWInjected = hasInjectedProvider({ flag: "isMEWwallet" });
  const shouldUseWalletConnect = !isMEWInjected;
  const getUri = (uri) => {
    return `https://mewwallet.com/wc?uri=${encodeURIComponent(uri)}`;
  };
  return {
    id: "mew",
    name: "MEW wallet",
    iconUrl: async () => (await import("./mewWallet-IF2URER6.js")).default,
    iconBackground: "#fff",
    installed: !shouldUseWalletConnect ? isMEWInjected : void 0,
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=com.myetherwallet.mewwallet&referrer=utm_source%3Drainbow",
      ios: "https://apps.apple.com/app/apple-store/id1464614025?pt=118781877&mt=8&ct=rainbow",
      mobile: "https://mewwallet.com",
      qrCode: "https://mewwallet.com"
    },
    mobile: { getUri: shouldUseWalletConnect ? getUri : void 0 },
    qrCode: shouldUseWalletConnect ? {
      getUri,
      instructions: {
        learnMoreUrl: "https://help.myetherwallet.com/en/articles/5946588-create-and-back-up-your-wallet-with-mew-wallet-ios",
        steps: [
          {
            description: "wallet_connectors.mew.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.mew.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.mew.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.mew.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.mew.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.mew.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : getInjectedConnector({ flag: "isMEWwallet" })
  };
};

export {
  mewWallet
};
