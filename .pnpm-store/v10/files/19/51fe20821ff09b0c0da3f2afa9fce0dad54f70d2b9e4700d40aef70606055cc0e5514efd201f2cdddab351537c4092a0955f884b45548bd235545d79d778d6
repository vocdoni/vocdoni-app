"use client";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";

// src/wallets/walletConnectors/bitskiWallet/bitskiWallet.ts
var bitskiWallet = () => ({
  id: "bitski",
  name: "Bitski",
  installed: hasInjectedProvider({ flag: "isBitski" }),
  iconUrl: async () => (await import("./bitskiWallet-4GG55SWQ.js")).default,
  iconBackground: "#fff",
  downloadUrls: {
    chrome: "https://chrome.google.com/webstore/detail/bitski/feejiigddaafeojfddjjlmfkabimkell",
    browserExtension: "https://bitski.com"
  },
  extension: {
    instructions: {
      learnMoreUrl: "https://bitski.zendesk.com/hc/articles/12803972818836-How-to-install-the-Bitski-browser-extension",
      steps: [
        {
          description: "wallet_connectors.bitski.extension.step1.description",
          step: "install",
          title: "wallet_connectors.bitski.extension.step1.title"
        },
        {
          description: "wallet_connectors.bitski.extension.step2.description",
          step: "create",
          title: "wallet_connectors.bitski.extension.step2.title"
        },
        {
          description: "wallet_connectors.bitski.extension.step3.description",
          step: "refresh",
          title: "wallet_connectors.bitski.extension.step3.title"
        }
      ]
    }
  },
  createConnector: getInjectedConnector({ flag: "isBitski" })
});

export {
  bitskiWallet
};
