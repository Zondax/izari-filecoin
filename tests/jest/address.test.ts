import fs from 'fs'
import path from 'path'
import BN from 'bn.js'

import { Address, AddressActor, AddressBls, AddressDelegated, AddressId, AddressSecp256k1, FilEthAddress } from '../../src/address'
import { Network, ProtocolIndicator } from '../../src/artifacts/address'
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

      test('Wrong protocol', async () => {
        expect(() => {
          AddressId.fromString('f18666')
        }).toThrow(InvalidProtocolIndicator)
      })
    })

    describe('Type BLS', () => {
      test('Wrong protocol', async () => {
        expect(() => {
          AddressBls.fromString('f48666')
        }).toThrow(InvalidProtocolIndicator)
      })
    })

    describe('Type SECP256K1', () => {
      test('Wrong protocol', async () => {
        expect(() => {
          AddressSecp256k1.fromString('f08666')
        }).toThrow(InvalidProtocolIndicator)
      })
    })

    describe('Type Actor', () => {
      test('Wrong protocol', async () => {
        expect(() => {
          AddressActor.fromString('f08666')
        }).toThrow(InvalidProtocolIndicator)
      })
    })

    describe('Type Delegated', () => {
      test('Wrong protocol', async () => {
        expect(() => {
          AddressDelegated.fromString('f08666')
        }).toThrow(InvalidProtocolIndicator)
      })
    })

    describe('Type Filecoin Ethereum', () => {
      test('Wrong protocol', async () => {
        expect(() => {
          FilEthAddress.fromString('f08666')
        }).toThrow(InvalidProtocolIndicator)
      })

      test('Wrong namespace', async () => {
        expect(() => {
          const addr = new AddressDelegated(Network.Mainnet, '11', Buffer.from('111111', 'hex'))
          FilEthAddress.fromString(addr.toString())
        }).toThrow()
      })

      test('Wrong eth address', async () => {
        expect(() => {
          const addr = new AddressDelegated(Network.Mainnet, '10', Buffer.from('111111', 'hex'))
          FilEthAddress.fromString(addr.toString())
        }).toThrow()
      })

      test('Correct eth address', async () => {
        const addr = FilEthAddress.fromString('f410feot7hrogmplrcupubsdbbqarkdewmb4vkwc5qqq')
        expect(addr.namespace).toBe('10')
        expect(addr.subAddress.toString('hex')).toBe('23a7f3c5c663d71151f40c8610c01150c9660795')
      })
    })

    describe('Ethereum conversion', async () => {
      test('From ethereum address (ID)', async () => {
        const addr = Address.fromEthAddressHex(Network.Testnet, '0xff00000000000000000000000000000000000001')

        expect(addr.protocol).toBe(ProtocolIndicator.ID)
        expect(addr.network).toBe(Network.Testnet)
        expect(addr.toString()).toBe("f01")
      })

      test('From ethereum address (ID) 2', async () => {
        const addr = Address.fromEthAddressHex(Network.Testnet, '0xff00000000000000000000000000000000000065')

        expect(addr.protocol).toBe(ProtocolIndicator.ID)
        expect(addr.network).toBe(Network.Testnet)
        expect(addr.toString()).toBe("f0101")
      })

      test('To ethereum address (ID)', async () => {
        const addr = AddressId.fromString('f0101')

        expect(addr.toEthAddressHex()).toBe("0xff00000000000000000000000000000000000065")
      })

      test('From ethereum address (DelegatedAddress)', async () => {
        const addr = Address.fromEthAddressHex(Network.Mainnet, '0xd4c5fb16488aa48081296299d54b0c648c9333da')

        expect(addr.protocol).toBe(ProtocolIndicator.DELEGATED)
        expect(addr.network).toBe(Network.Mainnet)
        expect(addr.toString()).toBe("f410f2tc7wfsirksibajjmkm5ksymmsgjgm62hjnomwa")
      })


      test('To ethereum address (DelegatedAddress)', async () => {
        const addr = AddressDelegated.fromString('f410f2tc7wfsirksibajjmkm5ksymmsgjgm62hjnomwa')

        expect(addr.network).toBe(Network.Mainnet)
        expect(addr.toEthAddressHex()).toBe("0xd4c5fb16488aa48081296299d54b0c648c9333da")
      })

    })

  })
})
