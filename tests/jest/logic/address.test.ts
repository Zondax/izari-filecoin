import fs from 'fs'
import path from 'path'
import BN from 'bn.js'

import { Address, AddressActor, AddressBls, AddressDelegated, AddressId, AddressSecp256k1, FilEthAddress } from '../../../src/address'
import { NetworkPrefix, ProtocolIndicator } from '../../../src/artifacts/address'
import { InvalidPayloadLength, InvalidProtocolIndicator } from '../../../src/address/errors'

jest.setTimeout(60 * 1000)

const ADDRESSES_VECTOR = '../vectors/addresses.json'
const ADDRESSES_ETH_VECTOR = '../vectors/addresses_eth.json'

type AddressTestCase = {
  string: string
  bytes: string
  network: string
  protocol: number
  payload: string
  eth?: string
}

type AddressEthTestCase = {
  string: string
  eth: string
}

describe('Address', () => {
  describe('Vectors', () => {
    describe('From string', () => {
      const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, ADDRESSES_VECTOR), 'utf-8')) as AddressTestCase[]

      vectors.forEach(({ string, payload, bytes, protocol, network, eth }, index) => {
        test(`Test case ${index}: ${string}`, () => {
          const addr = Address.fromString(string)

          expect(addr.toString()).toBe(string)
          expect(addr.toBytes().toString('hex')).toBe(bytes)
          expect(addr.getProtocol()).toBe(protocol)
          expect(addr.getNetworkPrefix()).toBe(network)
          expect(addr.getPayload().toString('hex')).toBe(payload)

          if (Address.isAddressId(addr)) {
            expect(addr.getId()).toBe(string.substring(2))
            expect(addr.toEthAddressHex(true)).toBe(eth)
          }
          if (Address.isAddressDelegated(addr)) expect(addr.getNamespace()).toBe(string.substring(2, string.indexOf(network, 1)))
        })
      })
    })

    describe('From bytes', () => {
      const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, ADDRESSES_VECTOR), 'utf-8')) as AddressTestCase[]

      vectors.forEach(({ string, payload, bytes, protocol, network }, index) => {
        test(`Test case ${index}: 0x${bytes}`, () => {
          const addr = Address.fromBytes(network as NetworkPrefix, Buffer.from(bytes, 'hex'))

          expect(addr.toString()).toBe(string)
          expect(addr.toBytes().toString('hex')).toBe(bytes)

          expect(addr.getProtocol()).toBe(protocol)
          expect(addr.getNetworkPrefix()).toBe(network)
          expect(addr.getPayload().toString('hex')).toBe(payload)

          if (Address.isAddressId(addr)) expect(addr.getId()).toBe(string.substring(2))
          if (Address.isAddressDelegated(addr)) expect(addr.getNamespace()).toBe(string.substring(2, string.indexOf(network, 1)))
        })
      })
    })

    describe('Eth <-> Id Address ', () => {
      const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, ADDRESSES_ETH_VECTOR), 'utf-8')) as AddressEthTestCase[]

      vectors.forEach(({ string, eth }, index) => {
        test(`Test case ${string}: 0x${eth}`, () => {
          const addrId1 = Address.fromEthAddress(NetworkPrefix.Mainnet, eth)

          expect(addrId1.toString()).toBe(string)
          expect(addrId1.toEthAddressHex(true)).toBe(eth)

          const addrId2 = Address.fromString(string)

          expect(addrId2.toString()).toBe(string)
          expect(Address.isAddressId(addrId2)).toBeTruthy()
          if (Address.isAddressId(addrId2)) {
            expect(addrId2.toEthAddressHex(true)).toBe(eth)
          }
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
          expect(addr.getProtocol()).toBe(ProtocolIndicator.ID)
          expect(addr.getNetworkPrefix()).toBe(NetworkPrefix.Testnet)
          expect(Address.isAddressId(addr)).toBeTruthy()
          if (Address.isAddressId(addr)) expect(addr.getId()).toBe('8666')
        })

        test('Mainnet', async () => {
          const addr = Address.fromString('f08666')
          expect(addr.toString()).toBe('f08666')
          expect(addr.toBytes().toString('hex')).toBe('00da43')
          expect(addr.getProtocol()).toBe(ProtocolIndicator.ID)
          expect(addr.getNetworkPrefix()).toBe(NetworkPrefix.Mainnet)
          expect(Address.isAddressId(addr)).toBeTruthy()
          if (Address.isAddressId(addr)) expect(addr.getId()).toBe('8666')
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
            new AddressId(NetworkPrefix.Mainnet, aboveMax.toString())
          }).toThrow(InvalidPayloadLength)
        })

        test('Max allowed value', async () => {
          const max = new BN(2).pow(new BN(63)).sub(new BN(1))
          const addrStr = 'f0' + max.toString()

          const addr = Address.fromString(addrStr)
          expect(addr.toString()).toBe(addrStr)
          expect(addr.toBytes().toString('hex')).toBe('00ffffffffffffffff7f')
          expect(addr.getProtocol()).toBe(ProtocolIndicator.ID)
          expect(addr.getNetworkPrefix()).toBe(NetworkPrefix.Mainnet)
        })
      })

      describe('From bytes', () => {
        test('Testnet', async () => {
          const addr = Address.fromBytes(NetworkPrefix.Testnet, Buffer.from('00da43', 'hex'))
          expect(addr.toString()).toBe('t08666')
          expect(addr.toBytes().toString('hex')).toBe('00da43')
          expect(addr.getProtocol()).toBe(ProtocolIndicator.ID)
          expect(addr.getNetworkPrefix()).toBe(NetworkPrefix.Testnet)
        })

        test('Mainnet', async () => {
          const addr = Address.fromBytes(NetworkPrefix.Mainnet, Buffer.from('00da43', 'hex'))
          expect(addr.toString()).toBe('f08666')
          expect(addr.toBytes().toString('hex')).toBe('00da43')
          expect(addr.getProtocol()).toBe(ProtocolIndicator.ID)
          expect(addr.getNetworkPrefix()).toBe(NetworkPrefix.Mainnet)
        })

        test('Exceed max value', async () => {
          expect(() => {
            Address.fromBytes(NetworkPrefix.Mainnet, Buffer.from('0080808080808080808001', 'hex'))
          }).toThrow(InvalidPayloadLength)
        })

        test('Max allowed value', async () => {
          const addr = Address.fromBytes(NetworkPrefix.Mainnet, Buffer.from('00ffffffffffffffff7f', 'hex'))
          expect(addr.toString()).toBe('f09223372036854775807')
          expect(addr.toBytes().toString('hex')).toBe('00ffffffffffffffff7f')
          expect(addr.getProtocol()).toBe(ProtocolIndicator.ID)
          expect(addr.getNetworkPrefix()).toBe(NetworkPrefix.Mainnet)
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

      test('Masked-id eth address', async () => {
        expect(() => {
          new AddressDelegated(NetworkPrefix.Mainnet, '10', Buffer.from('ff00000000000000000000000000000000000001', 'hex'))
        }).toThrow('masked-id eth addresses not allowed')
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
          const addr = new AddressDelegated(NetworkPrefix.Mainnet, '11', Buffer.from('111111', 'hex'))
          FilEthAddress.fromString(addr.toString())
        }).toThrow()
      })

      test('Wrong eth address', async () => {
        expect(() => {
          const addr = new AddressDelegated(NetworkPrefix.Mainnet, '10', Buffer.from('111111', 'hex'))
          FilEthAddress.fromString(addr.toString())
        }).toThrow()
      })

      test('Masked-id eth address', async () => {
        expect(() => {
          new FilEthAddress(NetworkPrefix.Mainnet, Buffer.from('ff00000000000000000000000000000000000001', 'hex'))
        }).toThrow('masked-id eth addresses not allowed')
      })

      test('Correct eth address', async () => {
        const addr = Address.fromString('f410feot7hrogmplrcupubsdbbqarkdewmb4vkwc5qqq')

        expect(Address.isFilEthAddress(addr)).toBeTruthy()
        if (Address.isFilEthAddress(addr)) {
          expect(addr.getNamespace()).toBe('10')
          expect(addr.getSubAddress().toString('hex')).toBe('23a7f3c5c663d71151f40c8610c01150c9660795')
        }
      })
    })

    describe('Ethereum conversion', () => {
      test('From ethereum address (ID)', async () => {
        const addr = Address.fromEthAddress(NetworkPrefix.Testnet, '0xff00000000000000000000000000000000000001')

        expect(addr.getProtocol()).toBe(ProtocolIndicator.ID)
        expect(addr.getNetworkPrefix()).toBe(NetworkPrefix.Testnet)
        expect(addr.toString()).toBe('t01')
      })

      test('From ethereum address (ID) 2', async () => {
        const addr = Address.fromEthAddress(NetworkPrefix.Testnet, '0xff00000000000000000000000000000000000065')

        expect(addr.getProtocol()).toBe(ProtocolIndicator.ID)
        expect(addr.getNetworkPrefix()).toBe(NetworkPrefix.Testnet)
        expect(addr.toString()).toBe('t0101')
      })

      test('From ethereum address (ID) 3', async () => {
        const addr = Address.fromEthAddress(NetworkPrefix.Testnet, '0xff0000000000000000000000000000000000da43')

        expect(addr.getProtocol()).toBe(ProtocolIndicator.ID)
        expect(addr.getNetworkPrefix()).toBe(NetworkPrefix.Testnet)
        expect(addr.toString()).toBe('t055875')
      })

      test('From ethereum address (ID) 4', async () => {
        const addr = Address.fromEthAddress(NetworkPrefix.Testnet, '0xff00000000000000000000000000000000000a43')

        expect(addr.getProtocol()).toBe(ProtocolIndicator.ID)
        expect(addr.getNetworkPrefix()).toBe(NetworkPrefix.Testnet)
        expect(addr.toString()).toBe('t02627')
      })

      test('From ethereum address (ID) 5', async () => {
        const addr = Address.fromEthAddress(NetworkPrefix.Testnet, '0xff000000000000000000000000000000002ec8fa')

        expect(addr.getProtocol()).toBe(ProtocolIndicator.ID)
        expect(addr.getNetworkPrefix()).toBe(NetworkPrefix.Testnet)
        expect(addr.toString()).toBe('t03066106')
      })

      test('From ethereum address (ID) 6', async () => {
        const addr = Address.fromEthAddress(NetworkPrefix.Testnet, '0xff00000000000000000000000000000000002694')

        expect(addr.getProtocol()).toBe(ProtocolIndicator.ID)
        expect(addr.getNetworkPrefix()).toBe(NetworkPrefix.Testnet)
        expect(addr.toString()).toBe('t09876')
      })

      test('From ethereum address (ID) 7', async () => {
        expect(() => {
          Address.fromEthAddress(NetworkPrefix.Testnet, '0xff00000000000000000000007ffffffffffffff')
        }).toThrow()
      })

      test('From ethereum address (ID) 8', async () => {
        expect(() => {
          Address.fromEthAddress(NetworkPrefix.Testnet, '0xff0000000000000000000000ffffffffffffffff11')
        }).toThrow()
      })

      test('From ethereum address (ID) 9', async () => {
        expect(() => {
          Address.fromEthAddress(NetworkPrefix.Testnet, '0xff0000000000000000000000ffffffffffffffff1')
        }).toThrow()
      })

      test('From ethereum address (ID) 10', async () => {
        expect(() => {
          Address.fromEthAddress(NetworkPrefix.Testnet, '0xff00000000000000000000008FFFFFFFFFFFFFFF')
        }).toThrow()
      })

      test('From ethereum address (ID) - max value', async () => {
        const addr = Address.fromEthAddress(NetworkPrefix.Testnet, '0xff00000000000000000000007FFFFFFFFFFFFFFF')

        expect(addr.getProtocol()).toBe(ProtocolIndicator.ID)
        expect(addr.getNetworkPrefix()).toBe(NetworkPrefix.Testnet)
        expect(addr.toString()).toBe('t09223372036854775807')
      })

      test('To ethereum address (ID)', async () => {
        const addr = Address.fromString('f0101')

        expect(Address.isAddressId(addr)).toBeTruthy()
        if (Address.isAddressId(addr)) {
          expect(addr.toEthAddressHex(true)).toBe('0xff00000000000000000000000000000000000065')
          expect(addr.toEthAddressHex(false)).toBe('ff00000000000000000000000000000000000065')
        }
      })

      test('To ethereum address (ID) - 2', async () => {
        const addr = Address.fromString('f0101')

        expect(Address.isAddressId(addr)).toBeTruthy()
        if (Address.isAddressId(addr)) {
          expect(addr.toEthAddressHex(true)).toBe('0xff00000000000000000000000000000000000065')
          expect(addr.toEthAddressHex(false)).toBe('ff00000000000000000000000000000000000065')
        }
      })

      test('To ethereum address (ID) - 3', async () => {
        const addr = Address.fromString('f0101')

        expect(Address.isAddressId(addr)).toBeTruthy()
        if (Address.isAddressId(addr)) {
          expect(addr.toEthAddressHex(true)).toBe('0xff00000000000000000000000000000000000065')
          expect(addr.toEthAddressHex(false)).toBe('ff00000000000000000000000000000000000065')
        }
      })

      test('From ethereum address (EthFilAddress)', async () => {
        const addr = Address.fromEthAddress(NetworkPrefix.Mainnet, '0xd4c5fb16488aa48081296299d54b0c648c9333da')

        expect(addr.getProtocol()).toBe(ProtocolIndicator.DELEGATED)
        expect(addr.getNetworkPrefix()).toBe(NetworkPrefix.Mainnet)
        expect(addr.toString()).toBe('f410f2tc7wfsirksibajjmkm5ksymmsgjgm62hjnomwa')
      })

      test('From ethereum address (EthFilAddress) - 2', async () => {
        expect(() => {
          const addr = Address.fromEthAddress(NetworkPrefix.Mainnet, '0xd4c5fb16488aa48081296299d54b0c648c9333da00')
        }).toThrow('invalid ethereum address: length should be 20 bytes')
      })

      test('To ethereum address (EthFilAddress)', async () => {
        const addr = Address.fromString('f410f2tc7wfsirksibajjmkm5ksymmsgjgm62hjnomwa')

        expect(addr.getNetworkPrefix()).toBe(NetworkPrefix.Mainnet)
        expect(Address.isFilEthAddress(addr)).toBeTruthy()
        expect(Address.isAddressDelegated(addr)).toBeTruthy()
        if (Address.isFilEthAddress(addr)) {
          expect(addr.toEthAddressHex(true)).toBe('0xd4c5fb16488aa48081296299d54b0c648c9333da')
          expect(addr.toEthAddressHex()).toBe('d4c5fb16488aa48081296299d54b0c648c9333da')
        }
      })
    })
  })
})
