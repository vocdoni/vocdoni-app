"use client";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/walletConnectWallet/walletConnectWallet.ts
var walletConnectWallet = ({
  projectId,
  options
}) => {
  const getUri = (uri) => uri;
  return {
    id: "walletConnect",
    name: "WalletConnect",
    installed: void 0,
    iconUrl: async () => (await import("./walletConnectWallet-YHWKVTDY.js")).default,
    iconBackground: "#3b99fc",
    qrCode: { getUri },
    createConnector: getWalletConnectConnector({
      projectId,
      walletConnectParameters: options
    })
  };
};

export {
  walletConnectWallet
};
