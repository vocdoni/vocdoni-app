"use client";
import {
  isIOS
} from "./chunk-RETKWSKD.js";

// src/wallets/walletConnectors/coinbaseWallet/coinbaseWallet.ts
import { createConnector } from "wagmi";
import {
  coinbaseWallet as coinbaseConnector
} from "wagmi/connectors";
var coinbaseWallet = ({
  appName,
  appIcon
}) => {
  const { preference, ...optionalConfig } = coinbaseWallet;
  const getUri = (uri) => uri;
  const ios = isIOS();
  return {
    id: "coinbase",
    name: "Coinbase Wallet",
    shortName: "Coinbase",
    rdns: "com.coinbase.wallet",
    iconUrl: async () => (await import("./coinbaseWallet-OKXU3TRC.js")).default,
    iconAccent: "#2c5ff6",
    iconBackground: "#2c5ff6",
    // If the coinbase wallet browser extension is not installed, a popup will appear
    // prompting the user to connect or create a wallet via passkey. This means if you either have
    // or don't have the coinbase wallet browser extension installed it'll do some action anyways
    installed: true,
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=org.toshi",
      ios: "https://apps.apple.com/us/app/coinbase-wallet-store-crypto/id1278383455",
      mobile: "https://coinbase.com/wallet/downloads",
      qrCode: "https://coinbase-wallet.onelink.me/q5Sx/fdb9b250",
      chrome: "https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad",
      browserExtension: "https://coinbase.com/wallet"
    },
    ...ios ? {} : {
      qrCode: {
        getUri,
        instructions: {
          learnMoreUrl: "https://coinbase.com/wallet/articles/getting-started-mobile",
          steps: [
            {
              description: "wallet_connectors.coinbase.qr_code.step1.description",
              step: "install",
              title: "wallet_connectors.coinbase.qr_code.step1.title"
            },
            {
              description: "wallet_connectors.coinbase.qr_code.step2.description",
              step: "create",
              title: "wallet_connectors.coinbase.qr_code.step2.title"
            },
            {
              description: "wallet_connectors.coinbase.qr_code.step3.description",
              step: "scan",
              title: "wallet_connectors.coinbase.qr_code.step3.title"
            }
          ]
        }
      },
      extension: {
        instructions: {
          learnMoreUrl: "https://coinbase.com/wallet/articles/getting-started-extension",
          steps: [
            {
              description: "wallet_connectors.coinbase.extension.step1.description",
              step: "install",
              title: "wallet_connectors.coinbase.extension.step1.title"
            },
            {
              description: "wallet_connectors.coinbase.extension.step2.description",
              step: "create",
              title: "wallet_connectors.coinbase.extension.step2.title"
            },
            {
              description: "wallet_connectors.coinbase.extension.step3.description",
              step: "refresh",
              title: "wallet_connectors.coinbase.extension.step3.title"
            }
          ]
        }
      }
    },
    createConnector: (walletDetails) => {
      const preferenceConfig = typeof preference === "string" ? { options: preference, telemetry: false } : { options: "all", ...preference, telemetry: false };
      const connector = coinbaseConnector({
        appName,
        appLogoUrl: appIcon,
        ...optionalConfig,
        preference: preferenceConfig
      });
      return createConnector((config) => ({
        ...connector(config),
        ...walletDetails
      }));
    }
  };
};

export {
  coinbaseWallet
};
