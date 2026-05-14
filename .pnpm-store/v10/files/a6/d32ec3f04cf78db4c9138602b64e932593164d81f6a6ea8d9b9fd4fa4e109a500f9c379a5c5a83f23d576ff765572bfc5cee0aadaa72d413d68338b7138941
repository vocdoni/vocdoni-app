"use client";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/bloomWallet/bloomWallet.ts
var bloomWallet = ({
  projectId,
  walletConnectParameters
}) => ({
  id: "bloom",
  name: "Bloom Wallet",
  iconBackground: "#000",
  iconAccent: "#000",
  iconUrl: async () => (await import("./bloomWallet-MPN76HHH.js")).default,
  downloadUrls: {
    desktop: "https://bloomwallet.io/"
  },
  desktop: {
    getUri: (uri) => `bloom://wallet-connect/wc?uri=${encodeURIComponent(uri)}`,
    instructions: {
      learnMoreUrl: "https://bloomwallet.io/",
      steps: [
        {
          description: "wallet_connectors.bloom.desktop.step1.description",
          step: "install",
          title: "wallet_connectors.bloom.desktop.step1.title"
        },
        {
          description: "wallet_connectors.bloom.desktop.step2.description",
          step: "create",
          title: "wallet_connectors.bloom.desktop.step2.title"
        },
        {
          description: "wallet_connectors.bloom.desktop.step3.description",
          step: "refresh",
          title: "wallet_connectors.bloom.desktop.step3.title"
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
  bloomWallet
};
