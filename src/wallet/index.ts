import * as bip39 from 'bip39'
import * as bip32Default from 'bip32'
import * as ecc from '@bitcoinerlab/secp256k1'
import secp256k1 from 'secp256k1'

import { getCoinTypeFromPath, getDigest, getPayloadSECP256K1, isSignatureType, tryToPrivateKeyBuffer } from './utils.js'
import { AccountData, Network, SignatureType } from '../artifacts/index.js'
import { AddressSecp256k1 } from '../address/index.js'
import { Transaction } from '../transaction/index.js'

// You must wrap a tiny-secp256k1 compatible implementation
const bip32_Secp256k1 = bip32Default.BIP32Factory(ecc)

export class Wallet {
  static generateMnemonic = (): string => bip39.generateMnemonic(256)

  static mnemonicToSeed = (mnemonic: string, password?: string) => bip39.mnemonicToSeedSync(mnemonic, password)

  static deriveAccount = (mnemonic: string, type: SignatureType, path: string, password?: string): AccountData => {
    const seed = Wallet.mnemonicToSeed(mnemonic, password)
    return Wallet.deriveAccountFromSeed(seed, type, path)
  }

  static deriveAccountFromSeed = (seed: string | Buffer, type: SignatureType, path: string): AccountData => {
    if (typeof seed === 'string') seed = Buffer.from(seed, 'hex')

    switch (type) {
      case SignatureType.SECP256K1: {
        const masterKey = bip32_Secp256k1.fromSeed(seed)
        const { privateKey } = masterKey.derivePath(path)

        if (!privateKey) throw new Error('privateKey not generated')

        const network = getCoinTypeFromPath(path) === '1' ? Network.Testnet : Network.Mainnet

        const { publicKey, address } = Wallet.getPublicSecp256k1FromPrivKey(network, privateKey)

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

  static recoverAccount(network: Network, type: SignatureType, privateKey: string | Buffer, path?: string): AccountData {
    switch (type) {
      case SignatureType.SECP256K1: {
        privateKey = tryToPrivateKeyBuffer(privateKey)
        const { publicKey, address } = Wallet.getPublicSecp256k1FromPrivKey(network, privateKey)

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

  protected static getPublicSecp256k1FromPrivKey = (network: Network, privateKey: Buffer) => {
    const pubKey = secp256k1.publicKeyCreate(privateKey)

    const uncompressedPublicKey = new Uint8Array(65)
    secp256k1.publicKeyConvert(pubKey, false, uncompressedPublicKey)
    const uncompressedPublicKeyBuf = Buffer.from(uncompressedPublicKey)

    const payload = getPayloadSECP256K1(uncompressedPublicKey)

    return {
      publicKey: uncompressedPublicKeyBuf,
      address: new AddressSecp256k1(network, payload),
    }
  }
}

export class Signature {
  constructor(protected type: SignatureType, protected data: Buffer) {}

  fromJSON = (input: unknown): Signature => {
    if (typeof input !== 'object' || input === null) throw new Error('input should be an object')
    if (!('Type' in input) || typeof input.Type !== 'number' || isSignatureType(input.Type)) throw new Error("'Type' should be a number")
    if (!('Data' in input) || typeof input.Data !== 'string') throw new Error("'Data' should be a base64 encoded string")

    return new Signature(input.Type, Buffer.from(input.Data, 'base64'))
  }

  toJSON = () => ({ Type: this.type, Data: this.data.toString('base64') })

  getType = () => this.type
  getData = () => this.data

  isSecp256k1 = () => this.type === SignatureType.SECP256K1
  isBls = () => this.type === SignatureType.BLS
}
