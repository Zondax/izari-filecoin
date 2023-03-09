import base32Decode from 'base32-decode'
import leb from 'leb128'
import BN from 'bn.js'

import { encode as base32Encode } from '../utils/base32.js'

import {
  ACTOR_ID_ETHEREUM_MASK,
  ACTOR_PAYLOAD_LEN,
  BLS_PAYLOAD_LEN,
  DelegatedNamespace,
  ETH_ADDRESS_LEN,
  ID_PAYLOAD_MAX_LEN,
  ID_PAYLOAD_MAX_NUM,
  Network,
  ProtocolIndicator,
  SECP256K1_PAYLOAD_LEN,
  SUB_ADDRESS_MAX_LEN,
} from '../artifacts/address.js'

import {
  InvalidChecksumAddress,
  InvalidNamespace,
  InvalidNetwork,
  InvalidPayloadLength,
  InvalidProtocolIndicator,
  InvalidSubAddress,
  UnknownProtocolIndicator,
} from './errors.js'
import { getChecksum, getLeb128Length, validateNetwork } from './utils.js'

/**
 * Address is an abstract class that holds fundamental fields that a filecoin address is composed by.
 * Concrete class types will inherit from it, adding specific methods for each type. It will serve as a factory
 * for parsing addresses from string and bytes as well.
 */
export abstract class Address {
  /**
   *
   * @param network - indicates which network the address belongs.
   * @param protocol - indicates the address types.
   */
  protected constructor(public network: Network, public protocol: ProtocolIndicator) {}

  /**
   * Each address is composed by a payload
   * For more information about payloads, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.payload|link}.
   */
  abstract payload: Buffer

  /**
   * Addresses need to implement a method to generate the bytes format of an address.
   * For more information about bytes format, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.bytes|link}.
   * @returns address in bytes format (buffer)
   */
  abstract toBytes: () => Buffer

  /**
   * Addresses need to implement a method to generate the string format of an address.
   * For more information about string format, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.string|link}.
   * @returns address in string format
   */
  abstract toString: () => string

  /**
   * Allows to generate the checksum related to the address.
   * For more information about string format, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.checksum|link}.
   * @returns a buffer containing the calculated checksum
   */
  getChecksum = (): Buffer => getChecksum(this.toBytes())

  /**
   * Allows to parse any address from string format to its corresponding type
   * @param address - address to parse in string format
   * @returns a new instance of a particular address type.
   */
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

  /**
   * Allows to parse any address from bytes format to its corresponding type
   * @param network - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param address - address to parse in bytes format (buffer)
   * @returns a new instance of a particular address type.
   */
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

  /**
   * Allows to create a new instance of an Address from an ethereum address.
   * It is based on {@link https://github.com/filecoin-project/lotus/blob/80aa6d1d646c9984761c77dcb7cf63be094b9407/chain/types/ethtypes/eth_types.go#L370|this code}
   * @param network - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param ethAddr - ethereum address to parse (buffer or hex string, with or without prefix)
   * @returns a new instance of a particular address type.
   */
  static fromEthAddress = (network: Network, ethAddr: Buffer | string): AddressId | FilEthAddress => {
    if (typeof ethAddr === 'string') {
      const tmp = ethAddr.startsWith('0x') ? ethAddr.slice(2) : ethAddr
      ethAddr = Buffer.from(tmp, 'hex')
    }

    const idMask = Buffer.alloc(12)
    idMask[0] = ACTOR_ID_ETHEREUM_MASK

    if (idMask.compare(ethAddr, 0, 12) == 0) {
      let i = 12
      while (ethAddr[i] == 0) i += 1

      return new AddressId(network, ethAddr.slice(i))
    }

    return new FilEthAddress(network, ethAddr)
  }

  /**
   * Allows to check if true value of an address instance is AddressId
   * @param address - instance to check its actual type
   * @returns whether the instance is AddressId or not
   */
  static isAddressId = (address: Address): address is AddressId => address.protocol == ProtocolIndicator.ID

