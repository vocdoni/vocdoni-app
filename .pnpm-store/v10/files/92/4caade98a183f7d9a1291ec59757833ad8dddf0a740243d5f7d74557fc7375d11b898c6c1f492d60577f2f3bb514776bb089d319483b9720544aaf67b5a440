"use client";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";

// src/wallets/walletConnectors/frameWallet/frameWallet.ts
var frameWallet = () => ({
  id: "frame",
  name: "Frame",
  rdns: "sh.frame",
  installed: hasInjectedProvider({ flag: "isFrame" }),
  iconUrl: async () => (await import("./frameWallet-HPFOBTAW.js")).default,
  iconBackground: "#121C20",
  downloadUrls: {
    browserExtension: "https://frame.sh/"
  },
  extension: {
    instructions: {
      learnMoreUrl: "https://docs.frame.sh/docs/Getting%20Started/Installation/",
      steps: [
        {
          description: "wallet_connectors.frame.extension.step1.description",
          step: "install",
          title: "wallet_connectors.frame.extension.step1.title"
        },
        {
          description: "wallet_connectors.frame.extension.step2.description",
          step: "create",
          title: "wallet_connectors.frame.extension.step2.title"
        },
        {
          description: "wallet_connectors.frame.extension.step3.description",
          step: "refresh",
          title: "wallet_connectors.frame.extension.step3.title"
        }
      ]
    }
  },
  createConnector: getInjectedConnector({ flag: "isFrame" })
});

export {
  frameWallet
};
