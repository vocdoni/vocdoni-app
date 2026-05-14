"use client";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/roninWallet/roninWallet.ts
var roninWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isRoninInjected = hasInjectedProvider({
    namespace: "ronin.provider"
  });
  const shouldUseWalletConnect = !isRoninInjected;
  const getUri = (uri) => {
    return `roninwallet://wc?uri=${encodeURIComponent(uri)}`;
  };
  return {
    id: "ronin",
    name: "Ronin Wallet",
    iconUrl: async () => (await import("./roninWallet-WPRP36LJ.js")).default,
    iconBackground: "#ffffff",
    rdns: "com.roninchain.wallet",
    installed: isRoninInjected || void 0,
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=com.skymavis.genesis",
      ios: "https://apps.apple.com/us/app/ronin-wallet/id1592675001",
      mobile: "https://wallet.roninchain.com",
      chrome: "https://chrome.google.com/webstore/detail/ronin-wallet/fnjhmkhhmkbjkkabndcnnogagogbneec",
      edge: "https://microsoftedge.microsoft.com/addons/detail/ronin-wallet/kjmoohlgokccodicjjfebfomlbljgfhk",
      firefox: "https://addons.mozilla.org/firefox/addon/ronin-wallet",
      browserExtension: "https://wallet.roninchain.com/",
      qrCode: "https://wallet.roninchain.com/"
    },
    mobile: {
      getUri: shouldUseWalletConnect ? getUri : void 0
    },
    qrCode: shouldUseWalletConnect ? {
      getUri: (uri) => uri,
      instructions: {
        learnMoreUrl: "https://wallet.roninchain.com/",
        steps: [
          {
            description: "wallet_connectors.ronin.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.ronin.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.ronin.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.ronin.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.ronin.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.ronin.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    extension: {
      instructions: {
        learnMoreUrl: "https://wallet.roninchain.com/",
        steps: [
          {
            description: "wallet_connectors.ronin.extension.step1.description",
            step: "install",
            title: "wallet_connectors.ronin.extension.step1.title"
          },
          {
            description: "wallet_connectors.ronin.extension.step2.description",
            step: "create",
            title: "wallet_connectors.ronin.extension.step2.title"
          },
          {
            description: "wallet_connectors.ronin.extension.step3.description",
            step: "refresh",
            title: "wallet_connectors.ronin.extension.step3.title"
          }
        ]
      }
    },
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : getInjectedConnector({ namespace: "ronin.provider" })
  };
};

export {
  roninWallet
};
