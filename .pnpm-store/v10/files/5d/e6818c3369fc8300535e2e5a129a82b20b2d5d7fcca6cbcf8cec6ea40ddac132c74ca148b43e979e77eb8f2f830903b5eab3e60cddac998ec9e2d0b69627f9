"use client";

// src/wallets/walletConnectors/geminiWallet/geminiWallet.ts
import { createConnector } from "wagmi";
import { gemini } from "wagmi/connectors";
var geminiWallet = ({
  appName,
  appIcon
}) => {
  return {
    id: "gemini",
    name: "Gemini Wallet",
    shortName: "Gemini",
    rdns: "com.gemini.wallet",
    iconUrl: async () => (await import("./geminiWallet-5KOGV7HD.js")).default,
    iconAccent: "#1FC4DF",
    iconBackground: "#1FC4DF",
    installed: true,
    downloadUrls: {
      browserExtension: "https://keys.gemini.com",
      qrCode: "https://keys.gemini.com"
    },
    mobile: {
      getUri: (uri) => uri
    },
    qrCode: {
      getUri: (uri) => uri,
      instructions: {
        learnMoreUrl: "https://keys.gemini.com",
        steps: [
          {
            description: "wallet_connectors.gemini.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.gemini.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.gemini.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.gemini.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.gemini.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.gemini.qr_code.step3.title"
          }
        ]
      }
    },
    extension: {
      instructions: {
        learnMoreUrl: "https://keys.gemini.com",
        steps: [
          {
            description: "wallet_connectors.gemini.extension.step1.description",
            step: "install",
            title: "wallet_connectors.gemini.extension.step1.title"
          },
          {
            description: "wallet_connectors.gemini.extension.step2.description",
            step: "create",
            title: "wallet_connectors.gemini.extension.step2.title"
          },
          {
            description: "wallet_connectors.gemini.extension.step3.description",
            step: "refresh",
            title: "wallet_connectors.gemini.extension.step3.title"
          }
        ]
      }
    },
    createConnector: (walletDetails) => {
      const connector = gemini({
        appMetadata: {
          name: appName,
          icon: appIcon
        }
      });
      return createConnector((config) => ({
        ...connector(config),
        ...walletDetails
      }));
    }
  };
};

export {
  geminiWallet
};
