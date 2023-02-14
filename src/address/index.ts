import base32Decode from 'base32-decode'
import base32Encode from 'base32-encode'
import leb from 'leb128'

import {
  ACTOR_PAYLOAD_MAX_LEN,
  BLS_PAYLOAD_MAX_LEN,
  Network,
  ProtocolIndicator,
  SECP256K1_PAYLOAD_MAX_LEN,
  SUB_ADDRESS_MAX_LEN,
} from './constants'

import {
  InvalidChecksumAddress,
  InvalidNamespace,
  InvalidNetwork,
  InvalidPayloadLength,
  InvalidProtocolIndicator,
  InvalidSubAddress,
  UnknownProtocolIndicator,
} from './errors'
import { getChecksum, getLeb128Length, validateNetwork } from './utils'

abstract class Address {
  constructor(public network: Network, public protocol: ProtocolIndicator) {}

  abstract toBytes: () => Buffer
  abstract toString: () => string

  getChecksum = (): Buffer => getChecksum(this.toBytes())

  static fromString = (address: string): Address => {
    const type = parseInt(address[1])

    switch (type) {
      case ProtocolIndicator.ID:
        return AddressId.fromString(address)
      case ProtocolIndicator.ACTOR:
        return AddressActor.fromString(address)
      case ProtocolIndicator.SECP256K1:
        return AddressSecp256k1.fromString(address)
      case ProtocolIndicator.BLS:
        return AddressBls.fromString(address)
      case ProtocolIndicator.DELEGATED:
        return AddressDelegated.fromString(address)
      default:
        throw new UnknownProtocolIndicator()
    }
  }

  static fromBytes = (network: Network, address: Buffer): Address => {
    const type = address[0]

    switch (type) {
      case ProtocolIndicator.ID:
        return AddressId.fromBytes(network, address)
      case ProtocolIndicator.ACTOR:
        return AddressActor.fromBytes(network, address)
      case ProtocolIndicator.SECP256K1:
        return AddressSecp256k1.fromBytes(network, address)
      case ProtocolIndicator.BLS:
        return AddressBls.fromBytes(network, address)
      case ProtocolIndicator.DELEGATED:
        return AddressDelegated.fromBytes(network, address)
      default:
        throw new UnknownProtocolIndicator()
    }
  }

  static isAddressId = (address: Address): address is AddressId => address.protocol == ProtocolIndicator.ID
  static isAddressBls = (address: Address): address is AddressBls => address.protocol == ProtocolIndicator.BLS
  static isAddressSecp256k1 = (address: Address): address is AddressSecp256k1 => address.protocol == ProtocolIndicator.SECP256K1
  static isAddressDelegated = (address: Address): address is AddressDelegated => address.protocol == ProtocolIndicator.DELEGATED
  static isAddressActor = (address: Address): address is AddressActor => address.protocol == ProtocolIndicator.ACTOR
}

export class AddressBls extends Address {
  constructor(network: Network, public payload: Buffer) {
    super(network, ProtocolIndicator.BLS)

    if (payload.byteLength !== BLS_PAYLOAD_MAX_LEN) throw new InvalidPayloadLength()
  }

  toBytes = (): Buffer => Buffer.concat([Buffer.from(`0${this.protocol}`, 'hex'), this.payload])

  toString = (): string => {
    const checksum = this.getChecksum()
    return (
      this.network +
      this.protocol.toString() +
      base32Encode(Buffer.concat([this.payload, checksum]), 'RFC4648', {
        padding: false,
      }).toLowerCase()
    )
  }

  static fromString(address: string): AddressBls {
    const network = address[0]
    const protocolIndicator = address[1]

    if (!validateNetwork(network)) throw new InvalidNetwork()
    if (parseInt(protocolIndicator) != ProtocolIndicator.BLS) throw new InvalidProtocolIndicator()

    const decodedData = base32Decode(address.slice(2).toUpperCase(), 'RFC4648')
    const payload = Buffer.from(decodedData.slice(0, -4))
    const checksum = Buffer.from(decodedData.slice(-4))

    const newAddress = new AddressBls(network, payload)
    if (newAddress.getChecksum().toString('hex') !== checksum.toString('hex')) throw new InvalidChecksumAddress()

    return newAddress
  }

  static fromBytes(network: Network, bytes: Buffer): AddressBls {
    if (bytes[0] != ProtocolIndicator.BLS) throw new InvalidProtocolIndicator()

    const payload = Buffer.from(bytes.slice(1))
    return new AddressBls(network, payload)
  }
}

export class AddressId extends Address {
  constructor(network: Network, public payload: Buffer) {
    super(network, ProtocolIndicator.ID)
  }

  toBytes = (): Buffer => Buffer.concat([Buffer.from(`0${this.protocol}`, 'hex'), Buffer.from(leb.unsigned.encode(this.payload))])

  toString = (): string => this.network + this.protocol.toString() + this.payload.toString()

  static fromString(address: string): AddressId {
    const network = address[0]
    const protocolIndicator = address[1]

    if (!validateNetwork(network)) throw new InvalidNetwork()
    if (parseInt(protocolIndicator) != ProtocolIndicator.ID) throw new InvalidProtocolIndicator()

    if (address.length > 18) throw new InvalidPayloadLength()

    return new AddressId(network, Buffer.from(address.substr(2), 'ascii'))
  }

  static fromBytes(network: Network, bytes: Buffer): AddressId {
    if (bytes[0] != ProtocolIndicator.ID) throw new InvalidProtocolIndicator()

    const payload = Buffer.from(leb.unsigned.decode(bytes.slice(1)))
    return new AddressId(network, payload)
  }
}

