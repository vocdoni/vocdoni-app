"use client";

// src/wallets/getWalletConnectConnector.ts
import { createConnector } from "wagmi";
import { walletConnect } from "wagmi/connectors";
var walletConnectInstances = /* @__PURE__ */ new Map();
var getOrCreateWalletConnectInstance = ({
  projectId,
  walletConnectParameters,
  rkDetailsShowQrModal,
  rkDetailsIsWalletConnectModalConnector
}) => {
  let config = {
    telemetryEnabled: false,
    // Disable analytics by default
    ...walletConnectParameters ? walletConnectParameters : {},
    projectId,
    showQrModal: false
    // Required. Otherwise WalletConnect modal (Web3Modal) will popup during time of connection for a wallet
  };
  if (rkDetailsShowQrModal) {
    config = { ...config, showQrModal: true };
  }
  if (!("customStoragePrefix" in config)) {
    config = {
      ...config,
      customStoragePrefix: rkDetailsIsWalletConnectModalConnector ? "clientOne" : "clientTwo"
    };
  }
  const serializedConfig = JSON.stringify(config);
  const sharedWalletConnector = walletConnectInstances.get(serializedConfig);
  if (sharedWalletConnector) {
    return sharedWalletConnector;
  }
  const newWalletConnectInstance = walletConnect(config);
  walletConnectInstances.set(serializedConfig, newWalletConnectInstance);
  return newWalletConnectInstance;
};
function createWalletConnectConnector({
  projectId,
  walletDetails,
  walletConnectParameters
}) {
  return createConnector((config) => ({
    ...getOrCreateWalletConnectInstance({
      projectId,
      walletConnectParameters,
      // Used in `connectorsForWallets` to add another
      // walletConnect wallet into rainbowkit with modal popup option
      rkDetailsShowQrModal: walletDetails.rkDetails.showQrModal,
      rkDetailsIsWalletConnectModalConnector: walletDetails.rkDetails.isWalletConnectModalConnector
    })(config),
    ...walletDetails
  }));
}
function getWalletConnectConnector({
  projectId,
  walletConnectParameters
}) {
  const exampleProjectId = "21fef48091f12692cad574a6f7753643";
  if (!projectId || projectId === "") {
    throw new Error(
      "No projectId found. Every dApp must now provide a WalletConnect Cloud projectId to enable WalletConnect v2 https://www.rainbowkit.com/docs/installation#configure"
    );
  }
  if (projectId === "YOUR_PROJECT_ID") {
    projectId = exampleProjectId;
  }
  return (walletDetails) => createWalletConnectConnector({
    projectId,
    walletDetails,
    walletConnectParameters
  });
}

export {
  getWalletConnectConnector
};
