"use client";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/ZilPayWallet/zilPayWallet.ts
var zilPayWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isZilPayInjected = hasInjectedProvider({ flag: "isZilPay" });
  const shouldUseWalletConnect = !isZilPayInjected;
  return {
    id: "zilpay",
    name: "ZilPay",
    rdns: "io.zilpay",
    iconUrl: async () => (await import("./zilPayWallet-QHL2XHCV.js")).default,
    iconBackground: "#ffffff",
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=com.zilpaymobile",
      ios: "https://apps.apple.com/ru/app/zilpay/id1547105860",
      mobile: "https://zilpay.io/",
      qrCode: "https://zilpay.io/"
    },
    mobile: {
      getUri: shouldUseWalletConnect ? (uri) => {
        return `zilpay://wc?uri=${encodeURIComponent(uri)}`;
      } : void 0
    },
    qrCode: shouldUseWalletConnect ? {
      getUri: (uri) => uri,
      instructions: {
        learnMoreUrl: "https://zilpay.io",
        steps: [
          {
            description: "wallet_connectors.zilpay.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.zilpay.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.zilpay.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.zilpay.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.zilpay.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.zilpay.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : getInjectedConnector({
      flag: "isZilPay"
    })
  };
};

export {
  zilPayWallet
};
