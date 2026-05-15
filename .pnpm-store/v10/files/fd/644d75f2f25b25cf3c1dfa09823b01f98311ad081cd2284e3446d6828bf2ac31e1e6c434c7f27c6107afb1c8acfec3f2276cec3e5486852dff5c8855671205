"use client";

// src/wallets/walletConnectors/baseAccount/baseAccount.ts
import { createConnector } from "wagmi";
import {
  baseAccount as baseAccountConnector
} from "wagmi/connectors";
var baseAccount = ({
  appName,
  appIcon
}) => {
  const { preference, ...optionalConfig } = baseAccount;
  return {
    id: "baseAccount",
    name: "Base Account",
    shortName: "Base Account",
    rdns: "app.base.account",
    iconUrl: async () => (await import("./baseAccount-44UITRK7.js")).default,
    iconAccent: "#0000FF",
    iconBackground: "#0000FF",
    // a popup will appear prompting the user to connect or create a wallet via passkey.
    installed: true,
    createConnector: (walletDetails) => {
      const connector = baseAccountConnector({
        appName,
        appLogoUrl: appIcon,
        ...optionalConfig,
        preference: {
          telemetry: false,
          ...preference || {}
        }
      });
      return createConnector((config) => ({
        ...connector(config),
        ...walletDetails
      }));
    }
  };
};

export {
  baseAccount
};
