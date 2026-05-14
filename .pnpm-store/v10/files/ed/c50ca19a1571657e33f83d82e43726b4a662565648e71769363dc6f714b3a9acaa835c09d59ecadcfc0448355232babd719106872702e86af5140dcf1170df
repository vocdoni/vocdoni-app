"use client";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/foxWallet/foxWallet.ts
var foxWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isFoxInjected = hasInjectedProvider({
    namespace: "foxwallet.ethereum"
  });
  const shouldUseWalletConnect = !isFoxInjected;
  return {
    id: "foxwallet",
    name: "FoxWallet",
    iconUrl: async () => (await import("./foxWallet-WTBDNPXQ.js")).default,
    iconBackground: "#fff",
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=com.foxwallet.play",
      ios: "https://apps.apple.com/app/foxwallet-crypto-web3/id1590983231",
      qrCode: "https://foxwallet.com/download"
    },
    mobile: {
      getUri: shouldUseWalletConnect ? (uri) => {
        return `foxwallet://wc?uri=${encodeURIComponent(uri)}`;
      } : void 0
    },
    qrCode: shouldUseWalletConnect ? {
      getUri: (uri) => uri,
      instructions: {
        learnMoreUrl: "https://foxwallet.com",
        steps: [
          {
            description: "wallet_connectors.fox.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.fox.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.fox.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.fox.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.fox.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.fox.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : getInjectedConnector({ namespace: "foxwallet.ethereum" })
  };
};

export {
  foxWallet
};
