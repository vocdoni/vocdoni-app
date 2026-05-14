"use client";
import {
  isIOS
} from "./chunk-RETKWSKD.js";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/xPortalWallet/xPortalWallet.ts
var xPortalWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isXPortalInjected = hasInjectedProvider({
    flag: "isxPortal"
  });
  const shouldUseWalletConnect = !isXPortalInjected;
  const getUri = (uri) => {
    return isIOS() ? `xportal://wc?uri=${encodeURIComponent(uri)}` : uri;
  };
  return {
    id: "xportal",
    name: "xPortal",
    rdns: "com.elrond.maiar.wallet",
    iconUrl: async () => (await import("./xPortalWallet-22MVKNGC.js")).default,
    iconAccent: "#23f7dd",
    iconBackground: "#23f7dd",
    installed: !shouldUseWalletConnect ? isXPortalInjected : void 0,
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=com.elrond.maiar.wallet",
      ios: "https://apps.apple.com/us/app/xportal-btc-crypto-wallet/id1519405832",
      qrCode: "https://xportal.com/app"
    },
    mobile: {
      getUri: shouldUseWalletConnect ? getUri : void 0
    },
    qrCode: shouldUseWalletConnect ? {
      getUri,
      instructions: {
        learnMoreUrl: "https://help.xportal.com/en/articles/7038000-register-create-account",
        steps: [
          {
            description: "wallet_connectors.xportal.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.xportal.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.xportal.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.xportal.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.xportal.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.xportal.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : getInjectedConnector({
      flag: "isxPortal"
    })
  };
};

export {
  xPortalWallet
};
