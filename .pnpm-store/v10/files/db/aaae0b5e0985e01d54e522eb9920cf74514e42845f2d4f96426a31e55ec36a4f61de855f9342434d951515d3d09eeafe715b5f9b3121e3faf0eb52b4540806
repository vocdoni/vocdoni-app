"use client";

// src/wallets/walletConnectors/portoWallet/portoWallet.ts
import { porto } from "wagmi/connectors";
import { createConnector } from "wagmi";
var portoWallet = (parameters) => {
  return {
    id: "porto",
    name: "Porto",
    shortName: "Porto",
    rdns: "xyz.ithaca.porto",
    iconUrl: async () => (await import("./portoWallet-4WTJNKDS.js")).default,
    iconAccent: "#2E7CF6",
    iconBackground: "#2E7CF6",
    installed: true,
    createConnector: (walletDetails) => createConnector((config) => ({
      ...porto(parameters)(config),
      ...walletDetails
    }))
  };
};

export {
  portoWallet
};
