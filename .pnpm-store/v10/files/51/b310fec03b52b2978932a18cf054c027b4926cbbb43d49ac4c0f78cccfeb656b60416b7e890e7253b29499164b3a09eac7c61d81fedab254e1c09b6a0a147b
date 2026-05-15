"use client";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/paraSwapWallet/paraswapWallet.ts
var paraSwapWallet = ({
  projectId,
  walletConnectParameters
}) => ({
  id: "paraswap",
  name: "ParaSwap Wallet",
  iconUrl: async () => (await import("./paraSwapWallet-BOGFGWWL.js")).default,
  iconBackground: "#578CFC",
  downloadUrls: {
    ios: "https://apps.apple.com/us/app/paraswap-multichain-wallet/id1584610690",
    mobile: "https://paraswap.io",
    qrCode: "https://paraswap.io"
  },
  mobile: {
    getUri: (uri) => {
      return `paraswap://wc?uri=${encodeURIComponent(uri)}`;
    }
  },
  qrCode: {
    getUri: (uri) => uri,
    instructions: {
      learnMoreUrl: "https://paraswap.io",
      steps: [
        {
          description: "wallet_connectors.paraswap.qr_code.step1.description",
          step: "install",
          title: "wallet_connectors.paraswap.qr_code.step1.title"
        },
        {
          description: "wallet_connectors.paraswap.qr_code.step2.description",
          step: "create",
          title: "wallet_connectors.paraswap.qr_code.step2.title"
        },
        {
          description: "wallet_connectors.paraswap.qr_code.step3.description",
          step: "scan",
          title: "wallet_connectors.paraswap.qr_code.step3.title"
        }
      ]
    }
  },
  createConnector: getWalletConnectConnector({
    projectId,
    walletConnectParameters
  })
});

export {
  paraSwapWallet
};
