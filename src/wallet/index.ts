import * as bip39 from 'bip39'
import * as bip32Default from 'bip32'
import * as ecc from '@bitcoinerlab/secp256k1'
import secp256k1 from 'secp256k1'

import { getCoinTypeFromPath, getDigest, getPayloadSECP256K1, isSignatureType, tryToPrivateKeyBuffer } from './utils.js'
import { AccountData, NetworkPrefix, SignatureJSON, SignatureType } from '../artifacts/index.js'
import { AddressSecp256k1 } from '../address/index.js'
import { Transaction } from '../transaction/index.js'

// You must wrap a tiny-secp256k1 compatible implementation
const bip32_Secp256k1 = bip32Default.BIP32Factory(ecc)

export class Wallet {
  /**
   * Generate a new random mnemonic which will be used to derive new accounts in a hierarchical way
   * For more information about BIP39, please refer to this {@link https://en.bitcoin.it/wiki/BIP_0039|link}
   * @returns string containing 24 words
   */
  static generateMnemonic = (): string => bip39.generateMnemonic(256)

  /**
   * Convert a given mnemonic to a seed
   * @param mnemonic - input mnemonic
   * @param password - optional password
   * @returns a buffer containing the seed
   */
  static mnemonicToSeed = (mnemonic: string, password?: string): Buffer => bip39.mnemonicToSeedSync(mnemonic, password)

  /**
   * Derive a new account
   * @param mnemonic - mnemonic to derive account from
   * @param type - which type of account must be derived
   * @param path - derivation path
   * @param password - can be a blank string
   * @param networkPrefix - network the new address will belong to. If the network is undefined, it will be chosen based on the derivation path
   */
  static deriveAccount = (mnemonic: string, type: SignatureType, path: string, password?: string, networkPrefix?: NetworkPrefix): AccountData => {
    const seed = Wallet.mnemonicToSeed(mnemonic, password)
    return Wallet.deriveAccountFromSeed(seed, type, path, networkPrefix)
  }

  /**
   * Derive a new account
   * @param seed - seed to derive account from
   * @param type - which type of account must be derived
   * @param path - derivation path
   * @param networkPrefix - network the new address will belong to. If the network is undefined, it will be chosen based on the derivation path
   */
  static deriveAccountFromSeed = (seed: string | Buffer, type: SignatureType, path: string, networkPrefix?: NetworkPrefix): AccountData => {
    if (typeof seed === 'string') seed = Buffer.from(seed, 'hex')

    switch (type) {
      case SignatureType.SECP256K1: {
        const masterKey = bip32_Secp256k1.fromSeed(seed)
        const { privateKey } = masterKey.derivePath(path)

        if (!privateKey) throw new Error('privateKey not generated')

        if (!networkPrefix) networkPrefix = getCoinTypeFromPath(path) === '1' ? NetworkPrefix.Testnet : NetworkPrefix.Mainnet

        const { publicKey, address } = Wallet.getPublicSecp256k1FromPrivKey(networkPrefix, privateKey)

        return {
          type,
          privateKey,
          publicKey,
          address,
          path,
        }
      }

      default:
        throw new Error('not supported yet')
    }
  }

  /**
   * Try to recover account related data from raw private key
   * @param networkPrefix - network type this account belongs
   * @param type - which type of account must be derived
   * @param privateKey - private key raw data to recover account from
   * @param path - derivation path
   */
  static recoverAccount(networkPrefix: NetworkPrefix, type: SignatureType, privateKey: string | Buffer, path?: string): AccountData {
    switch (type) {
      case SignatureType.SECP256K1: {
        privateKey = tryToPrivateKeyBuffer(privateKey)
        const { publicKey, address } = Wallet.getPublicSecp256k1FromPrivKey(networkPrefix, privateKey)

        return {
          type,
          privateKey,
          address,
          publicKey,
          path,
        }
      }

      default:
        throw new Error('not supported yet')
    }
  }

