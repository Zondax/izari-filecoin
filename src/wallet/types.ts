import { AddressBls, AddressSecp256k1 } from '../address/index.js'

export type AccountData = AccountSecp256k1 | AccountBls

export type AccountSecp256k1 = {
  type: SignatureType.SECP256K1
  publicKey: Buffer
  privateKey: Buffer
  path?: string
  address: AddressSecp256k1
}

export type AccountBls = {
  type: SignatureType.BLS
  publicKey: Buffer
  privateKey: Buffer
  path?: string
  address: AddressBls
}

export type Signature = {
  Data: Buffer
  Type: SignatureType
}

export type SignatureJSON = {
  Data: string
  Type: SignatureType
}

export enum SignatureType {
  SECP256K1 = 1,
  BLS = 3,
}
