"use client";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";

// src/utils/browsers.ts
function isSafari() {
  return typeof navigator !== "undefined" && typeof navigator.userAgent !== "undefined" && /Version\/([0-9._]+).*Safari/.test(navigator.userAgent);
}

// src/wallets/walletConnectors/tokenaryWallet/tokenaryWallet.ts
var tokenaryWallet = () => ({
  id: "tokenary",
  name: "Tokenary",
  iconUrl: async () => (await import("./tokenaryWallet-FHKZ7EWH.js")).default,
  iconBackground: "#ffffff",
  installed: hasInjectedProvider({ flag: "isTokenary" }),
  hidden: () => !isSafari(),
  downloadUrls: {
    ios: "https://tokenary.io/get",
    mobile: "https://tokenary.io",
    qrCode: "https://tokenary.io/get",
    safari: "https://tokenary.io/get",
    browserExtension: "https://tokenary.io/get"
  },
  createConnector: getInjectedConnector({ flag: "isTokenary" })
});

export {
  tokenaryWallet
};
