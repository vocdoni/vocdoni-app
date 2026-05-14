"use client";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";

// src/wallets/walletConnectors/seifWallet/seifWallet.ts
function seifWallet() {
  const injectedProvider = hasInjectedProvider({
    namespace: "__seif"
  });
  return {
    id: "seif",
    name: "Seif",
    installed: !!injectedProvider,
    iconUrl: async () => (await import("./seifWallet-XRBCFDYI.js")).default,
    iconBackground: "#fff",
    downloadUrls: {
      chrome: "https://chromewebstore.google.com/detail/seif/albakdmmdafeafbehmcpoejenbeojejl"
    },
    createConnector: getInjectedConnector({
      namespace: "__seif"
    }),
    rdns: "com.passkeywallet.seif"
  };
}

export {
  seifWallet
};
