import base32Decode from 'base32-decode'
import leb from 'leb128'
import BN from 'bn.js'

import { encode as base32Encode } from '../utils/base32.js'

import {
  ACTOR_ID_ETHEREUM_MASK,
  ACTOR_ID_ETHEREUM_MASK_LEN,
  ACTOR_PAYLOAD_LEN,
  BLS_PAYLOAD_LEN,
  DelegatedNamespace,
  ETH_ADDRESS_LEN,
  ID_PAYLOAD_MAX_NUM,
  NetworkPrefix,
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
  InvalidId,
} from './errors.js'
import { getChecksum, getLeb128Length, validateNetworkPrefix, isMaskedIdEthAddress } from './utils.js'

/**
 * Address is an abstract class that holds fundamental fields that a filecoin address is composed by.
 * Concrete class types will inherit from it, adding specific methods for each type. It will serve as a factory
 * for parsing addresses from string and bytes as well.
 */
export abstract class Address {
  /**
   *
   * @param networkPrefix - indicates which network the address belongs.
   * @param protocol - indicates the address types.
   */
  protected constructor(protected networkPrefix: NetworkPrefix, protected protocol: ProtocolIndicator) {}

  /**
   * Each address is composed by a payload
   * For more information about payloads, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.payload|link}.
   */
  protected abstract payload: Buffer

  /**
   * Getter for payload
   */
  getPayload = (): Buffer => this.payload

  /**
   * Getter for network type
   */
  getNetworkPrefix = (): NetworkPrefix => this.networkPrefix

