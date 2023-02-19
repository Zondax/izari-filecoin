# Izari Filecoin Tools
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Package](https://badge.fury.io/js/%40zondax%2Fizari-filecoin-tools.svg)](https://badge.fury.io/js/%40zondax%2Fizari-filecoin-tools)
[![GithubActions](https://github.com/Zondax/izari-filecoin-tools/actions/workflows/main.yaml/badge.svg)](https://github.com/Zondax/izari-filecoin-tools/blob/master/.github/workflows/main.yaml)

## Short description
 - It is written in **Typescript**
 - It is transpiled to two different flavours: 
   - **CommonJS (es2015)** 
   - **ESM (esnext)**

## Requisites 

### React
- In order to use this package in browsers (like react, react-native, etc), some modules need to be polyfill (like Buffer, stream, etc). Most projects use
webpack to bundle JS code.  If your project uses it, please refer to [this](https://webpack.js.org/configuration/resolve/#resolvefallback) doc in order to configure it correctly. 
Besides, you could check [this blog post](https://viglucci.io/articles/how-to-polyfill-buffer-with-webpack-5) too. 

## Features

### Filecoin Node Comms
| Feature                  | Supported?         |
|--------------------------|--------------------|
| Get next nonce           | :white_check_mark: |
| Estimate fees for new tx | :white_check_mark: |
| Broadcast a new tx       | :white_check_mark: |
| Read tx state            | :white_check_mark: |


### Addresses
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

Finally, in order to run tests, just do it by simply running the next command. 
```yarn
yarn test
```

**Notes**
- Please, there are some env vars you need to set first in order to run the tests. Check it first. 

## Tests

So far, the package has been tested in different environments. We are trying to assure it works in as many platforms as we can. 

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
| Firefox         | :x:                |
| Safari          | :x:                |

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
to configure webpack to polyfill some NodeJS native modules. In particular, you can find the custom configs added [here](https://github.com/Zondax/izari-filecoin-tools/blob/791d58e06cb05b38cb7fe6f3532ca8e19b094c60/tests/package/react-app/config/webpack.config.js#L308)
and [here](https://github.com/Zondax/izari-filecoin-tools/blob/791d58e06cb05b38cb7fe6f3532ca8e19b094c60/tests/package/react-app/config/webpack.config.js#L693).


https://jestjs.io/docs/ecmascript-modules

