import * as bip39 from 'bip39'
import * as bip32Default from 'bip32'
import * as ecc from '@bitcoinerlab/secp256k1'

import { ExtendedKey } from './extendedkey.js'
import { getCoinTypeFromPath, tryToPrivateKeyBuffer } from './utils.js'

// You must wrap a tiny-secp256k1 compatible implementation
const bip32 = bip32Default.BIP32Factory(ecc)

export class Wallet {
  static generateMnemonic(): string {
    // 256 so it generate 24 words
    return bip39.generateMnemonic(256)
  }

  static keyDeriveFromSeed(seed: string | Buffer, path: string): ExtendedKey {
    if (typeof seed === 'string') seed = Buffer.from(seed, 'hex')

    const masterKey = bip32.fromSeed(seed)

    const childKey = masterKey.derivePath(path)

    if (!childKey.privateKey) throw new Error('privateKey not generated')

    const testnet = getCoinTypeFromPath(path) === '1'

    return new ExtendedKey(childKey.privateKey, testnet)
  }

  static keyDerive(mnemonic: string, path: string, password?: string): ExtendedKey {
    const seed = bip39.mnemonicToSeedSync(mnemonic, password)
    return Wallet.keyDeriveFromSeed(seed, path)
  }

  static keyRecover(privateKey: string | Buffer, testnet: boolean): ExtendedKey {
    privateKey = tryToPrivateKeyBuffer(privateKey)
    return new ExtendedKey(privateKey, testnet)
  }
}
