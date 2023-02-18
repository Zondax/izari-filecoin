import fs from 'fs'
import path from 'path'

import { Wallet, Network, Address, Transaction } from '../../src'

const WALLET_TEST_CASES_PATH = '../vectors/wallets.json'

type TestCase = {
  mnemonic: string
  addresses: [path: string, address: string][]
}

describe('Wallet', () => {
  test('Generate mnemonic', () => {
    for (let i = 0; i < 100; i++) {
      const data = Wallet.generateMnemonic()
      const words = data.split(' ')
      expect(words.length).toBe(24)
    }
  })

  describe('Derive addresses', () => {
    test('Bip39 mnemonic', () => {
      const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, WALLET_TEST_CASES_PATH), 'utf-8')) as TestCase[]

      vectors.forEach(({ addresses, mnemonic }) => {
        addresses.forEach(([path, address]) => {
          const extendedKey = Wallet.keyDerive(mnemonic, path, undefined)
          expect(extendedKey.address).toBe(address)
          expect(extendedKey.publicKey.length).toBeGreaterThan(0)
          expect(extendedKey.privateKey.length).toBeGreaterThan(0)
        })
      })
    })

    test('Short mnemonic', () => {
      const path = "44'/461'/0'/0/1"
      const extendedKey = Wallet.keyDerive('asadsd', path, undefined)

      expect(extendedKey.address).toBeDefined()
      expect(extendedKey.address.length).toBeGreaterThan(0)
      expect(extendedKey.publicKey.length).toBeGreaterThan(0)
      expect(extendedKey.privateKey.length).toBeGreaterThan(0)
    })

    test('Wrong path', () => {
      expect(() => {
        const mnemonic =
          'raw include ecology social turtle still perfect trip dance food welcome aunt patient very toss very program estate diet portion city camera loop guess'
        const extendedKey = Wallet.keyDerive(mnemonic, 'aaaa', undefined)
      }).toThrow('Expected BIP32Path, got String "aaaa"')
    })
  })

  test('Key recover', () => {
    const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, WALLET_TEST_CASES_PATH), 'utf-8')) as TestCase[]

    vectors.forEach(({ addresses, mnemonic }) => {
      addresses.forEach(([path, address]) => {
        const extendedKey = Wallet.keyDerive(mnemonic, path, undefined)
        const recoveredKey = Wallet.keyRecover(Network.Mainnet, extendedKey.privateKey.toString('base64'))

        expect(extendedKey.address).toStrictEqual(recoveredKey.address)
        expect(extendedKey.publicKey).toStrictEqual(recoveredKey.publicKey)
        expect(extendedKey.privateKey).toStrictEqual(recoveredKey.privateKey)
      })
    })
  })
})
