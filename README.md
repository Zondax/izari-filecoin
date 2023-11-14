# Izari Filecoin
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![node-current](https://img.shields.io/node/v/@zondax/izari-filecoin)
[![Package](https://badge.fury.io/js/%40zondax%2Fizari-filecoin.svg)](https://badge.fury.io/js/%40zondax%2Fizari-filecoin)


[![Calibration](https://github.com/Zondax/izari-filecoin/actions/workflows/calibration.yaml/badge.svg)](https://github.com/Zondax/izari-filecoin/actions/workflows/calibration.yaml)
[![Mainnet](https://github.com/Zondax/izari-filecoin/actions/workflows/mainnet.yaml/badge.svg)](https://github.com/Zondax/izari-filecoin/actions/workflows/mainnet.yaml)


---

![zondax_light](docs/assets/zondax_light.png#gh-light-mode-only)
![zondax_dark](docs/assets/zondax_dark.png#gh-dark-mode-only)

_Please visit our website at [zondax.ch](https://www.zondax.ch)_

---
## 🚫 PROJECT MAINTENANCE NOTICE 🚫

This package will continue to be actively maintained until **2023-12-31**. After this date, it will no longer receive updates or bug fixes. Users are encouraged to seek alternative solutions after this period and are welcome to fork the project for continued development.

--- 

## Introduction
Izari Filecoin is a comprehensive set of tools designed to interact with Blockchains. With its focus on compatibility, it provides developers with a versatile and flexible solution that can be used across a range of environments, 
from web projects using React to backend applications using NodeJS. It enables developers to easily manage and access blockchain data, including transactions, smart contracts, and assets.

Izari Filecoin makes it easy for developers to incorporate blockchain technology into their projects, unlocking new possibilities for innovation and growth.

Some key points: 
 - It is written in **Typescript**
 - It is composed by **pure JS**
 - It is tested on **many environments**
 - It is transpiled to two different flavours: 
   - **CommonJS (es2015)** 
   - **ESM (esnext)**

## Requisites 
- NodeJS >= 16.0.0
- Native BigInt support (or global polyfill)

**Notes**
- Izari-Filecoin is not using native BigInt implementation internally. However, some dependencies are, and that is why it is required. One of them is `cborg`, which is used by `@ipld/dag-cbor`.

### React
- In order to use this package in browsers (like react, react-native, etc), some modules need to be polyfill (like Buffer, stream, etc). Most projects use
webpack to bundle JS code.  If your project uses it, please refer to [this](https://webpack.js.org/configuration/resolve/#resolvefallback) doc in order to configure it correctly. 
Besides, you could check [this blog post](https://viglucci.io/articles/how-to-polyfill-buffer-with-webpack-5) too. 

## Features

### Node Comms

Allow you to communicate to the filecoin node in order to fetch on-chain data (miners, fees, nonce, etc), broadcast new transactions and more. 

| Feature                  | Supported?         |
|--------------------------|--------------------|
| Get next nonce           | :white_check_mark: |
| Estimate fees for new tx | :white_check_mark: |
| Broadcast a new tx       | :white_check_mark: |
| Read tx state            | :white_check_mark: |
| Wait for tx to appear    | :white_check_mark: |
| -                        | -                  |
| Get miners               | :white_check_mark: |
| Get miner info           | :white_check_mark: |
| Ask for storage to miner | :white_check_mark: |

### Addresses

Allow you to easily handle the entire set of filecoin address types available. You will be able to inspect how each address is composed, convert from 
string format to bytes format, parse from both formats, etc. For more information about filecoin addresses, please 
refer to [this doc](https://spec.filecoin.io/appendix/address/)

| Feature           | ID (f0)              | SECP256K1 (f1)         | Actor (f2)            | BLS (f3)             | Delegated (f4)     |
|-------------------|----------------------|------------------------|-----------------------|----------------------|--------------------|
| Parse from string | :white_check_mark:   | :white_check_mark:     | :white_check_mark:    | :white_check_mark:   | :white_check_mark: |
| Parse from bytes  | :white_check_mark:   | :white_check_mark:     | :white_check_mark:    | :white_check_mark:   | :white_check_mark: |
| Encode to bytes   | :white_check_mark:   | :white_check_mark:     | :white_check_mark:    | :white_check_mark:   | :white_check_mark: |
| Encode to string  | :white_check_mark:   | :white_check_mark:     | :white_check_mark:    | :white_check_mark:   | :white_check_mark: |
| Get payload       | :white_check_mark:   | :white_check_mark:     | :white_check_mark:    | :white_check_mark:   | :white_check_mark: |
| Get protocol      | :white_check_mark:   | :white_check_mark:     | :white_check_mark:    | :white_check_mark:   | :white_check_mark: |
| Get network type  | :white_check_mark:   | :white_check_mark:     | :white_check_mark:    | :white_check_mark:   | :white_check_mark: |
| Get namespace     | :heavy_minus_sign:   | :heavy_minus_sign:     | :heavy_minus_sign:    | :heavy_minus_sign:   | :white_check_mark: |
| Get sub address   | :heavy_minus_sign:   | :heavy_minus_sign:     | :heavy_minus_sign:    | :heavy_minus_sign:   | :white_check_mark: |

### Ethereum Addresses 
This is a particular case for a delegated address. Ethereum addresses on the Filecoin EVM are handled by the ethereum account manager, which actor id is 10. 
For this reason, there is a particular class to handle Ethereum addresses conversions. It will help you to get the filecoin equivalent address from an 
ethereum address, either string or bytes format. Besides, you can do the other way around: get the ethereum address from a filecoin one (f4/t4).


### Tokens

Allow you to easily manage denominations used within Filecoin to do conversions between them, arithmetical operations, etc.

| Feature                        | Denomination       |
|--------------------------------|--------------------|
| Parse from string              | :white_check_mark: |
| Deserialize from buffer        | :white_check_mark: |
| Serialize to buffer            | :white_check_mark: |
| Addition, subtraction, etc     | :white_check_mark: |
| Convert to other denominations | :white_check_mark: |
| Positive, negative, zero       | :white_check_mark: |

**All denominations supported: atto, femto, pico, nano, micro, milli and whole.**

### Transactions

In order to interact to the Filecoin network, transactions need to be sent to it. These features will allow you to create and manipulate them in an easy and
intuitive way. From creating new ones with minimum arguments or serializing them to CBOR or JSON, to fetch values from the network that they need in order to 
be valid to be sent. 

| Feature                              | Supported?         |
|--------------------------------------|--------------------|
| Create new instance                  | :white_check_mark: |
| Parse from raw json                  | :white_check_mark: |
| Parse from serialized                | :white_check_mark: |
| Export to json                       | :white_check_mark: |
| Serialize (to cbor)                  | :white_check_mark: |
| Prepare to send (get nonce and fees) | :white_check_mark: |

### Wallet

These features group actions related to wallets itself: from creating new ones, deriving addresses
from it, and signing new txs to be broadcast.

| Feature                  | f1/secp256k1       | f3/bls             |
|--------------------------|--------------------|--------------------|
| Generate new mnemonic    | :white_check_mark: | :white_check_mark: |
| Derive key from seed     | :white_check_mark: | :x:                |
| Derive key from mnemonic | :white_check_mark: | :x:                |
| Sign transactions        | :white_check_mark: | :x:                |
| Verify signatures        | :white_check_mark: | :x:                |

### Account

These features group actions related to high-level account features like send funds, fetch balances, etc.

| Feature               | Supported?          |
|-----------------------|---------------------|
| Send funds to address | :white_check_mark:  |
| Fetch current balance | :white_check_mark:  |


### Payment Channel [:link:](https://www.evernote.com/shard/s10/client/snv?noteGuid=135ecd3b-b743-4f6d-8943-e9c381fbf7df&noteKey=51f2120ace7d6ed6&sn=https%3A%2F%2Fwww.evernote.com%2Fshard%2Fs10%2Fsh%2F135ecd3b-b743-4f6d-8943-e9c381fbf7df%2F51f2120ace7d6ed6&title=Filecoin%2527s%2Bexisting%2Bpayment%2Bchannels%2B-%2BFilecoin%2BRetrieval%2BMarket%2B-%2BConfluence)

A payment channel on the Filecoin blockchain is a mechanism that allows two parties to transact with each other off-chain 
without requiring each transaction to be recorded on the blockchain. This feature allows users to handle the whole 
payment channel lifecycle: create, update, settle and collect. 

| Feature            | Supported?         |
|--------------------|--------------------|
| Create new channel | :white_check_mark: |
| Create new voucher | :x:                |
| Sign voucher       | :x:                |
| Update channel     | :x:                |
| Settle             | :white_check_mark: |
| Collect            | :white_check_mark: |

## Usage

### Install 

Just run the following command to add the package to your project

```yarn
yarn add @zondax/izari-filecoin
```
or 
```npm
npm install --save @zondax/izari-filecoin
```

### Use
The package can be imported easily on any place you need it. Choose the way to import it based on the loader module you use. 

For ESM modules
```typescript
import { Wallet, Transaction, Account } from "@zondax/izari-filecoin"
```

For CommonJS modules
```typescript
const { Wallet, Transaction, Account } = require("@zondax/izari-filecoin")
```

**Notes**

The `tests/jest` folder is a great place to understand more about each one of the available features, and have a sense on how to 
use them. Besides, if you are interested in one particular environment, like NodeJS or React, `tests/package` can have the answer 
you are looking for. Please, give them a chance! 

### Specific features
Inside this package there are several entry points grouped by features. If you only need to use specific features among all others, please choose the entry point you want to import from

| Entry point                          | Features                    | Project Folder           |
|--------------------------------------|-----------------------------|--------------------------|
| `@zondax/izari-filecoin`             | All features                | src/index.ts             | 
| `@zondax/izari-filecoin/rpc`         | Node Communications         | src/rpc/index.ts         | 
| `@zondax/izari-filecoin/address`     | Address                     | src/address/index.ts     | 
| `@zondax/izari-filecoin/transaction` | Transaction                 | src/transaction/index.ts | 
| `@zondax/izari-filecoin/wallet`      | Wallet                      | src/wallet/index.ts      | 
| `@zondax/izari-filecoin/account`     | Account                     | src/account/index.ts     | 
| `@zondax/izari-filecoin/artifacts`   | Types, constants and errors | src/artifacts/index.tx   |
| `@zondax/izari-filecoin/payment`     | Payment Channel             | src/payment/index.tx     |

**Note:** More information about these approach and its advantages can be found [here](https://webpack.js.org/guides/package-exports/) and [here](https://dev.to/binjospookie/exports-in-package-json-1fl2). 

#### Examples 
If I only need to convert some tokens between different denominations, both ways are valid.

Using the main entry point
```typescript
import { Token } from "@zondax/izari-filecoin"

const valueInFil = Token.fromAtto("10000000000000000")
```

Or just simply importing the token features
```typescript
import { Token } from "@zondax/izari-filecoin/token"

const valueInFil = Token.fromAtto("10000000000000000")
```

## Development
### Build
In order to install all required dependencies, just need to run the following command
```yarn
yarn install
```

Then, if you want to build the package, just need to run the following command. It will build both CJS and ESM flavours. 
```yarn
yarn build
```

### Testing 

The repo has established a set of rules to run ESLint in order to catch typos and possible bugs as soon as possible. 
```yarn
yarn lint
```

Besides the linter, a formatter is set in place to assure the same code style through our developers. 
```yarn
yarn format
```

Test cases generated automatically and are written in json files. Those files are consumed by jest to create on case for each scenario. In order to create those files
from a raw input file, just run the following command.
```yarn
yarn test:generate
```

Finally, in order to run tests, there are a variaty of commands you can run 
based on the scenario you want to check. Please, take a look at the following table. 

| Test                             | Link                     |
|----------------------------------|--------------------------|
| All                              | `yarn test`              |
| All / Silent                     | `yarn test:silent`       |
| Jest / All                       | `yarn test:jest`        |
| Jest / All / Silent              | `yarn test:jest:silent`  |
| Jest / Node NO Required          | `yarn test:logic`        |
| Jest / Node NO Required / Silent | `yarn test:logic:silent` |
| Jest / Node Required             | `yarn test:rpc`          |
| Jest / Node Required / Silent    | `yarn test:rpc:silent`   |
| NodeJS (CJS and ESM)             | `yarn test:node`         |
| NodeJS (CJS)                     | `yarn test:node:cjs`     |
| NodeJS (ESM)                     | `yarn test:node:esm`     |
| React                            | `yarn test:react`        |

### Notes

#### Silent mode
There are many test cases that are run on Jest. In order to make the output cleaner, silent mode uses a custom reporter [:link:](https://www.npmjs.com/package/jest-silent-reporter),
which silents results where the case passed.

#### Environmental vars
Please, there are some env vars you need to set first in order to run the tests: 
  - Some tests will try to connect to a node in order to run some transactions. Therefore, **a node rpc url and token will be required.**
  - Some of those transactions includes token transfers. For that reason, an account seed is required. We will derive some 
  accounts from it. **Those accounts must have some tokens in order to be able to test transfers.**

#### Faucets 

Here you can find faucets for each testnet you want to test the library on

| Network     | Link                                                               |
|-------------|--------------------------------------------------------------------|
| Devnet      | :x:                                                                |
| Butterfly   | :x:                                                                |
| Calibration | [:link:](https://faucet.triangleplatform.com/filecoin/calibration) |
| Mainnet     | :heavy_minus_sign:                                                 |


## Tests

So far, the package has been **tested in different environments and filecoin networks**. 
We are trying to assure it works in **as many platforms as we can**. Besides, in order to prove the package is fully functional 
on the current network version, **the CI is scheduled to run every day**. If something changes on the network, we will detect it 
right away.

### Networks
| Network     | Tested?             |
|-------------|---------------------|
| Devnet      | :x:                 |
| Butterfly   | :x:                 |
| Calibration | :white_check_mark:  |
| Mainnet     | :white_check_mark:  |

### Environments
| Environments             | Tested?            |
|--------------------------|--------------------|
| NodeJS (CommonJS)        | :white_check_mark: |
| NodeJS (ESM)             | :white_check_mark: |
| Integration tests (Jest) | :white_check_mark: |
| React app                | :white_check_mark: |
| NextJS                   | :x:                |

### Web Browsers
| Web browsers    | Tested?            |
|-----------------|--------------------|
| Chromium        | :white_check_mark: |
| Firefox         | :white_check_mark: |
| Safari          | :white_check_mark: |

### Notes

#### Jest
- It was necessary to load ESM support on jest in order to be able to load some modules that has no support to CJS anymore. In particular, `@ipld/dag-cbor` is the one 
that forced us to do it. It was done following the [jest documentation site](https://jestjs.io/docs/ecmascript-modules).
- According to the [ts-jest documentation site](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/tsconfig), we are using a custom `tsconfig.json` file.
- TypeScript allows importing other TypeScript files with a .js extension, for compatibility with the ES6 modules loader specification. Unfortunately, Jest gets confused by this and complains that it's not able to find the JavaScript file. 
`jest-ts-webcompat-resolver` is the actual resolver we use in order to be able to handle imports with extensions. More info [here](https://github.com/AyogoHealth/jest-ts-webcompat-resolver).
- In order to generate test cases for addresses features, we are using a glif package called `@glif/filecoin-address`. Besides, generating transaction test cases is done by using zondax package called `@zondax/filecoin-signing-tools`


#### React
- React app is based on create-react-app utility. It has been [ejected](https://create-react-app.dev/docs/available-scripts/#npm-run-eject) in order
to configure webpack to polyfill some NodeJS native modules. In particular, you can find the custom configs added [here](https://github.com/Zondax/izari-filecoin/blob/791d58e06cb05b38cb7fe6f3532ca8e19b094c60/tests/package/react-app/config/webpack.config.js#L308)
and [here](https://github.com/Zondax/izari-filecoin/blob/791d58e06cb05b38cb7fe6f3532ca8e19b094c60/tests/package/react-app/config/webpack.config.js#L693).


https://jestjs.io/docs/ecmascript-modules

