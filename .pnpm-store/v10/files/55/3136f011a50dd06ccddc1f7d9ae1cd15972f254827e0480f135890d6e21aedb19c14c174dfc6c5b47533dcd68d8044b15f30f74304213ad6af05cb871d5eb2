"use client";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/krakenWallet/krakenWallet.ts
var krakenWallet = ({
  projectId,
  walletConnectParameters
}) => ({
  id: "kraken",
  name: "Kraken Wallet",
  iconUrl: async () => (await import("./krakenWallet-J63GG4YB.js")).default,
  iconBackground: "#FFD8EA",
  downloadUrls: {
    ios: "https://apps.apple.com/us/app/kraken-wallet/id1626327149",
    mobile: "https://kraken.com/wallet",
    qrCode: "https://kraken.com/wallet"
  },
  mobile: {
    getUri: (uri) => {
      return `krakenwallet://wc?uri=${encodeURIComponent(uri)}`;
    }
  },
  qrCode: {
    getUri: (uri) => uri,
    instructions: {
      learnMoreUrl: "https://kraken.com/wallet",
      steps: [
        {
          description: "wallet_connectors.kraken.qr_code.step1.description",
          step: "install",
          title: "wallet_connectors.kraken.qr_code.step1.title"
        },
        {
          description: "wallet_connectors.kraken.qr_code.step2.description",
          step: "create",
          title: "wallet_connectors.kraken.qr_code.step2.title"
        },
        {
          description: "wallet_connectors.kraken.qr_code.step3.description",
          step: "scan",
          title: "wallet_connectors.kraken.qr_code.step3.title"
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
  krakenWallet
};
