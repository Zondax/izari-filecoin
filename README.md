# Izari Filecoin Tools
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Package](https://badge.fury.io/js/%40zondax%2Fizari-filecoin-tools.svg)](https://badge.fury.io/js/%40zondax%2Fizari-filecoin-tools)
[![GithubActions](https://github.com/Zondax/izari-filecoin-tools/actions/workflows/main.yaml/badge.svg)](https://github.com/Zondax/izari-filecoin-tools/blob/master/.github/workflows/main.yaml)

## Short description
 - It is written in **Typescript**
 - It is transpiled to two different flavours: 
   - **CommonJS (es2015)** 
   - **ESM (esnext)**

## Features

### Filecoin Node Comms
| Feature                  | Supported?         |
|--------------------------|--------------------|
| Get next nonce           | :white_check_mark: |
| Estimate fees for new tx | :white_check_mark: |
| Broadcast a new tx       | :white_check_mark: |
| Read tx state            | :white_check_mark: |


### ID Addresses (f0)
| Feature           | Supported?         |
|-------------------|--------------------|
| Parse from string | :white_check_mark: |
| Parse from bytes  | :white_check_mark: |
| Encode to bytes   | :white_check_mark: |
| Encode to string  | :white_check_mark: |

### SECP256K1 Addresses (f1)
| Feature           | Supported?         |
|-------------------|--------------------|
| Parse from string | :white_check_mark: |
| Parse from bytes  | :white_check_mark: |
| Encode to bytes   | :white_check_mark: |
| Encode to string  | :white_check_mark: |

### Actor Addresses (f2)
| Feature           | Supported?         |
|-------------------|--------------------|
| Parse from string | :white_check_mark: |
| Parse from bytes  | :white_check_mark: |
| Encode to bytes   | :white_check_mark: |
| Encode to string  | :white_check_mark: |

### BLS Addresses (f3)
| Feature           | Supported?         |
|-------------------|--------------------|
| Parse from string | :white_check_mark: |
| Parse from bytes  | :white_check_mark: |
| Encode to bytes   | :white_check_mark: |
| Encode to string  | :white_check_mark: |

### Delegated Addresses (f4)
| Feature           | Supported?         |
|-------------------|--------------------|
| Parse from string | :white_check_mark: |
| Parse from bytes  | :white_check_mark: |
| Encode to bytes   | :white_check_mark: |
| Encode to string  | :white_check_mark: |

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

Finally, in order to run tests, just do it by simply running the next command
```yarn
yarn test
```

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




