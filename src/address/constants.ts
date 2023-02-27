export enum SignatureType {
  SECP256K1 = 1,
  BLS = 3,
}

export enum ProtocolIndicator {
  ID = 0,
  SECP256K1 = 1,
  ACTOR = 2,
  BLS = 3,
  DELEGATED = 4,
}

export enum Network {
  Mainnet = 'f',
  Testnet = 't',
}

export const SUB_ADDRESS_MAX_LEN = 54
export const BLS_PAYLOAD_MAX_LEN = 48
export const ACTOR_PAYLOAD_MAX_LEN = 20
export const SECP256K1_PAYLOAD_MAX_LEN = 20