  /**
   * Allows to check if true value of an address instance is AddressBls
   * @param address - instance to check its actual type
   * @returns whether the instance is AddressId or not
   */
  static isAddressBls = (address: Address): address is AddressBls => address.protocol == ProtocolIndicator.BLS

  /**
   * Allows to check if true value of an address instance is AddressSecp256k1
   * @param address - instance to check its actual type
   * @returns whether the instance is AddressSecp256k1 or not
   */
  static isAddressSecp256k1 = (address: Address): address is AddressSecp256k1 => address.protocol == ProtocolIndicator.SECP256K1

  /**
   * Allows to check if true value of an address instance is AddressDelegated
   * @param address - instance to check its actual type
   * @returns whether the instance is AddressDelegated or not
   */
  static isAddressDelegated = (address: Address): address is AddressDelegated => address.protocol == ProtocolIndicator.DELEGATED

  /**
   * Allows to check if true value of an address instance is AddressActor
   * @param address - instance to check its actual type
   * @returns whether the instance is AddressActor or not
   */
  static isAddressActor = (address: Address): address is AddressActor => address.protocol == ProtocolIndicator.ACTOR
}

/**
 * AddressBls is a concrete address type 3 on filecoin blockchain (f3/t3)
 * For more information about bls addresses, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.protocol-3-bls|link}.
 */
export class AddressBls extends Address {
  /**
   * Contains BLS public key, base32 encoded
   * For more information about payloads, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.payload|link}.
   */
  public payload: Buffer

  /**
   * Allows to create a new instance of bls address
   * @param network - indicates which network the address belongs.
   * @param payload - current address payload (buffer)
   */
  constructor(network: Network, payload: Buffer) {
    super(network, ProtocolIndicator.BLS)

    if (payload.byteLength !== BLS_PAYLOAD_LEN) throw new InvalidPayloadLength()
    this.payload = payload
  }

  /**
   * Allows to get the bytes format of this address
   * @returns bls address in bytes format
   */
  toBytes = (): Buffer => Buffer.concat([Buffer.from(`0${this.protocol}`, 'hex'), this.payload])

  /**
   * Allows to get the string format of this address
   * @returns bls address in string format
   */
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

  /**
   * Allows to create a new AddressBls instance from a string
   * @param address - address in string format
   * @returns a new instance of AddressBls
   */
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

  /**
   * Allows to create a new AddressBls instance from bytes (buffer)
   * @param network - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param bytes - address to parse in bytes format (buffer)
   * @returns a new instance of AddressBls
   */
  static fromBytes(network: Network, bytes: Buffer): AddressBls {
    if (bytes[0] != ProtocolIndicator.BLS) throw new InvalidProtocolIndicator()

    const payload = Buffer.from(bytes.slice(1))
    return new AddressBls(network, payload)
  }
}

/**
 * AddressId is a concrete address type 0 on filecoin blockchain (f0/t0)
 * For more information about bls addresses, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.protocol-0-ids|link}.
 */
export class AddressId extends Address {
  /**
   * Contains the id in decimal
   */
  public id: string

  /**
   * Contains leb128 encoded id
   * For more information about payloads, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.payload|link}.
   */
  public payload: Buffer

  /**
   * Allows to create a new instance of id address
   * @param network - indicates which network the address belongs.
   * @param payload - current address payload. It can be string (id in decimal) or buffer (leb128 encoded id)
   */
  constructor(network: Network, payload: string | Buffer) {
    super(network, ProtocolIndicator.ID)

    const payloadBuff = typeof payload === 'string' ? leb.unsigned.encode(payload) : payload

    if (payloadBuff.length > ID_PAYLOAD_MAX_LEN) throw new InvalidPayloadLength()

    this.payload = payloadBuff
    this.id = this.toString().slice(2)
  }

  /**
   * Allows to get the bytes format of this address
   * @returns id address in bytes format
   */
  toBytes = (): Buffer => Buffer.concat([Buffer.from(`0${this.protocol}`, 'hex'), this.payload])

