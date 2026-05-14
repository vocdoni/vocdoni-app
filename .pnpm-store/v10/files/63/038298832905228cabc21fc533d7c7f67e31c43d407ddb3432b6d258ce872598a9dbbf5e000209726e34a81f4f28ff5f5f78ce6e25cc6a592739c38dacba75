"use client";
import {
  isAndroid
} from "./chunk-RETKWSKD.js";
import {
  getInjectedConnector
} from "./chunk-WXICAEA2.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/iopayWallet/iopayWallet.ts
function isIoPayMobile() {
  return typeof navigator !== "undefined" && typeof navigator.userAgent !== "undefined" && (navigator?.userAgent.includes("IoPayAndroid") || navigator?.userAgent.includes("IoPayiOs"));
}
var iopayWallet = ({
  projectId,
  walletConnectParameters
}) => ({
  id: "iopay",
  name: "ioPay Wallet",
  iconUrl: async () => (await import("./iopayWallet-C3FKJSQR.js")).default,
  iconBackground: "#fff",
  downloadUrls: {
    android: "https://play.google.com/store/apps/details?id=io.iotex.iopay.gp&pli=1",
    ios: "https://apps.apple.com/us/app/iopay-multichain-crypto-wallet/id1478086371",
    qrCode: "https://iopay.me/",
    browserExtension: "https://iopay.me/"
  },
  mobile: {
    getUri: (uri) => {
      return isAndroid() ? uri : `iopay://wc?uri=${encodeURIComponent(uri)}`;
    }
  },
  qrCode: {
    getUri: (uri) => uri,
    instructions: {
      learnMoreUrl: "https://iopay.me/",
      steps: [
        {
          description: "wallet_connectors.iopay.qr_code.step1.description",
          step: "install",
          title: "wallet_connectors.iopay.qr_code.step1.title"
        },
        {
          description: "wallet_connectors.iopay.qr_code.step2.description",
          step: "create",
          title: "wallet_connectors.iopay.qr_code.step2.title"
        },
        {
          description: "wallet_connectors.iopay.qr_code.step3.description",
          step: "scan",
          title: "wallet_connectors.iopay.qr_code.step3.title"
        }
      ]
    }
  },
  createConnector: isIoPayMobile() ? getInjectedConnector({}) : getWalletConnectConnector({
    projectId,
    walletConnectParameters
  })
});

export {
  iopayWallet
};
