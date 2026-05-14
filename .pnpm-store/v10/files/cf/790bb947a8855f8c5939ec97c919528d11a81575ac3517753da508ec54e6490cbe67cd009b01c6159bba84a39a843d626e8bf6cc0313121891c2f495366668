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

// src/wallets/walletConnectors/binanceWallet/binanceWallet.ts
var binanceWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isBinanceInjected = hasInjectedProvider({
    namespace: "binancew3w.isExtension",
    flag: "isBinance"
  });
  const shouldUseWalletConnect = !isBinanceInjected;
  return {
    id: "binance",
    name: "Binance Wallet",
    rdns: "com.binance.wallet",
    iconUrl: async () => (await import("./binanceWallet-RCEFB436.js")).default,
    iconBackground: "#000000",
    installed: !shouldUseWalletConnect ? isBinanceInjected : void 0,
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=com.binance.dev",
      ios: "https://apps.apple.com/us/app/id1436799971",
      mobile: "https://www.binance.com/en/download",
      qrCode: "https://www.binance.com/en/web3wallet",
      chrome: "https://chromewebstore.google.com/detail/cadiboklkpojfamcoggejbbdjcoiljjk"
    },
    mobile: shouldUseWalletConnect ? {
      getUri: (uri) => {
        return isAndroid() ? uri : `bnc://app.binance.com/cedefi/wc?uri=${encodeURIComponent(
          uri
        )}`;
      }
    } : void 0,
    qrCode: shouldUseWalletConnect ? {
      getUri: (uri) => uri,
      instructions: {
        learnMoreUrl: "https://www.binance.com/en/web3wallet",
        steps: [
          {
            description: "wallet_connectors.binance.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.binance.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.binance.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.binance.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.binance.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.binance.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : getInjectedConnector({
      flag: "isBinance"
    })
  };
};

export {
  binanceWallet
};