  /**
   * Allows to get the string format of this address
   * @returns id address in string format
   */
  toString = (): string => this.network + this.protocol.toString() + leb.unsigned.decode(this.payload)

  /**
   * Allows to create a new AddressId instance from a string
   * @param address - address in string format
   * @returns a new instance of AddressId
   */
  static fromString(address: string): AddressId {
    const network = address[0]
    const protocolIndicator = address[1]

    if (!validateNetwork(network)) throw new InvalidNetwork()
    if (parseInt(protocolIndicator) != ProtocolIndicator.ID) throw new InvalidProtocolIndicator()

    const payload = leb.unsigned.encode(address.substr(2))
    return new AddressId(network, payload)
  }

  /**
   * Allows to create a new AddressId instance from bytes (buffer)
   * @param network - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param bytes - address to parse in bytes format (buffer)
   * @returns a new instance of AddressId
   */
  static fromBytes(network: Network, bytes: Buffer): AddressId {
    if (bytes[0] != ProtocolIndicator.ID) throw new InvalidProtocolIndicator()

    const payload = bytes.slice(1)
    return new AddressId(network, payload)
  }

  /**
   * Allows to get an ethereum address that holds the actor id
   * @param hexPrefix - add the 0x prefix or not
   * @returns ethereum address
   */
  toEthAddressHex = (hexPrefix = false): string => {
    const buf = Buffer.alloc(ETH_ADDRESS_LEN)
    buf[0] = ACTOR_ID_ETHEREUM_MASK

    buf.set(this.payload, ETH_ADDRESS_LEN - this.payload.length)

    return `${hexPrefix ? '0x' : ''}${buf.toString('hex')}`
  }
}

/**
 * AddressSecp256k1 is a concrete address type 1 on filecoin blockchain (f1/t1)
 * For more information about secp256k1 addresses, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.protocol-1-libsecpk1-elliptic-curve-public-keys|link}.
 */
export class AddressSecp256k1 extends Address {
  /**
   * Contains the Blake2b 160 hash of the uncompressed public key (65 bytes).
   * For more information about payloads, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.payload|link}.
   */
  public payload: Buffer

  /**
   * Allows to create a new instance of secp256k1 address
   * @param network - indicates which network the address belongs.
   * @param payload - current address payload (buffer)
   */
  constructor(network: Network, payload: Buffer) {
    super(network, ProtocolIndicator.SECP256K1)
    if (payload.byteLength !== SECP256K1_PAYLOAD_LEN) throw new InvalidPayloadLength()
    this.payload = payload
  }

  /**
   * Allows to get the bytes format of this address
   * @returns secp256k1 address in bytes format
   */
  toBytes = (): Buffer => Buffer.concat([Buffer.from(`0${this.protocol}`, 'hex'), this.payload])

  /**
   * Allows to get the string format of this address
   * @returns secp256k1 address in string format
   */
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

  /**
   * Allows to create a new AddressSecp256k1 instance from a string
   * @param address - address in string format
   * @returns a new instance of AddressSecp256k1
   */
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

  /**
   * Allows to create a new AddressSecp256k1 instance from bytes (buffer)
   * @param network - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param bytes - address to parse in bytes format (buffer)
   * @returns a new instance of AddressSecp256k1
   */
  static fromBytes(network: Network, bytes: Buffer): AddressSecp256k1 {
    if (bytes[0] != ProtocolIndicator.SECP256K1) throw new InvalidProtocolIndicator()

    const payload = Buffer.from(bytes.slice(1))
    return new AddressSecp256k1(network, payload)
  }
}

/**
 * AddressActor is a concrete address type 2 on filecoin blockchain (f2/t2)
 * For more information about actor addresses, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.protocol-2-actor|link}.
 */
export class AddressActor extends Address {
  /**
   * Contains the SHA256 hash of meaningful data produced as a result of creating the actor
   * For more information about payloads, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.payload|link}.
   */
  public payload: Buffer

