import fs from 'fs'
import path from 'path'

import { Address } from '../src/address'
import { Network, ProtocolIndicator } from '../src/address/constants'
import { TestCase } from './utils/generator'

describe('Address', () => {
  describe('Vectors', () => {
    describe('From string', () => {
      const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, './vectors/addresses.json'), 'utf-8')) as TestCase[]

      vectors.forEach(({ string, payload, bytes, protocol, network }, index) => {
        test(`Test case ${index}: ${string}`, () => {
          const addr = Address.fromString(string)
          expect(addr.toString()).toBe(string)
          expect(addr.toBytes().toString('hex')).toBe(bytes)
          expect(addr.protocol).toBe(protocol)
          expect(addr.network).toBe(network)
        })
      })
    })

    describe('From bytes', () => {
      const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, './vectors/addresses.json'), 'utf-8')) as TestCase[]

      vectors.forEach(({ string, payload, bytes, protocol, network }, index) => {
        test(`Test case ${index}: 0x${bytes}`, () => {
          const addr = Address.fromBytes(network as Network, Buffer.from(bytes, 'hex'))

          expect(addr.toString()).toBe(string)
          expect(addr.toBytes().toString('hex')).toBe(bytes)
          expect(addr.protocol).toBe(protocol)
          expect(addr.network).toBe(network)
        })
      })
    })
  })

  describe('Manual', () => {
    describe('Type ID', () => {
      test('Testnet', async () => {
        const addr = Address.fromString('t08666')
        expect(addr.toString()).toBe('t08666')
        expect(addr.toBytes().toString('hex')).toBe('00da43')
        expect(addr.protocol).toBe(ProtocolIndicator.ID)
        expect(addr.network).toBe(Network.Testnet)
      })

      test('Mainnet', async () => {
        const addr = Address.fromString('f08666')
        expect(addr.toString()).toBe('f08666')
        expect(addr.toBytes().toString('hex')).toBe('00da43')
        expect(addr.protocol).toBe(ProtocolIndicator.ID)
        expect(addr.network).toBe(Network.Mainnet)
      })
    })
  })
})
