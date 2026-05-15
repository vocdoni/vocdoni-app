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

// src/wallets/walletConnectors/bifrostWallet/bifrostWallet.ts
var bifrostWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isBifrostInjected = hasInjectedProvider({ flag: "isBifrost" });
  const shouldUseWalletConnect = !isBifrostInjected;
  const getUri = (uri) => {
    return isAndroid() ? uri : `https://app.bifrostwallet.com/wc?uri=${encodeURIComponent(uri)}`;
  };
  return {
    id: "bifrostWallet",
    name: "Bifrost Wallet",
    rdns: "com.bifrostwallet",
    iconUrl: async () => (await import("./bifrostWallet-QCRWPXE2.js")).default,
    iconBackground: "#fff",
    installed: !shouldUseWalletConnect ? isBifrostInjected : void 0,
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=com.bifrostwallet.app",
      ios: "https://apps.apple.com/us/app/bifrost-wallet/id1577198351",
      qrCode: "https://bifrostwallet.com/#download-app"
    },
    mobile: {
      getUri: shouldUseWalletConnect ? getUri : void 0
    },
    qrCode: shouldUseWalletConnect ? {
      getUri: (uri) => uri,
      instructions: {
        learnMoreUrl: "https://support.bifrostwallet.com/en/articles/6886814-how-to-use-walletconnect",
        steps: [
          {
            description: "wallet_connectors.bifrost.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.bifrost.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.bifrost.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.bifrost.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.bifrost.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.bifrost.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : getInjectedConnector({
      flag: "isBifrost"
    })
  };
};

export {
  bifrostWallet
};
