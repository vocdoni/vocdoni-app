"use client";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";

// src/wallets/walletConnectors/nestWallet/nestWallet.ts
var nestWallet = () => ({
  id: "nest",
  name: "Nest",
  rdns: "xyz.nestwallet",
  iconUrl: async () => (await import("./nestWallet-GDWDVMGN.js")).default,
  iconBackground: "#fff0",
  installed: hasInjectedProvider({ flag: "isNestWallet" }),
  downloadUrls: {
    browserExtension: "https://nestwallet.xyz"
  },
  extension: {
    instructions: {
      learnMoreUrl: "https://nestwallet.xyz",
      steps: [
        {
          description: "wallet_connectors.nestwallet.extension.step1.description",
          step: "install",
          title: "wallet_connectors.nestwallet.extension.step1.title"
        },
        {
          description: "wallet_connectors.nestwallet.extension.step2.description",
          step: "create",
          title: "wallet_connectors.nestwallet.extension.step2.title"
        },
        {
          description: "wallet_connectors.nestwallet.extension.step3.description",
          step: "refresh",
          title: "wallet_connectors.nestwallet.extension.step3.title"
        }
      ]
    }
  },
  createConnector: getInjectedConnector({ flag: "isNestWallet" })
});

export {
  nestWallet
};
