import BN from 'bn.js'

/**
 * Well-known address manager in the filecoin network. An address manager is an actor that can create new actors and assign a f4 address to the new actor.
 * For more information, please refer to this {@link https://docs.filecoin.io/developers/smart-contracts/concepts/accounts-and-assets/#extensible-user-defined-actor-addresses-f4|link}.
 */
export enum DelegatedNamespace {
  ETH = '10',
}

/**
 * Indicates the type of address.
 * For more information, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.protocol-indicator|link}.
 */
export enum ProtocolIndicator {
  ID = 0,
  SECP256K1 = 1,
  ACTOR = 2,
  BLS = 3,
  DELEGATED = 4,
}

/**
 * Prefix that indicates what network the address corresponds.
 * For more information, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.network-prefix|link}.
 */
export enum Network {
  Mainnet = 'f',
  Testnet = 't',
}

/**
 *  Payload length for ethereum addresses
 */
export const ETH_ADDRESS_LEN = 20

/**
 * Maximum sub address length for type four (f4/t4) addresses
 */
export const SUB_ADDRESS_MAX_LEN = 54

/**
 *  Payload length for type three (f3/t3) addresses
 */
export const BLS_PAYLOAD_LEN = 48

/**
 * Payload length for type two (f2/t2) addresses
 */
export const ACTOR_PAYLOAD_LEN = 20

/**
 *  Payload length for type one (f1/t1) addresses
 */
export const SECP256K1_PAYLOAD_LEN = 20

/**
 *  Maximum payload length for type one (f0/t0) addresses
 */
export const ID_PAYLOAD_MAX_LEN = 9

/**
 *  Maximum actor id (decimal) for type one (f0/t0) addresses
 */
export const ID_PAYLOAD_MAX_NUM = new BN(2).pow(new BN(63)).sub(new BN(1))

/**
 * Indicates the type of signature used to derive new accounts and sign transactions.
 * For more information in type one addresses (f1/t1), please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.protocol-1-libsecpk1-elliptic-curve-public-keys|link}.
 * For more information in type three addresses (f3/t3), please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.protocol-3-bls|link}.
 */
export enum SignatureType {
  SECP256K1 = 1,
  BLS = 3,
}
