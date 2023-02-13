import { addressAsBytes, bytesToAddress } from './utils'
import { ProtocolIndicator } from './constants'

export class Address {
  constructor(public protocol: ProtocolIndicator, public payload: Buffer, public isTestnet: boolean) {}

  static fromString(address: string): Address {
    const [bytes, isTestnet] = addressAsBytes(address)
    return new Address(bytes[0], bytes.slice(1), isTestnet)
  }

  toString = (): string => {
    const protocolHex = Buffer.from('0' + this.protocol, 'hex')
    return bytesToAddress(Buffer.concat([protocolHex, this.payload]), this.isTestnet)
  }

  isID = (): boolean => this.protocol == ProtocolIndicator.ID
  isSecp256k1 = (): boolean => this.protocol == ProtocolIndicator.SECP256K1
  isBls = (): boolean => this.protocol == ProtocolIndicator.BLS
  isDelegated = (): boolean => this.protocol == ProtocolIndicator.DELEGATED
}
