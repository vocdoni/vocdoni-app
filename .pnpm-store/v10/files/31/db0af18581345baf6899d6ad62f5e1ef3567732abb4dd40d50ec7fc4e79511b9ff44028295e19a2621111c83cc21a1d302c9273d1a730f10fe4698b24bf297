"use client";
import {
  isIOS
} from "./chunk-RETKWSKD.js";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";

// src/wallets/walletConnectors/dawnWallet/dawnWallet.ts
var dawnWallet = () => ({
  id: "dawn",
  name: "Dawn",
  iconUrl: async () => (await import("./dawnWallet-APT3XIRF.js")).default,
  iconBackground: "#000000",
  installed: hasInjectedProvider({ flag: "isDawn" }),
  hidden: () => !isIOS(),
  downloadUrls: {
    ios: "https://apps.apple.com/us/app/dawn-ethereum-wallet/id1673143782",
    mobile: "https://dawnwallet.xyz"
  },
  createConnector: getInjectedConnector({ flag: "isDawn" })
});

export {
  dawnWallet
};