  /**
   * Allows to create a new instance of actor address
   * @param network - indicates which network the address belongs.
   * @param payload - current address payload (buffer)
   */
  constructor(network: Network, payload: Buffer) {
    super(network, ProtocolIndicator.ACTOR)
    if (payload.byteLength !== ACTOR_PAYLOAD_LEN) throw new InvalidPayloadLength()

    this.payload = payload
  }

  /**
   * Allows to get the bytes format of this address
   * @returns actor address in bytes format
   */
  toBytes = (): Buffer => Buffer.concat([Buffer.from(`0${this.protocol}`, 'hex'), this.payload])

  /**
   * Allows to get the string format of this address
   * @returns actor address in string format
   */
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

  /**
   * Allows to create a new AddressActor instance from a string
   * @param address - address in string format
   * @returns a new instance of AddressActor
   */
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

  /**
   * Allows to create a new AddressActor instance from bytes (buffer)
   * @param network - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param bytes - address to parse in bytes format (buffer)
   * @returns a new instance of AddressActor
   */
  static fromBytes(network: Network, bytes: Buffer): AddressActor {
    if (bytes[0] != ProtocolIndicator.ACTOR) throw new InvalidProtocolIndicator()

    const payload = Buffer.from(bytes.slice(1))
    return new AddressActor(network, payload)
  }
}

/**
 * AddressDelegated is a concrete address type 4 on filecoin blockchain (f4/t4)
 * For more information about delegated addresses, please refer to this {@link https://docs.filecoin.io/developers/smart-contracts/concepts/accounts-and-assets/#extensible-user-defined-actor-addresses-f4|link}.
 * The filecoin improvement proposal (FIP) for this address type is {@link https://github.com/filecoin-project/FIPs/blob/master/FIPS/fip-0048.md|here}
 */
export class AddressDelegated extends Address {
  /**
   * Contains the address manager actor id (leb128 encoded) and the subaddress (plain)
   * For more information about payloads, please refer to this {@link https://github.com/filecoin-project/FIPs/blob/master/FIPS/fip-0048.md#the-f4-address-class|link}.
   */
  public payload: Buffer

  /**
   * Contains the address manager actor id (decimal)
   */
  public namespace: string

  /**
   * Contains the sub address (plain)
   */
  public subAddress: Buffer

  /**
   * Allows to create a new instance of delegated address
   * @param network - indicates which network the address belongs.
   * @param namespace - account manager actor id
   * @param subAddress - user-defined address the account manager will know and administrate (buffer)
   */
  constructor(network: Network, namespace: string, subAddress: Buffer) {
    super(network, ProtocolIndicator.DELEGATED)

    if (new BN(namespace).gt(ID_PAYLOAD_MAX_NUM)) throw new InvalidNamespace()
    if (subAddress.length === 0 || subAddress.length > SUB_ADDRESS_MAX_LEN) throw new InvalidSubAddress()

    this.namespace = namespace
    this.subAddress = subAddress
    this.payload = this.toBytes().slice(1)
  }

  /**
   * Allows to get the bytes format of this address
   * @returns delegated address in bytes format
   */
  toBytes = (): Buffer => {
    const namespaceBytes = Buffer.from(leb.unsigned.encode(this.namespace))
    const protocolBytes = Buffer.from(leb.unsigned.encode(this.protocol))

    return Buffer.concat([protocolBytes, namespaceBytes, this.subAddress])
  }

  /**
   * Allows to get the string format of this address
   * @returns delegated address in string format
   */
  toString = (): string => {
    const checksum = this.getChecksum()

    return (
      this.network +
      this.protocol.toString() +
      this.namespace +
      'f' +
      base32Encode(Buffer.concat([this.subAddress, checksum]), 'RFC4648', {
        padding: false,
      }).toLowerCase()
    )
  }