  /**
   * Sign a transaction using account the private key
   * @param accountData - account data generated from deriving a new account
   * @param tx - transaction to sign
   * @returns generated signature
   */
  static signTransaction = async (accountData: Pick<AccountData, 'privateKey' | 'type'>, tx: Transaction): Promise<Signature> => {
    const serializedTx = await tx.serialize()
    const txDigest = getDigest(serializedTx)
    const { privateKey, type } = accountData

    switch (type) {
      case SignatureType.SECP256K1: {
        const signature = secp256k1.ecdsaSign(txDigest, privateKey)

        return new Signature(type, Buffer.concat([Buffer.from(signature.signature), Buffer.from([signature.recid])]))
      }

      default:
        throw new Error('not supported yet')
    }
  }

  /**
   * Verify whether a given signature is valid or not to a given transaction data
   * @param signature - signature to validate
   * @param tx - transaction data
   * @returns whether the signature is valid or not
   */
  static verifySignature = async (signature: Signature, tx: Transaction): Promise<boolean> => {
    const serializedTx = await tx.serialize()
    const txDigest = getDigest(serializedTx)

    switch (signature.getType()) {
      case SignatureType.SECP256K1: {
        const sigDat = signature.getData()
        const uncompressedPublicKey = secp256k1.ecdsaRecover(sigDat.slice(0, -1), sigDat[64], txDigest, false)
        const payload = getPayloadSECP256K1(uncompressedPublicKey)

        if (tx.from.getPayload().toString('hex') !== payload.toString('hex')) return false
        return secp256k1.ecdsaVerify(sigDat.slice(0, -1), txDigest, uncompressedPublicKey)
      }

      default:
        throw new Error('not supported yet')
    }
  }

  /**
   * Generate the public key based on an account private key
   * @param networkPrefix - network type this account belongs
   * @param privateKey - private key raw data to recover account from
   * @returns generated public key and new AddressSecp256k1 instance
   */
  protected static getPublicSecp256k1FromPrivKey = (
    networkPrefix: NetworkPrefix,
    privateKey: Buffer
  ): {
    publicKey: Buffer
    address: AddressSecp256k1
  } => {
    const pubKey = secp256k1.publicKeyCreate(privateKey)

    const uncompressedPublicKey = new Uint8Array(65)
    secp256k1.publicKeyConvert(pubKey, false, uncompressedPublicKey)
    const uncompressedPublicKeyBuf = Buffer.from(uncompressedPublicKey)

    const payload = getPayloadSECP256K1(uncompressedPublicKey)

    return {
      publicKey: uncompressedPublicKeyBuf,
      address: new AddressSecp256k1(networkPrefix, payload),
    }
  }
}

/**
 * Contains the data related to a transaction signature
 */
export class Signature {
  /**
   * Creates a new Signature instance based on a type and payload
   * @param type - signature type
   * @param data - signature payload
   */
  constructor(protected type: SignatureType, protected data: Buffer) {}

  /**
   * Create a new Signature instance from a raw JSON object
   * @param input - raw JSON input
   * @returns new Signature instance
   */
  fromJSON = (input: unknown): Signature => {
    if (typeof input !== 'object' || input === null) throw new Error('input should be an object')
    if (!('Type' in input) || typeof input.Type !== 'number' || isSignatureType(input.Type)) throw new Error("'Type' should be a number")
    if (!('Data' in input) || typeof input.Data !== 'string') throw new Error("'Data' should be a base64 encoded string")

    return new Signature(input.Type, Buffer.from(input.Data, 'base64'))
  }

  /**
   * Export a JSON object containing signature type and data (base64)
   * @returns signature JSON object
   */
  toJSON = (): SignatureJSON => ({ Type: this.type, Data: this.data.toString('base64') })

  /**
   * Getter to signature type
   */
  getType = (): SignatureType => this.type

  /**
   * Getter to signature payload
   */
  getData = (): Buffer => this.data

  /**
   * Whether the signature type is SECP256K1 or not
   */
  isSecp256k1 = (): boolean => this.type === SignatureType.SECP256K1

  /**
   * Whether the signature type is BLS or not
   */
  isBls = (): boolean => this.type === SignatureType.BLS
}
