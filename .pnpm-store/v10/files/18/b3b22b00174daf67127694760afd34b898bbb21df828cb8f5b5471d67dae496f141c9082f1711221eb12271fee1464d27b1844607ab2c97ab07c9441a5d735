"use client";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/kresusWallet/kresusWallet.ts
var kresusWallet = ({
  projectId,
  walletConnectParameters
}) => ({
  id: "kresus-wallet",
  name: "Kresus Wallet",
  iconUrl: async () => (await import("./kresusWallet-NGTYX3DA.js")).default,
  iconBackground: "#fff",
  downloadUrls: {
    android: "https://play.google.com/store/apps/details?id=com.kresus.superapp",
    ios: "https://apps.apple.com/us/app/kresus-crypto-nft-superapp/id6444355152",
    qrCode: "https://kresusconnect.kresus.com/download"
  },
  mobile: {
    getUri: (uri) => `com.kresus.superapp://wc?uri=${encodeURIComponent(uri)}`
  },
  qrCode: {
    getUri: (uri) => uri,
    instructions: {
      learnMoreUrl: "https://kresus.com/",
      steps: [
        {
          description: "wallet_connectors.kresus.qr_code.step1.description",
          step: "install",
          title: "wallet_connectors.kresus.qr_code.step1.title"
        },
        {
          description: "wallet_connectors.kresus.qr_code.step2.description",
          step: "create",
          title: "wallet_connectors.kresus.qr_code.step2.title"
        },
        {
          description: "wallet_connectors.kresus.qr_code.step3.description",
          step: "scan",
          title: "wallet_connectors.kresus.qr_code.step3.title"
        }
      ]
    }
  },
  createConnector: getWalletConnectConnector({
    projectId,
    walletConnectParameters
  })
});

export {
  kresusWallet
};
