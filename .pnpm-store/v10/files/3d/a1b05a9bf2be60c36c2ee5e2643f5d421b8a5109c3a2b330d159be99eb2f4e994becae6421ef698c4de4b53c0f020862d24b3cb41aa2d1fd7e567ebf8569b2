"use client";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/uniswapWallet/uniswapWallet.ts
var uniswapWallet = ({
  projectId,
  walletConnectParameters
}) => ({
  id: "uniswap",
  name: "Uniswap Wallet",
  iconUrl: async () => (await import("./uniswapWallet-VSBIGDAA.js")).default,
  iconBackground: "#FFD8EA",
  downloadUrls: {
    ios: "https://apps.apple.com/app/apple-store/id6443944476",
    mobile: "https://wallet.uniswap.org/",
    qrCode: "https://wallet.uniswap.org/"
  },
  mobile: {
    getUri: (uri) => {
      return `uniswap://wc?uri=${encodeURIComponent(uri)}`;
    }
  },
  qrCode: {
    getUri: (uri) => uri,
    instructions: {
      learnMoreUrl: "https://wallet.uniswap.org/",
      steps: [
        {
          description: "wallet_connectors.uniswap.qr_code.step1.description",
          step: "install",
          title: "wallet_connectors.uniswap.qr_code.step1.title"
        },
        {
          description: "wallet_connectors.uniswap.qr_code.step2.description",
          step: "create",
          title: "wallet_connectors.uniswap.qr_code.step2.title"
        },
        {
          description: "wallet_connectors.uniswap.qr_code.step3.description",
          step: "scan",
          title: "wallet_connectors.uniswap.qr_code.step3.title"
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
  uniswapWallet
};
