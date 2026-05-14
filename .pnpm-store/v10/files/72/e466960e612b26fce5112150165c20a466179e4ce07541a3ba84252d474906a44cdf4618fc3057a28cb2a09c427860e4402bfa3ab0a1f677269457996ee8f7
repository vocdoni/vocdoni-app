"use client";
import {
  isMobile
} from "./chunk-RETKWSKD.js";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/tokenPocketWallet/tokenPocketWallet.ts
var tokenPocketWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isTokenPocketInjected = hasInjectedProvider({ flag: "isTokenPocket" });
  const shouldUseWalletConnect = !isTokenPocketInjected;
  const getUri = (uri) => {
    return isMobile() ? `tpoutside://wc?uri=${encodeURIComponent(uri)}` : uri;
  };
  return {
    id: "tokenPocket",
    name: "TokenPocket",
    rdns: "pro.tokenpocket",
    iconUrl: async () => (await import("./tokenPocketWallet-U7KE4MQK.js")).default,
    iconBackground: "#2980FE",
    installed: !shouldUseWalletConnect ? isTokenPocketInjected : void 0,
    downloadUrls: {
      chrome: "https://chrome.google.com/webstore/detail/tokenpocket/mfgccjchihfkkindfppnaooecgfneiii",
      browserExtension: "https://extension.tokenpocket.pro/",
      android: "https://play.google.com/store/apps/details?id=vip.mytokenpocket",
      ios: "https://apps.apple.com/us/app/tp-global-wallet/id6444625622",
      qrCode: "https://tokenpocket.pro/en/download/app",
      mobile: "https://tokenpocket.pro/en/download/app"
    },
    mobile: {
      getUri: shouldUseWalletConnect ? getUri : void 0
    },
    qrCode: shouldUseWalletConnect ? {
      getUri,
      instructions: {
        learnMoreUrl: "https://help.tokenpocket.pro/en/",
        steps: [
          {
            description: "wallet_connectors.token_pocket.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.token_pocket.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.token_pocket.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.token_pocket.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.token_pocket.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.token_pocket.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    extension: {
      instructions: {
        learnMoreUrl: "https://help.tokenpocket.pro/en/extension-wallet/faq/installation-tutorial",
        steps: [
          {
            description: "wallet_connectors.token_pocket.extension.step1.description",
            step: "install",
            title: "wallet_connectors.token_pocket.extension.step1.title"
          },
          {
            description: "wallet_connectors.token_pocket.extension.step2.description",
            step: "create",
            title: "wallet_connectors.token_pocket.extension.step2.title"
          },
          {
            description: "wallet_connectors.token_pocket.extension.step3.description",
            step: "refresh",
            title: "wallet_connectors.token_pocket.extension.step3.title"
          }
        ]
      }
    },
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : getInjectedConnector({ flag: "isTokenPocket" })
  };
};

export {
  tokenPocketWallet
};
