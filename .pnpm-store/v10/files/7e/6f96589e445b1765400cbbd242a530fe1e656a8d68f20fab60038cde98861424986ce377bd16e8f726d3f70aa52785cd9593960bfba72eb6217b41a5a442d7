"use client";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/bybitWallet/bybitWallet.ts
var bybitWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isBybitInjected = hasInjectedProvider({
    namespace: "bybitWallet"
  });
  const shouldUseWalletConnect = !isBybitInjected;
  const getUri = (uri) => {
    return `bybitapp://open/route?targetUrl=by://web3/walletconnect/wc?uri=${encodeURIComponent(
      uri
    )}`;
  };
  return {
    id: "bybit",
    name: "Bybit Wallet",
    rdns: "com.bybit",
    iconUrl: async () => (await import("./bybitWallet-UHSPZQ56.js")).default,
    installed: !shouldUseWalletConnect ? isBybitInjected : void 0,
    iconBackground: "#000000",
    downloadUrls: {
      chrome: "https://chromewebstore.google.com/detail/bybit-wallet/pdliaogehgdbhbnmkklieghmmjkpigpa",
      browserExtension: "https://www.bybit.com/en/web3",
      android: "https://play.google.com/store/apps/details?id=com.bybit.app",
      ios: "https://apps.apple.com/us/app/bybit-buy-trade-crypto/id1488296980",
      mobile: "https://www.bybit.com/en/web3",
      qrCode: "https://www.bybit.com/en/web3"
    },
    mobile: {
      getUri: shouldUseWalletConnect ? getUri : void 0
    },
    qrCode: shouldUseWalletConnect ? {
      getUri: (uri) => uri,
      instructions: {
        learnMoreUrl: "https://www.bybit.com/en/web3",
        steps: [
          {
            description: "wallet_connectors.bybit.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.bybit.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.bybit.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.bybit.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.bybit.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.bybit.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    extension: {
      instructions: {
        learnMoreUrl: "https://www.bybit.com/en/web3",
        steps: [
          {
            description: "wallet_connectors.bybit.extension.step1.description",
            step: "install",
            title: "wallet_connectors.bybit.extension.step1.title"
          },
          {
            description: "wallet_connectors.bybit.extension.step2.description",
            step: "create",
            title: "wallet_connectors.bybit.extension.step2.title"
          },
          {
            description: "wallet_connectors.bybit.extension.step3.description",
            step: "refresh",
            title: "wallet_connectors.bybit.extension.step3.title"
          }
        ]
      }
    },
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : getInjectedConnector({
      namespace: "bybitWallet"
    })
  };
};

export {
  bybitWallet
};