export class AddressSecp256k1 extends Address {
  constructor(network: Network, public payload: Buffer) {
    super(network, ProtocolIndicator.SECP256K1)
    if (payload.byteLength !== SECP256K1_PAYLOAD_MAX_LEN) throw new InvalidPayloadLength()
  }

  toBytes = (): Buffer => Buffer.concat([Buffer.from(`0${this.protocol}`, 'hex'), this.payload])

  toString = (): string => {
    const checksum = this.getChecksum()
    return (
      this.network +
      this.protocol.toString() +
      base32Encode(Buffer.concat([this.payload, checksum]), 'RFC4648', {
        padding: false,
      }).toLowerCase()
    )
  }

  static fromString(address: string): AddressSecp256k1 {
    const network = address[0]
    const protocolIndicator = address[1]

    if (!validateNetwork(network)) throw new InvalidNetwork()
    if (parseInt(protocolIndicator) != ProtocolIndicator.SECP256K1) throw new InvalidProtocolIndicator()

    const decodedData = base32Decode(address.slice(2).toUpperCase(), 'RFC4648')
    const payload = Buffer.from(decodedData.slice(0, -4))
    const checksum = Buffer.from(decodedData.slice(-4))

    const newAddress = new AddressSecp256k1(network, payload)
    if (newAddress.getChecksum().toString('hex') !== checksum.toString('hex')) throw new InvalidChecksumAddress()

    return newAddress
  }

  static fromBytes(network: Network, bytes: Buffer): AddressSecp256k1 {
    if (bytes[0] != ProtocolIndicator.SECP256K1) throw new InvalidProtocolIndicator()

    const payload = Buffer.from(bytes.slice(1))
    return new AddressSecp256k1(network, payload)
  }
}

export class AddressActor extends Address {
  constructor(network: Network, public payload: Buffer) {
    super(network, ProtocolIndicator.ACTOR)
    if (payload.byteLength !== ACTOR_PAYLOAD_MAX_LEN) throw new InvalidPayloadLength()
  }

  toBytes = (): Buffer => Buffer.concat([Buffer.from(`0${this.protocol}`, 'hex'), this.payload])

  toString = (): string => {
    const checksum = this.getChecksum()
    return (
      this.network +
      this.protocol.toString() +
      base32Encode(Buffer.concat([this.payload, checksum]), 'RFC4648', {
        padding: false,
      }).toLowerCase()
    )
  }

  static fromString(address: string): AddressActor {
    const network = address[0]
    const protocolIndicator = address[1]

    if (!validateNetwork(network)) throw new InvalidNetwork()
    if (parseInt(protocolIndicator) != ProtocolIndicator.ACTOR) throw new InvalidProtocolIndicator()

    const decodedData = base32Decode(address.slice(2).toUpperCase(), 'RFC4648')
    const payload = Buffer.from(decodedData.slice(0, -4))
    const checksum = Buffer.from(decodedData.slice(-4))

    const newAddress = new AddressActor(network, payload)
    if (newAddress.getChecksum().toString('hex') !== checksum.toString('hex')) throw new InvalidChecksumAddress()

    return newAddress
  }

  static fromBytes(network: Network, bytes: Buffer): AddressActor {
    if (bytes[0] != ProtocolIndicator.ACTOR) throw new InvalidProtocolIndicator()

    const payload = Buffer.from(bytes.slice(1))
    return new AddressActor(network, payload)
  }
}

export class AddressDelegated extends Address {
  constructor(public network: Network, public namespace: number, public subAddress: Buffer) {
    super(network, ProtocolIndicator.DELEGATED)

    if (namespace < 0) throw new InvalidNamespace()
    if (subAddress.length === 0 || subAddress.length > SUB_ADDRESS_MAX_LEN) throw new InvalidSubAddress()
  }

  toBytes = (): Buffer => {
    const namespaceBytes = Buffer.from(leb.unsigned.encode(this.namespace))
    const protocolBytes = Buffer.from(leb.unsigned.encode(this.protocol))

    return Buffer.concat([protocolBytes, namespaceBytes, this.subAddress])
  }

  toString = (): string => {
    const checksum = this.getChecksum()

    return (
      this.network +
      this.protocol.toString() +
      this.namespace.toString() +
      'f' +
      base32Encode(Buffer.concat([this.subAddress, checksum]), 'RFC4648', {
        padding: false,
      }).toLowerCase()
    )
  }

  static fromString(address: string): AddressDelegated {
    const network = address[0]
    const protocolIndicator = address[1]

    if (!validateNetwork(network)) throw new InvalidNetwork()
    if (parseInt(protocolIndicator) != ProtocolIndicator.DELEGATED) throw new InvalidProtocolIndicator()

    const namespace = parseInt(address.slice(2, address.indexOf('f', 2)))
    const dataEncoded = address.slice(address.indexOf('f', 2) + 1)
    const dataDecoded = base32Decode(dataEncoded.toUpperCase(), 'RFC4648')

    const subAddress = Buffer.from(dataDecoded.slice(0, -4))
    const checksum = Buffer.from(dataDecoded.slice(-4))

    const newAddress = new AddressDelegated(network, namespace, subAddress)

    if (newAddress.getChecksum().toString('hex') !== checksum.toString('hex')) throw new InvalidChecksumAddress()

    return newAddress
  }

  static fromBytes(network: Network, bytes: Buffer): AddressDelegated {
    if (bytes[0] != ProtocolIndicator.DELEGATED) throw new InvalidProtocolIndicator()

    const namespaceLength = getLeb128Length(bytes.slice(1))
    const namespace = parseInt(leb.unsigned.decode(bytes.slice(1, namespaceLength)))
    const subAddress = bytes.slice(namespaceLength + 1)

    return new AddressDelegated(network, namespace, subAddress)
  }
}
