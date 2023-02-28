import fs from 'fs'
import path from 'path'
import BN from 'bn.js'

import { Address, AddressActor, AddressBls, AddressId, AddressSecp256k1 } from '../../src/address'
import { Network, ProtocolIndicator } from '../../src/address/constants'
import { InvalidPayloadLength, InvalidProtocolIndicator } from '../../src/address/errors'

jest.setTimeout(60 * 1000)

const ADDRESSES_VECTOR = './vectors/addresses.json'

type AddressTestCase = {
  string: string
  bytes: string
  network: string
  protocol: number
  payload: string
}

describe('Address', () => {
  describe('Vectors', () => {
    describe('From string', () => {
      const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, ADDRESSES_VECTOR), 'utf-8')) as AddressTestCase[]

      vectors.forEach(({ string, payload, bytes, protocol, network }, index) => {
        test(`Test case ${index}: ${string}`, () => {
          const addr = Address.fromString(string)

          expect(addr.toString()).toBe(string)
          expect(addr.toBytes().toString('hex')).toBe(bytes)
          expect(addr.protocol).toBe(protocol)
          expect(addr.network).toBe(network)
          expect(addr.payload.toString('hex')).toBe(payload)

          if (Address.isAddressId(addr)) expect(addr.id).toBe(string.slice(2))
          if (Address.isAddressDelegated(addr)) expect(addr.namespace).toBe(string.slice(2, string.indexOf(network, 1)))
        })
      })
    })

    describe('From bytes', () => {
      const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, ADDRESSES_VECTOR), 'utf-8')) as AddressTestCase[]

      vectors.forEach(({ string, payload, bytes, protocol, network }, index) => {
        test(`Test case ${index}: 0x${bytes}`, () => {
          const addr = Address.fromBytes(network as Network, Buffer.from(bytes, 'hex'))

          expect(addr.toString()).toBe(string)
          expect(addr.toBytes().toString('hex')).toBe(bytes)

          expect(addr.protocol).toBe(protocol)
          expect(addr.network).toBe(network)
          expect(addr.payload.toString('hex')).toBe(payload)

          if (Address.isAddressId(addr)) expect(addr.id).toBe(string.slice(2))
          if (Address.isAddressDelegated(addr)) expect(addr.namespace).toBe(string.slice(2, string.indexOf(network, 1)))
        })
      })
    })
  })

  describe('Manual', () => {
    describe('Type ID', () => {
      describe('From string', () => {
        test('Testnet', async () => {
          const addr = Address.fromString('t08666')
          expect(addr.toString()).toBe('t08666')
          expect(addr.toBytes().toString('hex')).toBe('00da43')
          expect(addr.protocol).toBe(ProtocolIndicator.ID)
          expect(addr.network).toBe(Network.Testnet)
          expect(Address.isAddressId(addr)).toBeTruthy()
          if (Address.isAddressId(addr)) expect(addr.id).toBe('8666')
        })

        test('Mainnet', async () => {
          const addr = Address.fromString('f08666')
          expect(addr.toString()).toBe('f08666')
          expect(addr.toBytes().toString('hex')).toBe('00da43')
          expect(addr.protocol).toBe(ProtocolIndicator.ID)
          expect(addr.network).toBe(Network.Mainnet)
          expect(Address.isAddressId(addr)).toBeTruthy()
          if (Address.isAddressId(addr)) expect(addr.id).toBe('8666')
        })

        test('Exceed max id (super big)', async () => {
          expect(() => {
            Address.fromString('t0111111111111111111111111')
          }).toThrow()
        })

        test('Exceed max value', async () => {
          const aboveMax = new BN(2).pow(new BN(63))
          const addrStr = 'f0' + aboveMax.toString()

          expect(() => {
            Address.fromString(addrStr)
          }).toThrow(InvalidPayloadLength)

          expect(() => {
            new AddressId(Network.Mainnet, aboveMax.toString())
          }).toThrow(InvalidPayloadLength)
        })

        test('Max allowed value', async () => {
          const max = new BN(2).pow(new BN(63)).sub(new BN(1))
          const addrStr = 'f0' + max.toString()

          const addr = Address.fromString(addrStr)
          expect(addr.toString()).toBe(addrStr)
          expect(addr.toBytes().toString('hex')).toBe('00ffffffffffffffff7f')
          expect(addr.protocol).toBe(ProtocolIndicator.ID)
          expect(addr.network).toBe(Network.Mainnet)
        })
      })

      describe('From bytes', () => {
        test('Testnet', async () => {
          const addr = Address.fromBytes(Network.Testnet, Buffer.from('00da43', 'hex'))
          expect(addr.toString()).toBe('t08666')
          expect(addr.toBytes().toString('hex')).toBe('00da43')
          expect(addr.protocol).toBe(ProtocolIndicator.ID)
          expect(addr.network).toBe(Network.Testnet)
        })

        test('Mainnet', async () => {
          const addr = Address.fromBytes(Network.Mainnet, Buffer.from('00da43', 'hex'))
          expect(addr.toString()).toBe('f08666')
          expect(addr.toBytes().toString('hex')).toBe('00da43')
          expect(addr.protocol).toBe(ProtocolIndicator.ID)
          expect(addr.network).toBe(Network.Mainnet)
        })

        test('Exceed max value', async () => {
          expect(() => {
            Address.fromBytes(Network.Mainnet, Buffer.from('0080808080808080808001', 'hex'))
          }).toThrow(InvalidPayloadLength)
        })

        test('Max allowed value', async () => {
          const addr = Address.fromBytes(Network.Mainnet, Buffer.from('00ffffffffffffffff7f', 'hex'))
          expect(addr.toString()).toBe('f09223372036854775807')
          expect(addr.toBytes().toString('hex')).toBe('00ffffffffffffffff7f')
          expect(addr.protocol).toBe(ProtocolIndicator.ID)
          expect(addr.network).toBe(Network.Mainnet)
        })
      })
    })

    test('Wrong protocol for ID', async () => {
      expect(() => {
        AddressId.fromString('f18666')
      }).toThrow(InvalidProtocolIndicator)
    })

    test('Wrong protocol for BLS', async () => {
      expect(() => {
        AddressBls.fromString('f48666')
      }).toThrow(InvalidProtocolIndicator)
    })

    test('Wrong protocol for SECP256K1', async () => {
      expect(() => {
        AddressSecp256k1.fromString('f08666')
      }).toThrow(InvalidProtocolIndicator)
    })

    test('Wrong protocol for Actor', async () => {
      expect(() => {
        AddressActor.fromString('f08666')
      }).toThrow(InvalidProtocolIndicator)
    })
  })
})
