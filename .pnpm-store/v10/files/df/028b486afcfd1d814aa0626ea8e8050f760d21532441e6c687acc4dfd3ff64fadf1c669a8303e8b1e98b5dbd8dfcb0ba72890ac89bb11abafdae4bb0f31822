"use client";
import {
  isAndroid
} from "./chunk-RETKWSKD.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/omniWallet/omniWallet.ts
var omniWallet = ({
  projectId,
  walletConnectParameters
}) => ({
  id: "omni",
  name: "Omni",
  iconUrl: async () => (await import("./omniWallet-YCK6QV5V.js")).default,
  iconBackground: "#000",
  downloadUrls: {
    android: "https://play.google.com/store/apps/details?id=fi.steakwallet.app",
    ios: "https://itunes.apple.com/us/app/id1569375204",
    mobile: "https://omniwallet.app.link",
    qrCode: "https://omniwallet.app.link"
  },
  mobile: {
    getUri: (uri) => {
      return isAndroid() ? uri : `omni://wc?uri=${encodeURIComponent(uri)}`;
    }
  },
  qrCode: {
    getUri: (uri) => uri,
    instructions: {
      learnMoreUrl: "https://omni.app/support",
      steps: [
        {
          description: "wallet_connectors.omni.qr_code.step1.description",
          step: "install",
          title: "wallet_connectors.omni.qr_code.step1.title"
        },
        {
          description: "wallet_connectors.omni.qr_code.step2.description",
          step: "create",
          title: "wallet_connectors.omni.qr_code.step2.title"
        },
        {
          description: "wallet_connectors.omni.qr_code.step3.description",
          step: "scan",
          title: "wallet_connectors.omni.qr_code.step3.title"
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
  omniWallet
};
