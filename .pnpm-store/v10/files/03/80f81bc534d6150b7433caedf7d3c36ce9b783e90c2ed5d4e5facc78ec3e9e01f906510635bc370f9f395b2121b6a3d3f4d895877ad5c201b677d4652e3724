# DVote Protobuf

Protobuf definitions for messages and services used by the Vocdoni open stack.

Check out the source code generated for each of the available languages.

## Important note

- In protobuf, new fields can be added, renamed and removed with future-compatibility.
- However, **once an ID has been used, it can't never be reused by any other field again**

## Get started

In order to be able to build this project, you need some dependencies in your machine:

- [go](https://golang.org/doc/install) for the go bindings
- [dart](https://dart.dev/get-dart) for the dart bindings
- [npm & node](https://nodejs.org/en/download/) for the ts bindings
- build essentials like `make`

If `protoc` is installed in the host system, it will be used by default.
To force installing protoc, set PROTOC variable to blank: `PROTOC= make <action>`

To install `protoc` and the plugins for Dart, Go and TS:

```sh
$ make init
```

Or optionally:

```sh
$ make protoc/bin/protoc
$ make protoc-dart-plugin
$ make protoc-ts-plugin
$ make protoc-go-plugin
```

Then, run `make all` to build all the targets

## Available models

- `client-store`
  - Data types used for client apps to store local data
- `common`
  - Types shared across many components
- `metadata`
  - Human readable data for organizations, governance processes, news feeds, etc.
- `vochain`
  - Specific data types for the Vocdoni Vochain

## Build

+ Build DART models: `make dart`
+ Build JS/TS models: `make ts`
+ Build GoLang models: `make golang`

## Develop / Release

See [DEVELOPING.md]

## Artifacts

Import the files from:
- `build/dart/*`
- `go-vocdonitypes/*`

## Usage

### Typescript/Nodejs

You can either import things from the main package or from the individual exports

~~~js
const { Vochain } = require('@vocdoni/proto')
// this is the same as
const Vochain = require('@vocdoni/proto/vochain')
~~~

Using the individual exports is useful if you want to import only a specific part
and not the entire bundle. It's also less boilerplate, since you can directly access
the types without having to use the required namespace:

~~~js
import { TxType } from '@vocdoni/proto/vochain'
// this is the same as

import { Vochain } from '@vocdoni/proto'
const { TxType } = Vochain
~~~

> Note: required namespaces can be `Vochain`, `Metadata` and `ClientStore`.
> Named exports are dashed: `vochain`, `metadata` and `client-store`.

## License

This SDK is licensed under the [GNU Affero General Public License v3.0][license].

    Vocdoni Proto - Protobuf definitions for messages and services used by the
    Vocdoni open stack.
    Copyright (C) 2022 Vocdoni Roots MCU

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

[license]: ./LICENSE
[DEVELOPING.md]: ./DEVELOPING.md