import blake from 'blakejs'
import base32Decode from 'base32-decode'
import base32Encode from 'base32-encode'
import leb from 'leb128'
import BN from 'bn.js'

import { MaxSubaddressBytes, ProtocolIndicator } from './constants'
import {
  InvalidChecksumAddress,
  InvalidNamespace,
  InvalidPayloadLength,
  InvalidSubAddress,
  ProtocolNotSupported,
  UnknownProtocolIndicator,
} from './errors'

export function addressAsBytes(address: string): [Buffer, boolean] {
  let address_decoded, payload, checksum
  const isTestnet = address[1] == 't'
  const protocolIndicator = address[1]
  const protocolIndicatorByte = `0${protocolIndicator}`

  switch (Number(protocolIndicator)) {
    case ProtocolIndicator.ID:
      if (address.length > 18) {
        throw new InvalidPayloadLength()
      }
      return [Buffer.concat([Buffer.from(protocolIndicatorByte, 'hex'), Buffer.from(leb.unsigned.encode(address.substr(2)))]), isTestnet]
    case ProtocolIndicator.SECP256K1:
      address_decoded = base32Decode(address.slice(2).toUpperCase(), 'RFC4648')

      payload = address_decoded.slice(0, -4)
      checksum = Buffer.from(address_decoded.slice(-4))

      if (payload.byteLength !== 20) throw new InvalidPayloadLength()

      break
    case ProtocolIndicator.ACTOR:
      address_decoded = base32Decode(address.slice(2).toUpperCase(), 'RFC4648')

      payload = address_decoded.slice(0, -4)
      checksum = Buffer.from(address_decoded.slice(-4))

      if (payload.byteLength !== 20) throw new InvalidPayloadLength()

      break
    case ProtocolIndicator.BLS:
      address_decoded = base32Decode(address.slice(2).toUpperCase(), 'RFC4648')

      payload = address_decoded.slice(0, -4)
      checksum = Buffer.from(address_decoded.slice(-4))

      if (payload.byteLength !== 48) throw new InvalidPayloadLength()

      break
    case ProtocolIndicator.DELEGATED:
      return [delegatedAddressAsBytes(address), isTestnet]
    default:
      throw new UnknownProtocolIndicator()
  }

  const bytes_address = Buffer.concat([Buffer.from(protocolIndicatorByte, 'hex'), Buffer.from(payload)])

  if (getChecksum(bytes_address).toString('hex') !== checksum.toString('hex')) throw new InvalidChecksumAddress()

  return [bytes_address, isTestnet]
}

export function bytesToAddress(payload: Buffer, testnet: boolean): string {
  const protocolIndicator = payload[0]
  const restOfPayload = payload.slice(1)

  switch (Number(protocolIndicator)) {
    case ProtocolIndicator.ID:
      // if (payload.length > 16) { throw new InvalidPayloadLength(); };
      throw new ProtocolNotSupported('ID')
    case ProtocolIndicator.SECP256K1:
      if (restOfPayload.length !== 20) {
        throw new InvalidPayloadLength()
      }
      break
    case ProtocolIndicator.ACTOR:
      if (restOfPayload.length !== 20) {
        throw new InvalidPayloadLength()
      }
      break
    case ProtocolIndicator.BLS:
      if (restOfPayload.length !== 48) {
        throw new InvalidPayloadLength()
      }
      break
    case ProtocolIndicator.DELEGATED:
      if (restOfPayload.length < 2) {
        throw new InvalidPayloadLength()
      }
      break
    default:
      throw new UnknownProtocolIndicator()
  }

  const checksum = getChecksum(payload)

  let prefix = 'f'
  if (testnet) {
    prefix = 't'
  }

  prefix += protocolIndicator

  if (Number(protocolIndicator) === ProtocolIndicator.DELEGATED) {
    const namespaceLength = getLeb128Length(restOfPayload)
    if (namespaceLength < 0) throw new InvalidNamespace()

    const namespace = leb.unsigned.decode(restOfPayload.slice(0, namespaceLength))
    const subaddress = payload.slice(namespaceLength + 1)
    if (subaddress.length === 0 || subaddress.length > MaxSubaddressBytes) throw new InvalidSubAddress()

    return (
      prefix +
      namespace +
      'f' +
      base32Encode(Buffer.concat([subaddress, checksum]), 'RFC4648', {
        padding: false,
      }).toLowerCase()
    )
  }
  return (
    prefix +
    base32Encode(Buffer.concat([restOfPayload, checksum]), 'RFC4648', {
      padding: false,
    }).toLowerCase()
  )
}

export function getChecksum(payload: Buffer): Buffer {
  const blakeCtx = blake.blake2bInit(4)
  blake.blake2bUpdate(blakeCtx, payload)
  return Buffer.from(blake.blake2bFinal(blakeCtx))
}

function getLeb128Length(input: Buffer): number {
  let count = 0
  while (count < input.length) {
    const byte = input[count]
    count++
    if (byte < 128) break
  }
  if (count == input.length) {
    return -1
  }
  return count
}

function delegatedAddressAsBytes(address: string): Buffer {
  const protocolIndicator = address[1]

  const namespaceRaw = address.slice(2, address.indexOf('f', 2))
  const subAddressRaw = address.slice(address.indexOf('f', 2) + 1)
  const address_decoded = base32Decode(subAddressRaw.toUpperCase(), 'RFC4648')

  const namespaceBuff = new BN(namespaceRaw, 10).toBuffer('be', 8)
  const namespaceBytes = Buffer.from(leb.unsigned.encode(namespaceBuff))
  const protocolBytes = Buffer.from(leb.unsigned.encode(protocolIndicator))
  const bytes_address = Buffer.concat([protocolBytes, namespaceBytes, Buffer.from(address_decoded.slice(0, -4))])
  const checksum = Buffer.from(address_decoded.slice(-4))

  if (getChecksum(bytes_address).toString('hex') !== checksum.toString('hex')) throw new InvalidChecksumAddress()

  return bytes_address
}
