"use client";
import {
  isAndroid
} from "./chunk-RETKWSKD.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/valoraWallet/valoraWallet.ts
var valoraWallet = ({
  projectId,
  walletConnectParameters
}) => ({
  id: "valora",
  name: "Valora",
  iconUrl: async () => (await import("./valoraWallet-EZ7AFD7R.js")).default,
  iconBackground: "#FFFFFF",
  downloadUrls: {
    ios: "https://apps.apple.com/app/id1520414263?mt=8",
    android: "https://play.google.com/store/apps/details?id=co.clabs.valora",
    mobile: "https://valora.xyz",
    qrCode: "https://valora.xyz"
  },
  mobile: {
    getUri: (uri) => isAndroid() ? uri : `celo://wallet/wc?uri=${encodeURIComponent(uri)}`
  },
  qrCode: {
    getUri: (uri) => uri,
    instructions: {
      learnMoreUrl: "https://valora.xyz/",
      steps: [
        {
          description: "wallet_connectors.valora.qr_code.step1.description",
          step: "install",
          title: "wallet_connectors.valora.qr_code.step1.title"
        },
        {
          description: "wallet_connectors.valora.qr_code.step2.description",
          step: "create",
          title: "wallet_connectors.valora.qr_code.step2.title"
        },
        {
          description: "wallet_connectors.valora.qr_code.step3.description",
          step: "scan",
          title: "wallet_connectors.valora.qr_code.step3.title"
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
  valoraWallet
};