  /**
   * Getter for protocol indicator
   */
  getProtocol = (): ProtocolIndicator => this.protocol

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
      case ProtocolIndicator.DELEGATED: {
        const addr = AddressDelegated.fromString(address)
        if (Address.isFilEthAddress(addr)) return new FilEthAddress(addr.getNetworkPrefix(), addr.getSubAddress())

        return addr
      }
      default:
        throw new UnknownProtocolIndicator(type)
    }
  }

  /**
   * Allows to parse any address from bytes format to its corresponding type
   * @param networkPrefix - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param address - address to parse in bytes format (buffer)
   * @returns a new instance of a particular address type.
   */
  static fromBytes = (networkPrefix: NetworkPrefix, address: Buffer): Address => {
    const type = address[0]

    switch (type) {
      case ProtocolIndicator.ID:
        return AddressId.fromBytes(networkPrefix, address)
      case ProtocolIndicator.ACTOR:
        return AddressActor.fromBytes(networkPrefix, address)
      case ProtocolIndicator.SECP256K1:
        return AddressSecp256k1.fromBytes(networkPrefix, address)
      case ProtocolIndicator.BLS:
        return AddressBls.fromBytes(networkPrefix, address)
      case ProtocolIndicator.DELEGATED: {
        const addr = AddressDelegated.fromBytes(networkPrefix, address)
        if (Address.isFilEthAddress(addr)) return new FilEthAddress(addr.getNetworkPrefix(), addr.getSubAddress())

        return addr
      }
      default:
        throw new UnknownProtocolIndicator(type)
    }
  }

  /**
   * Allows to create a new instance of an Address from an ethereum address.
   * It is based on {@link https://github.com/filecoin-project/lotus/blob/80aa6d1d646c9984761c77dcb7cf63be094b9407/chain/types/ethtypes/eth_types.go#L370|this code}
   * @param networkPrefix - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param ethAddr - ethereum address to parse (buffer or hex string, with or without prefix)
   * @returns a new instance of a particular address type.
   */
  static fromEthAddress = (networkPrefix: NetworkPrefix, ethAddr: Buffer | string): AddressId | FilEthAddress => {
    if (typeof ethAddr === 'string') {
      const tmp = ethAddr.startsWith('0x') ? ethAddr.substring(2) : ethAddr
      if (tmp.length % 2 !== 0) {
        throw new Error('invalid eth address')
      }

      ethAddr = Buffer.from(tmp, 'hex')
    }

    if (isMaskedIdEthAddress(ethAddr)) {
      let i = ACTOR_ID_ETHEREUM_MASK_LEN
      while (ethAddr[i] == 0) i += 1

      const payload = leb.unsigned.encode(Buffer.from(ethAddr.subarray(i)))
      return new AddressId(networkPrefix, payload)
    }

    return new FilEthAddress(networkPrefix, ethAddr)
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
   * Allows to check if true value of an address instance is FilEthAddress
   * @param address - instance to check its actual type
   * @returns whether the instance is FilEthAddress or not
   */
  static isFilEthAddress = (address: Address): address is FilEthAddress =>
    address.protocol == ProtocolIndicator.DELEGATED && 'namespace' in address && address.namespace == DelegatedNamespace.ETH

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
  protected payload: Buffer

  /**
   * Allows to create a new instance of bls address
   * @param networkPrefix - indicates which network the address belongs.
   * @param payload - current address payload (buffer)
   */
  constructor(networkPrefix: NetworkPrefix, payload: Buffer) {
    super(networkPrefix, ProtocolIndicator.BLS)

    if (payload.byteLength !== BLS_PAYLOAD_LEN) throw new InvalidPayloadLength(payload.byteLength)
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
      this.networkPrefix +
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
    const networkPrefix = address[0]
    const protocolIndicator = address[1]

    if (!validateNetworkPrefix(networkPrefix)) throw new InvalidNetwork(networkPrefix)
    if (parseInt(protocolIndicator) != ProtocolIndicator.BLS) throw new InvalidProtocolIndicator(parseInt(protocolIndicator))

    const decodedData = Buffer.from(base32Decode(address.substring(2).toUpperCase(), 'RFC4648'))
    const payload = Buffer.from(decodedData.subarray(0, -4))
    const checksum = Buffer.from(decodedData.subarray(-4))

    const newAddress = new AddressBls(networkPrefix, payload)
    if (newAddress.getChecksum().toString('hex') !== checksum.toString('hex'))
      throw new InvalidChecksumAddress(newAddress.getChecksum().toString('hex'), checksum.toString('hex'))

    return newAddress
  }

  /**
   * Allows to create a new AddressBls instance from bytes (buffer)
   * @param networkPrefix - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param bytes - address to parse in bytes format (buffer)
   * @returns a new instance of AddressBls
   */
  static fromBytes(networkPrefix: NetworkPrefix, bytes: Buffer): AddressBls {
    if (bytes[0] != ProtocolIndicator.BLS) throw new InvalidProtocolIndicator(bytes[0])

    const payload = Buffer.from(bytes.subarray(1))
    return new AddressBls(networkPrefix, payload)
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
  protected id: string

  /**
   * Contains leb128 encoded id
   * For more information about payloads, please refer to this {@link https://spec.filecoin.io/appendix/address/#section-appendix.address.payload|link}.
   */
  protected payload: Buffer

  /**
   * Allows to create a new instance of id address
   * @param networkPrefix - indicates which network the address belongs.
   * @param payload - current address payload. It can be string (id in decimal) or buffer (leb128 encoded id)
   */
  constructor(networkPrefix: NetworkPrefix, payload: string | Buffer) {
    super(networkPrefix, ProtocolIndicator.ID)

    let payloadBuff: Buffer
    if (typeof payload === 'string') {
      payloadBuff = leb.unsigned.encode(payload)
    } else {
      // Check if the payload is a valid leb128-encoded data
      payloadBuff = leb.unsigned.encode(leb.unsigned.decode(payload))
      if (payloadBuff.compare(payload) !== 0) {
        throw new Error('invalid leb128 encoded payload')
      }
    }

    const idNum = new BN(leb.unsigned.decode(payloadBuff))
    if (idNum.gt(ID_PAYLOAD_MAX_NUM)) throw new InvalidId(idNum.toString())

    this.payload = payloadBuff
    this.id = this.toString().substring(2)
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
  toString = (): string => this.networkPrefix + this.protocol.toString() + leb.unsigned.decode(this.payload)

  /**
   * Getter for actor id
   */
  getId = (): string => this.id

  /**
   * Allows to create a new AddressId instance from a string
   * @param address - address in string format
   * @returns a new instance of AddressId
   */
  static fromString(address: string): AddressId {
    const networkPrefix = address[0]
    const protocolIndicator = address[1]

    if (!validateNetworkPrefix(networkPrefix)) throw new InvalidNetwork(networkPrefix)
    if (parseInt(protocolIndicator) != ProtocolIndicator.ID) throw new InvalidProtocolIndicator(parseInt(protocolIndicator))

    const payload = leb.unsigned.encode(address.substring(2))
    return new AddressId(networkPrefix, payload)
  }

  /**
   * Allows to create a new AddressId instance from bytes (buffer)
   * @param networkPrefix - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param bytes - address to parse in bytes format (buffer)
   * @returns a new instance of AddressId
   */
  static fromBytes(networkPrefix: NetworkPrefix, bytes: Buffer): AddressId {
    if (bytes[0] != ProtocolIndicator.ID) throw new InvalidProtocolIndicator(bytes[0])

    const payload = Buffer.from(bytes.subarray(1))
    return new AddressId(networkPrefix, payload)
  }

  /**
   * Allows to get an ethereum address that holds the actor id
   * @param hexPrefix - add the 0x prefix or not
   * @returns ethereum address
   */
  toEthAddressHex = (hexPrefix = false): string => {
    const buf = Buffer.alloc(ETH_ADDRESS_LEN)
    buf[0] = ACTOR_ID_ETHEREUM_MASK

    const decodedPayload = new BN(leb.unsigned.decode(this.payload)).toArrayLike(Buffer)
    buf.set(decodedPayload, ETH_ADDRESS_LEN - decodedPayload.byteLength)

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
  protected payload: Buffer

  /**
   * Allows to create a new instance of secp256k1 address
   * @param networkPrefix - indicates which network the address belongs.
   * @param payload - current address payload (buffer)
   */
  constructor(networkPrefix: NetworkPrefix, payload: Buffer) {
    super(networkPrefix, ProtocolIndicator.SECP256K1)
    if (payload.byteLength !== SECP256K1_PAYLOAD_LEN) throw new InvalidPayloadLength(payload.byteLength)
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
      this.networkPrefix +
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
    const networkPrefix = address[0]
    const protocolIndicator = address[1]

    if (!validateNetworkPrefix(networkPrefix)) throw new InvalidNetwork(networkPrefix)
    if (parseInt(protocolIndicator) != ProtocolIndicator.SECP256K1) throw new InvalidProtocolIndicator(parseInt(protocolIndicator))

    const decodedData = Buffer.from(base32Decode(address.substring(2).toUpperCase(), 'RFC4648'))
    const payload = Buffer.from(decodedData.subarray(0, -4))
    const checksum = Buffer.from(decodedData.subarray(-4))

    const newAddress = new AddressSecp256k1(networkPrefix, payload)
    if (newAddress.getChecksum().toString('hex') !== checksum.toString('hex'))
      throw new InvalidChecksumAddress(newAddress.getChecksum().toString('hex'), checksum.toString('hex'))

    return newAddress
  }

  /**
   * Allows to create a new AddressSecp256k1 instance from bytes (buffer)
   * @param networkPrefix - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param bytes - address to parse in bytes format (buffer)
   * @returns a new instance of AddressSecp256k1
   */
  static fromBytes(networkPrefix: NetworkPrefix, bytes: Buffer): AddressSecp256k1 {
    if (bytes[0] != ProtocolIndicator.SECP256K1) throw new InvalidProtocolIndicator(bytes[0])

    const payload = Buffer.from(bytes.subarray(1))
    return new AddressSecp256k1(networkPrefix, payload)
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
  protected payload: Buffer

  /**
   * Allows to create a new instance of actor address
   * @param networkPrefix - indicates which network the address belongs.
   * @param payload - current address payload (buffer)
   */
  constructor(networkPrefix: NetworkPrefix, payload: Buffer) {
    super(networkPrefix, ProtocolIndicator.ACTOR)
    if (payload.byteLength !== ACTOR_PAYLOAD_LEN) throw new InvalidPayloadLength(payload.byteLength)

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
      this.networkPrefix +
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
    const networkPrefix = address[0]
    const protocolIndicator = address[1]

    if (!validateNetworkPrefix(networkPrefix)) throw new InvalidNetwork(networkPrefix)
    if (parseInt(protocolIndicator) != ProtocolIndicator.ACTOR) throw new InvalidProtocolIndicator(parseInt(protocolIndicator))

    const decodedData = Buffer.from(base32Decode(address.substring(2).toUpperCase(), 'RFC4648'))
    const payload = Buffer.from(decodedData.subarray(0, -4))
    const checksum = Buffer.from(decodedData.subarray(-4))

    const newAddress = new AddressActor(networkPrefix, payload)
    if (newAddress.getChecksum().toString('hex') !== checksum.toString('hex'))
      throw new InvalidChecksumAddress(newAddress.getChecksum().toString('hex'), checksum.toString('hex'))

    return newAddress
  }

  /**
   * Allows to create a new AddressActor instance from bytes (buffer)
   * @param networkPrefix - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param bytes - address to parse in bytes format (buffer)
   * @returns a new instance of AddressActor
   */
  static fromBytes(networkPrefix: NetworkPrefix, bytes: Buffer): AddressActor {
    if (bytes[0] != ProtocolIndicator.ACTOR) throw new InvalidProtocolIndicator(bytes[0])

    const payload = Buffer.from(bytes.subarray(1))
    return new AddressActor(networkPrefix, payload)
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
  protected payload: Buffer

  /**
   * Contains the address manager actor id (decimal)
   */
  protected namespace: string

  /**
   * Contains the sub address (plain)
   */
  protected subAddress: Buffer

  /**
   * Allows to create a new instance of delegated address
   * @param networkPrefix - indicates which network the address belongs.
   * @param namespace - account manager actor id
   * @param subAddress - user-defined address the account manager will know and administrate (buffer)
   */
  constructor(networkPrefix: NetworkPrefix, namespace: string, subAddress: Buffer) {
    super(networkPrefix, ProtocolIndicator.DELEGATED)

    if (new BN(namespace).gt(ID_PAYLOAD_MAX_NUM)) throw new InvalidNamespace(namespace)
    if (subAddress.length === 0 || subAddress.length > SUB_ADDRESS_MAX_LEN) throw new InvalidSubAddress()

    // Special check to prevent users from using DelegatedAddress with ETH namespace, and masked-id addresses
    if (namespace === DelegatedNamespace.ETH && isMaskedIdEthAddress(subAddress)) {
      throw new Error('masked-id eth addresses not allowed')
    }

    this.namespace = namespace
    this.subAddress = subAddress
    this.payload = Buffer.from(this.toBytes().subarray(1))
  }

  /**
   * Getter for namespace
   */
  getNamespace = (): string => this.namespace

  /**
   * Getter for sub address
   */
  getSubAddress = (): Buffer => this.subAddress

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
      this.networkPrefix +
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
    const networkPrefix = address[0]
    const protocolIndicator = address[1]

    if (!validateNetworkPrefix(networkPrefix)) throw new InvalidNetwork(networkPrefix)
    if (parseInt(protocolIndicator) != ProtocolIndicator.DELEGATED) throw new InvalidProtocolIndicator(parseInt(protocolIndicator))

    const namespace = address.substring(2, address.indexOf('f', 2))
    const dataEncoded = address.substring(address.indexOf('f', 2) + 1)
    const dataDecoded = Buffer.from(base32Decode(dataEncoded.toUpperCase(), 'RFC4648'))

    const subAddress = Buffer.from(dataDecoded.subarray(0, -4))
    const checksum = Buffer.from(dataDecoded.subarray(-4))

    const newAddress = new AddressDelegated(networkPrefix, namespace, subAddress)

    if (newAddress.getChecksum().toString('hex') !== checksum.toString('hex'))
      throw new InvalidChecksumAddress(newAddress.getChecksum().toString('hex'), checksum.toString('hex'))

    return newAddress
  }

  /**
   * Allows to create a new AddressDelegated instance from bytes (buffer)
   * @param networkPrefix - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param bytes - address to parse in bytes format (buffer)
   * @returns a new instance of AddressDelegated
   */
  static fromBytes(networkPrefix: NetworkPrefix, bytes: Buffer): AddressDelegated {
    if (bytes[0] != ProtocolIndicator.DELEGATED) throw new InvalidProtocolIndicator(bytes[0])

    const namespaceLength = getLeb128Length(Buffer.from(bytes.subarray(1)))
    const namespace = leb.unsigned.decode(Buffer.from(bytes.subarray(1, 1 + namespaceLength)))
    const subAddress = Buffer.from(bytes.subarray(namespaceLength + 1))

    return new AddressDelegated(networkPrefix, namespace, subAddress)
  }
}

/**
 * EthereumAddress is a concrete implementation for the ethereum addresses in the filecoin blockchain.
 * For more information about ethereum addresses, please refer to this {@link https://docs.filecoin.io/intro/intro-to-filecoin/blockchain/#addresses|link}.
 */
export class FilEthAddress extends AddressDelegated {
  /**
   * Allows to create a new instance of EthereumAddress
   * @param networkPrefix - indicates which network the address belongs.
   * @param ethAddress - valid ethereum address to wrap (as buffer)
   */

  constructor(networkPrefix: NetworkPrefix, ethAddress: Buffer) {
    super(networkPrefix, DelegatedNamespace.ETH, ethAddress)

    if (ethAddress.length !== ETH_ADDRESS_LEN) throw new Error(`invalid ethereum address: length should be ${ETH_ADDRESS_LEN} bytes`)
    if (isMaskedIdEthAddress(ethAddress)) throw new Error('masked-id eth addresses not allowed')
  }

  /**
   * Allows to create a new EthereumAddress instance from filecoin address in bytes format (buffer)
   * @example networkPrefix: 'f' - bytesFilAddress: 040a23a7f3c5c663d71151f40c8610c01150c9660795
   * @param networkPrefix - indicates which network the address belongs, as the bytes format does not hold the network the address corresponds
   * @param bytesFilAddress - address to parse in bytes format (buffer)
   * @returns a new instance of EthereumAddress
   */
  static fromBytes(networkPrefix: NetworkPrefix, bytesFilAddress: Buffer): FilEthAddress {
    const addr = AddressDelegated.fromBytes(networkPrefix, bytesFilAddress)
    if (addr.getNamespace() !== DelegatedNamespace.ETH) throw new Error('invalid filecoin address for ethereum space')

    return new FilEthAddress(addr.getNetworkPrefix(), addr.getSubAddress())
  }

  /**
   * Allows to create a new EthereumAddress instance from filecoin address in string format
   * @param strFilAddress - address to parse in string format (buffer)
   * @example strFilAddress: f410feot7hrogmplrcupubsdbbqarkdewmb4vkwc5qqq
   * @returns a new instance of EthereumAddress
   */
  static fromString(strFilAddress: string): FilEthAddress {
    const addr = AddressDelegated.fromString(strFilAddress)
    if (addr.getNamespace() !== DelegatedNamespace.ETH) throw new Error('invalid filecoin address for ethereum space')

    return new FilEthAddress(addr.getNetworkPrefix(), addr.getSubAddress())
  }

  /**
   * Allows to get the ethereum address in hex format of this address
   * @param hexPrefix - add the 0x prefix or not
   * @returns ethereum address in hex string format
   */
  toEthAddressHex = (hexPrefix = false): string => `${hexPrefix ? '0x' : ''}${this.subAddress.toString('hex')}`
}
