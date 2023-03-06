import { AddressBls, AddressSecp256k1 } from '../address/index.js'

/**
 * Contains all the data related to a specific filecoin account derived from a seed phrase
 */
export type AccountData = AccountSecp256k1 | AccountBls

/**
 * Contains all the data related to a specific filecoin secp256k1 (f1/t1) account derived from a seed phrase
 */
export type AccountSecp256k1 = {
  type: SignatureType.SECP256K1
  publicKey: Buffer
  privateKey: Buffer
  path?: string
  address: AddressSecp256k1
}

/**
 * Contains all the data related to a specific filecoin bls (f3/t3) account derived from a seed phrase
 */
export type AccountBls = {
  type: SignatureType.BLS
  publicKey: Buffer
  privateKey: Buffer
  path?: string
  address: AddressBls
}

/**
 * Raw version of a transaction signature. It is used when you need to broadcast a signed transaction.
 */
export type SignatureJSON = {
  Data: string
  Type: SignatureType
}

/**
 * Enumerates the possible signature types filecoin network has to sign transactions
 * For more information about secp256k1 signature scheme, please refer to this {@link https://en.bitcoin.it/wiki/Secp256k1|link}.
 * For more information about bls signature scheme, please refer to this {@link https://en.wikipedia.org/wiki/BLS_digital_signature|link}.
 */
export enum SignatureType {
  SECP256K1 = 1,
  BLS = 3,
}
