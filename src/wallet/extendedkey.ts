import secp256k1 from 'secp256k1'

import { getPayloadSECP256K1 } from './utils.js'
import { AddressSecp256k1 } from '../address/index.js'
import { Network } from '../address/constants.js'

export class ExtendedKey {
  publicKey: Buffer
  privateKey: Buffer
  address: string

  constructor(privateKey: Buffer, testnet: boolean) {
    const pubKey = secp256k1.publicKeyCreate(privateKey)

    const uncompressedPublicKey = new Uint8Array(65)
    secp256k1.publicKeyConvert(pubKey, false, uncompressedPublicKey)
    const uncompressedPublicKeyBuf = Buffer.from(uncompressedPublicKey)

    const network = testnet ? Network.Testnet : Network.Mainnet
    const payload = getPayloadSECP256K1(uncompressedPublicKey)

    this.publicKey = uncompressedPublicKeyBuf // Buffer
    this.privateKey = privateKey // Buffer
    this.address = new AddressSecp256k1(network, payload).toString() // String
  }

  get public_raw() {
    return new Uint8Array(this.publicKey)
  }

  get private_raw() {
    return new Uint8Array(this.privateKey)
  }

  get public_hexstring() {
    return this.publicKey.toString('hex')
  }

  get private_hexstring() {
    return this.privateKey.toString('hex')
  }

  get public_base64() {
    return this.publicKey.toString('base64')
  }

  get private_base64() {
    return this.privateKey.toString('base64')
  }
}
