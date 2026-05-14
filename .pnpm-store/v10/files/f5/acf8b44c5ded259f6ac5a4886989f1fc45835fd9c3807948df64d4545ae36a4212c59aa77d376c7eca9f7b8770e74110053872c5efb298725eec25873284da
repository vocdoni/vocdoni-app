"use client";
import {
  isAndroid
} from "./chunk-RETKWSKD.js";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/frontierWallet/frontierWallet.ts
var frontierWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isFrontierInjected = hasInjectedProvider({
    namespace: "frontier.ethereum",
    flag: "isFrontier"
  });
  const shouldUseWalletConnect = !isFrontierInjected;
  return {
    id: "frontier",
    name: "Frontier Wallet",
    rdns: "xyz.frontier.wallet",
    installed: !shouldUseWalletConnect ? isFrontierInjected : void 0,
    iconUrl: async () => (await import("./frontierWallet-DDIDVVSH.js")).default,
    iconBackground: "#CC703C",
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=com.frontierwallet",
      ios: "https://apps.apple.com/us/app/frontier-crypto-defi-wallet/id1482380988",
      qrCode: "https://www.frontier.xyz/download",
      chrome: "https://chrome.google.com/webstore/detail/frontier-wallet/kppfdiipphfccemcignhifpjkapfbihd",
      browserExtension: "https://www.frontier.xyz/download"
    },
    mobile: {
      getUri: shouldUseWalletConnect ? (uri) => {
        return isAndroid() ? `frontier://wc?uri=${encodeURIComponent(uri)}` : uri;
      } : void 0
    },
    qrCode: shouldUseWalletConnect ? {
      getUri: (uri) => {
        return isAndroid() ? `frontier://wc?uri=${encodeURIComponent(uri)}` : uri;
      },
      instructions: {
        learnMoreUrl: "https://help.frontier.xyz/en/",
        steps: [
          {
            description: "wallet_connectors.im_token.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.im_token.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.im_token.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.im_token.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.im_token.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.im_token.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    extension: {
      instructions: {
        learnMoreUrl: "https://help.frontier.xyz/en/articles/6967236-setting-up-frontier-on-your-device",
        steps: [
          {
            description: "wallet_connectors.frontier.extension.step1.description",
            step: "install",
            title: "wallet_connectors.frontier.extension.step1.title"
          },
          {
            description: "wallet_connectors.frontier.extension.step2.description",
            step: "create",
            title: "wallet_connectors.frontier.extension.step2.title"
          },
          {
            description: "wallet_connectors.frontier.extension.step3.description",
            step: "refresh",
            title: "wallet_connectors.frontier.extension.step3.title"
          }
        ]
      }
    },
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({ projectId, walletConnectParameters }) : getInjectedConnector({
      namespace: "frontier.ethereum",
      flag: "isFrontier"
    })
  };
};

export {
  frontierWallet
};
