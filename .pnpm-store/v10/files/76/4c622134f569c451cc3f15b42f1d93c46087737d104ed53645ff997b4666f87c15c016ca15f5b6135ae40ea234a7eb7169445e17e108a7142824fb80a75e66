"use client";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/oneInchWallet/oneInchWallet.ts
var oneInchWallet = ({
  projectId,
  walletConnectParameters
}) => ({
  id: "1inch",
  name: "1inch Wallet",
  iconUrl: async () => (await import("./oneInchWallet-H7WWLHNC.js")).default,
  iconBackground: "#fff",
  downloadUrls: {
    android: "https://play.google.com/store/apps/details?id=io.oneinch.android",
    ios: "https://apps.apple.com/us/app/1inch-crypto-defi-wallet/id1546049391",
    mobile: "https://1inch.io/wallet",
    qrCode: "https://1inch.io/wallet"
  },
  mobile: {
    getUri: (uri) => `oneinch://wc?uri=${encodeURIComponent(uri)}`
  },
  qrCode: {
    getUri: (uri) => uri,
    instructions: {
      learnMoreUrl: "https://1inch.io/wallet",
      steps: [
        {
          description: "wallet_connectors.1inch.qr_code.step1.description",
          step: "install",
          title: "wallet_connectors.1inch.qr_code.step1.title"
        },
        {
          description: "wallet_connectors.1inch.qr_code.step2.description",
          step: "create",
          title: "wallet_connectors.1inch.qr_code.step2.title"
        },
        {
          description: "wallet_connectors.1inch.qr_code.step3.description",
          step: "scan",
          title: "wallet_connectors.1inch.qr_code.step3.title"
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
  oneInchWallet
};