  /**
   * Allows to create a new AddressDelegated instance from a string
   * @param address - address in string format
   * @returns a new instance of AddressDelegated
   */
  static fromString(address: string): AddressDelegated {
    const network = address[0]
    const protocolIndicator = address[1]

    if (!validateNetwork(network)) throw new InvalidNetwork()
    if (parseInt(protocolIndicator) != ProtocolIndicator.DELEGATED) throw new InvalidProtocolIndicator()

    const namespace = address.slice(2, address.indexOf(network, 2))
    const dataEncoded = address.slice(address.indexOf(network, 2) + 1)
    const dataDecoded = base32Decode(dataEncoded.toUpperCase(), 'RFC4648')

    const subAddress = Buffer.from(dataDecoded.slice(0, -4))
    const checksum = Buffer.from(dataDecoded.slice(-4))

    const newAddress = new AddressDelegated(network, namespace, subAddress)

    if (newAddress.getChecksum().toString('hex') !== checksum.toString('hex')) throw new InvalidChecksumAddress()

    return newAddress
  }

  /**
   * Allows to create a new AddressDelegated instance from bytes (buffer)
   * @param network - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param bytes - address to parse in bytes format (buffer)
   * @returns a new instance of AddressDelegated
   */
  static fromBytes(network: Network, bytes: Buffer): AddressDelegated {
    if (bytes[0] != ProtocolIndicator.DELEGATED) throw new InvalidProtocolIndicator()

    const namespaceLength = getLeb128Length(bytes.slice(1))
    const namespace = leb.unsigned.decode(bytes.slice(1, 1 + namespaceLength))
    const subAddress = bytes.slice(namespaceLength + 1)

    return new AddressDelegated(network, namespace, subAddress)
  }
}

/**
 * EthereumAddress is a concrete implementation for the ethereum addresses in the filecoin blockchain.
 * For more information about ethereum addresses, please refer to this {@link https://docs.filecoin.io/intro/intro-to-filecoin/blockchain/#addresses|link}.
 */
export class FilEthAddress extends AddressDelegated {
  /**
   * Allows to create a new instance of EthereumAddress
   * @param network - indicates which network the address belongs.
   * @param ethAddress - valid ethereum address to wrap (as buffer)
   */

  constructor(network: Network, ethAddress: Buffer) {
    super(network, DelegatedNamespace.ETH, ethAddress)

    if (ethAddress.length !== ETH_ADDRESS_LEN) throw new Error('invalid ethereum address: length should be 32 bytes')
  }

  /**
   * Allows to create a new EthereumAddress instance from filecoin address in bytes format (buffer)
   * @example network: 'f' - bytesFilAddress: 040a23a7f3c5c663d71151f40c8610c01150c9660795
   * @param network - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param bytesFilAddress - address to parse in bytes format (buffer)
   * @returns a new instance of EthereumAddress
   */
  static fromBytes(network: Network, bytesFilAddress: Buffer): FilEthAddress {
    const addr = AddressDelegated.fromBytes(network, bytesFilAddress)
    if (addr.namespace !== DelegatedNamespace.ETH) throw new Error('invalid filecoin address for ethereum space')

    return new FilEthAddress(addr.network, addr.subAddress)
  }

  /**
   * Allows to create a new EthereumAddress instance from filecoin address in string format
   * @param strFilAddress - address to parse in string format (buffer)
   * @example strFilAddress: f410feot7hrogmplrcupubsdbbqarkdewmb4vkwc5qqq
   * @returns a new instance of EthereumAddress
   */
  static fromString(strFilAddress: string): FilEthAddress {
    const addr = AddressDelegated.fromString(strFilAddress)
    if (addr.namespace !== DelegatedNamespace.ETH) throw new Error('invalid filecoin address for ethereum space')

    return new FilEthAddress(addr.network, addr.subAddress)
  }

  /**
   * Allows to get the ethereum address in hex format of this address
   * @param hexPrefix - add the 0x prefix or not
   * @returns ethereum address in hex string format
   */
  toEthAddressHex = (hexPrefix = false): string => `${hexPrefix ? '0x' : ''}${this.subAddress.toString('hex')}`
}
