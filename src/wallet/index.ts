import bip39 from 'bip39'
import * as bip32Default from 'bip32'
import * as ecc from 'tiny-secp256k1'

import { ExtendedKey } from './extendedkey.js'
import { getCoinTypeFromPath, tryToPrivateKeyBuffer } from './utils.js'

// You must wrap a tiny-secp256k1 compatible implementation
const bip32 = bip32Default.BIP32Factory(ecc)

export class Wallet {
  static keyDeriveFromSeed(seed: string | Buffer, path: string): ExtendedKey {
    if (typeof seed === 'string') seed = Buffer.from(seed, 'hex')

    const masterKey = bip32.fromSeed(seed)

    const childKey = masterKey.derivePath(path)

    if (!childKey.privateKey) throw new Error('privateKey not generated')

    const testnet = getCoinTypeFromPath(path) === '1'

    return new ExtendedKey(childKey.privateKey, testnet)
  }

  static keyDerive(mnemonic: string, path: string, password: string | undefined): ExtendedKey {
    if (password === undefined)
      throw new Error("'password' argument must be of type string or an instance of Buffer or ArrayBuffer. Received undefined")

    const seed = bip39.mnemonicToSeedSync(mnemonic, password)
    return Wallet.keyDeriveFromSeed(seed, path)
  }

  static keyRecover(privateKey: Buffer, testnet: boolean): ExtendedKey {
    privateKey = tryToPrivateKeyBuffer(privateKey)
    return new ExtendedKey(privateKey, testnet)
  }
}
