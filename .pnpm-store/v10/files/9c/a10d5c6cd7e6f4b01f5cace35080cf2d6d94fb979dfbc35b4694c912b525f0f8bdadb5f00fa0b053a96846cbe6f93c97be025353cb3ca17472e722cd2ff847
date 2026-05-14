"use client";
import {
  isMobile
} from "./chunk-RETKWSKD.js";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";
import {
  getWalletConnectConnector
} from "./chunk-HBTZEKGP.js";

// src/wallets/walletConnectors/trustWallet/trustWallet.ts
var trustWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isTrustWalletInjected = isMobile() ? hasInjectedProvider({ flag: "isTrust" }) : hasInjectedProvider({ flag: "isTrustWallet" });
  const shouldUseWalletConnect = !isTrustWalletInjected;
  const getUriMobile = (uri) => {
    return `trust://wc?uri=${encodeURIComponent(uri)}`;
  };
  const getUriQR = (uri) => {
    return uri;
  };
  const mobileConnector = {
    getUri: shouldUseWalletConnect ? getUriMobile : void 0
  };
  let qrConnector = void 0;
  if (shouldUseWalletConnect) {
    qrConnector = {
      getUri: getUriQR,
      instructions: {
        learnMoreUrl: "https://trustwallet.com/",
        steps: [
          {
            description: "wallet_connectors.trust.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.trust.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.trust.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.trust.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.trust.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.trust.qr_code.step3.title"
          }
        ]
      }
    };
  }
  const extensionConnector = {
    instructions: {
      learnMoreUrl: "https://trustwallet.com/browser-extension",
      steps: [
        {
          description: "wallet_connectors.trust.extension.step1.description",
          step: "install",
          title: "wallet_connectors.trust.extension.step1.title"
        },
        {
          description: "wallet_connectors.trust.extension.step2.description",
          step: "create",
          title: "wallet_connectors.trust.extension.step2.title"
        },
        {
          description: "wallet_connectors.trust.extension.step3.description",
          step: "refresh",
          title: "wallet_connectors.trust.extension.step3.title"
        }
      ]
    }
  };
  return {
    id: "trust",
    name: "Trust Wallet",
    rdns: "com.trustwallet.app",
    iconUrl: async () => (await import("./trustWallet-42DZQQWY.js")).default,
    // Note that we never resolve `installed` to `false` because the
    // Trust Wallet provider falls back to other connection methods if
    // the injected connector isn't available
    installed: isTrustWalletInjected || void 0,
    iconAccent: "#3375BB",
    iconBackground: "#fff",
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp",
      ios: "https://apps.apple.com/us/app/trust-crypto-bitcoin-wallet/id1288339409",
      mobile: "https://trustwallet.com/download",
      qrCode: "https://trustwallet.com/download",
      chrome: "https://chrome.google.com/webstore/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph",
      browserExtension: "https://trustwallet.com/browser-extension"
    },
    mobile: mobileConnector,
    qrCode: qrConnector,
    extension: extensionConnector,
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : isMobile() ? getInjectedConnector({ flag: "isTrust" }) : getInjectedConnector({ flag: "isTrustWallet" })
  };
};

export {
  trustWallet
};
