"use client";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/bestWallet/bestWallet.ts
var bestWallet = ({
  projectId,
  walletConnectParameters
}) => ({
  id: "bestWallet",
  name: "Best Wallet",
  iconUrl: async () => (await import("./bestWallet-YV3FJ7MS.js")).default,
  iconBackground: "#5961FF",
  downloadUrls: {
    android: "https://best.sng.link/Dnio2/rto7?_smtype=3",
    ios: "https://best.sng.link/Dnio2/rto7?_smtype=3",
    mobile: "https://best.sng.link/Dnio2/rto7?_smtype=3",
    qrCode: "https://best.sng.link/Dnio2/rto7?_smtype=3"
  },
  mobile: {
    getUri: (uri) => {
      return `bw://connect/wc?uri=${encodeURIComponent(uri)}`;
    }
  },
  qrCode: {
    getUri: (uri) => uri,
    instructions: {
      learnMoreUrl: "https://best.sng.link/Dnio2/rto7?_smtype=3",
      steps: [
        {
          description: "wallet_connectors.best.qr_code.step1.description",
          step: "install",
          title: "wallet_connectors.best.qr_code.step1.title"
        },
        {
          description: "wallet_connectors.best.qr_code.step2.description",
          step: "create",
          title: "wallet_connectors.best.qr_code.step2.title"
        },
        {
          description: "wallet_connectors.best.qr_code.step3.description",
          step: "scan",
          title: "wallet_connectors.best.qr_code.step3.title"
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
  bestWallet
};
