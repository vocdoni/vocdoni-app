"use client";
import {
  isAndroid
} from "./chunk-RETKWSKD.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/readyWallet/readyWallet.ts
var readyWallet = ({
  projectId,
  walletConnectParameters
}) => ({
  id: "ready",
  name: "Ready",
  iconUrl: async () => (await import("./readyWallet-INGATTPN.js")).default,
  iconBackground: "#fff",
  downloadUrls: {
    android: "https://play.google.com/store/apps/details?id=im.argent.contractwalletclient",
    ios: "https://apps.apple.com/us/app/argent/id1358741926",
    mobile: "https://www.ready.co/app",
    qrCode: "https://www.ready.co/app"
  },
  mobile: {
    getUri: (uri) => {
      return isAndroid() ? uri : `argent://app/wc?uri=${encodeURIComponent(uri)}`;
    }
  },
  qrCode: {
    getUri: (uri) => uri,
    instructions: {
      learnMoreUrl: "https://www.ready.co/",
      steps: [
        {
          description: "wallet_connectors.ready.qr_code.step1.description",
          step: "install",
          title: "wallet_connectors.ready.qr_code.step1.title"
        },
        {
          description: "wallet_connectors.ready.qr_code.step2.description",
          step: "create",
          title: "wallet_connectors.ready.qr_code.step2.title"
        },
        {
          description: "wallet_connectors.ready.qr_code.step3.description",
          step: "scan",
          title: "wallet_connectors.ready.qr_code.step3.title"
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
  readyWallet
};
