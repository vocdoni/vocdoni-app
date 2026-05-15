<p align="center" width="100%">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://developer.vocdoni.io/img/vocdoni_logotype_full_blank.svg" />
      <source media="(prefers-color-scheme: light)" srcset="https://developer.vocdoni.io/img/vocdoni_logotype_full_white.svg" />
      <img alt="Star History Chart" src="https://developer.vocdoni.io/img/vocdoni_logotype_full_white.svg" />
  </picture>
</p>

<p align="center" width="100%">
    <a href="https://github.com/vocdoni/ui-components/commits/main/"><img src="https://img.shields.io/github/commit-activity/m/vocdoni/ui-components" /></a>
    <a href="https://github.com/vocdoni/ui-components/issues"><img src="https://img.shields.io/github/issues/vocdoni/ui-components" /></a>
    <a href="https://github.com/vocdoni/ui-components/actions/workflows/test.yml/"><img src="https://github.com/vocdoni/ui-components/actions/workflows/test.yml/badge.svg" /></a>
    <a href="https://discord.gg/xFTh8Np2ga"><img src="https://img.shields.io/badge/discord-join%20chat-blue.svg" /></a>
    <a href="https://twitter.com/vocdoni"><img src="https://img.shields.io/twitter/follow/vocdoni.svg?style=social&label=Follow" /></a>
</p>


  <div align="center">
    Vocdoni is the first universally verifiable, censorship-resistant, anonymous, and self-sovereign governance protocol. <br />
    Our main aim is a trustless voting system where anyone can speak their voice and where everything is auditable. <br />
    We are engineering building blocks for a permissionless, private and censorship resistant democracy.
    <br />
    <a href="https://developer.vocdoni.io/"><strong>Explore the developer portal »</strong></a>
    <br />
    <h3>More About Us</h3>
    <a href="https://vocdoni.io">Vocdoni Website</a>
    |
    <a href="https://vocdoni.app">Web Application</a>
    |
    <a href="https://explorer.vote/">Blockchain Explorer</a>
    |
    <a href="https://law.mit.edu/pub/remotevotingintheageofcryptography/release/1">MIT Law Publication</a>
    |
    <a href="https://chat.vocdoni.io">Contact Us</a>
    <br />
    <h3>Key Repositories</h3>
    <a href="https://github.com/vocdoni/vocdoni-node">Vocdoni Node</a>
    |
    <a href="https://github.com/vocdoni/vocdoni-sdk/">Vocdoni SDK</a>
    |
    <a href="https://github.com/vocdoni/ui-components">UI Components</a>
    |
    <a href="https://github.com/vocdoni/ui-scaffold">Application UI</a>
    |
    <a href="https://github.com/vocdoni/census3">Census3</a>
  </div>

# vocdoni/rainbowkit-wallets

This package includes rainbowkit wallets & wagmi connectors for easily extending web3 connectivity.

### Table of Contents
- [Getting Started](#getting-started)
- [Reference](#reference)
- [License](#license)

## Getting Started

You'll first need to have a project with Rainbowkit <= 0.12 installed and configured. Follow
their [official documentation](https://www.rainbowkit.com/docs/installation) in order to do so.

After that, you can add the required dependencies:

~~~bash
yarn add @vocdoni/rainbowkit-wallets
~~~


## Reference

Add the inputsWallet, oAuthWallet or privateKeyWallet connector to your wallet connectors list:

~~~tsx
import { inputsWallet } from "@vocdoni/rainbowkit-wallets";

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({ projectId, chains }),
      inputsWallet({ chains, name: "Your Preferred Name" }),
      oAuthWallet({
        chains,
        name: "OAuth",
        options: { oAuthServiceUrl: "http://oauth.vocdoni.io" },
      }),
       privateKeyWallet({
        id: 'pk',
        name: 'Private Key',
        chains,
      })
    ],
  },
]);
~~~

## License

This repository is licensed under the [GNU Affero General Public License v3.0.](./LICENSE)

    Vocdoni UI React Components
    Copyright (C) 2024 Vocdoni Association

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
