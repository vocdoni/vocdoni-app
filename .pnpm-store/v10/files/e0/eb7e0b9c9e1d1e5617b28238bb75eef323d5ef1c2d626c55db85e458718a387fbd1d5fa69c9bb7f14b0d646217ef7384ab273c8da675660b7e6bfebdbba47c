"use client";
import {
  getInjectedConnector
} from "./chunk-WXICAEA2.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/novaWallet/novaWallet.ts
function isNovaWallet(ethereum) {
  if (ethereum?.isNovaWallet) return true;
  return false;
}
var novaWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isNovaWalletInjected = typeof window !== "undefined" ? isNovaWallet(window.ethereum) : false;
  const shouldUseWalletConnect = !isNovaWalletInjected;
  const getUriMobile = (uri) => {
    return `novawallet://wc?uri=${encodeURIComponent(uri)}`;
  };
  const mobileConnector = {
    getUri: shouldUseWalletConnect ? getUriMobile : void 0
  };
  return {
    id: "nova",
    name: "Nova Wallet",
    rdns: "io.novawallet",
    iconUrl: async () => (await import("./novaWallet-3MHM27EO.js")).default,
    iconBackground: "#fff",
    installed: isNovaWalletInjected || void 0,
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=io.novafoundation.nova.market",
      ios: "https://apps.apple.com/us/app/nova-polkadot-wallet/id1597119355",
      mobile: "https://nova-wallet.app.link",
      qrCode: "https://nova-wallet.app.link"
    },
    qrCode: shouldUseWalletConnect ? {
      getUri: (uri) => uri,
      instructions: {
        learnMoreUrl: "https://docs.novawallet.io/nova-wallet-wiki/dapps/using-walletconnect-for-dapps",
        steps: [
          {
            description: "wallet_connectors.nova.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.nova.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.nova.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.nova.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.nova.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.nova.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    mobile: mobileConnector,
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : getInjectedConnector({
      namespace: "ethereum"
    })
  };
};

export {
  novaWallet
};
