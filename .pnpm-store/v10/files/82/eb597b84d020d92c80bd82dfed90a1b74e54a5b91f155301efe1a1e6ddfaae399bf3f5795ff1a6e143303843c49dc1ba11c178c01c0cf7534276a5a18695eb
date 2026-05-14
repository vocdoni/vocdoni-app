"use client";
import {
  isAndroid
} from "./chunk-RETKWSKD.js";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/gateWallet/gateWallet.ts
var gateWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isGateInjected = hasInjectedProvider({ namespace: "gatewallet" });
  const shouldUseWalletConnect = !isGateInjected;
  return {
    id: "gate",
    name: "Gate Wallet",
    rdns: "io.gate.wallet",
    iconUrl: async () => (await import("./gateWallet-OZEAMFDV.js")).default,
    iconAccent: "#fff",
    iconBackground: "#fff",
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=com.gateio.gateio",
      ios: "https://apps.apple.com/us/app/gate-io-buy-bitcoin-crypto/id1294998195",
      mobile: "https://www.gate.io/mobileapp",
      qrCode: "https://www.gate.io/web3",
      chrome: "https://chromewebstore.google.com/detail/gate-wallet/cpmkedoipcpimgecpmgpldfpohjplkpp",
      browserExtension: "https://www.gate.io/web3"
    },
    mobile: {
      getUri: shouldUseWalletConnect ? (uri) => {
        return isAndroid() ? uri : `gtweb3wallet://wc?uri=${encodeURIComponent(uri)}`;
      } : void 0
    },
    qrCode: shouldUseWalletConnect ? {
      getUri: (uri) => uri,
      instructions: {
        learnMoreUrl: "https://www.gate.io/learn",
        steps: [
          {
            description: "wallet_connectors.gate.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.gate.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.gate.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.gate.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.gate.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.gate.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    extension: {
      instructions: {
        learnMoreUrl: "https://www.gate.io/learn",
        steps: [
          {
            description: "wallet_connectors.gate.extension.step1.description",
            step: "install",
            title: "wallet_connectors.gate.extension.step1.title"
          },
          {
            description: "wallet_connectors.gate.extension.step2.description",
            step: "create",
            title: "wallet_connectors.gate.extension.step2.title"
          },
          {
            description: "wallet_connectors.gate.extension.step3.description",
            step: "refresh",
            title: "wallet_connectors.gate.extension.step3.title"
          }
        ]
      }
    },
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : getInjectedConnector({ namespace: "gatewallet" })
  };
};

export {
  gateWallet
};
