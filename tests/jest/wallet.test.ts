import fs from 'fs'
import path from 'path'

import { Network, Transaction, Wallet } from '../../src'
import { TransactionJSON } from '../../src/transaction/types'

const WALLET_TEST_CASES_PATH = './vectors/wallets.json'
const TXS_TEST_CASES_PATH = './vectors/txs.json'

type WalletTestCase = {
  mnemonic: string
  addresses: [path: string, address: string][]
}

type TxTestCase = {
  tx: TransactionJSON
  cbor: string
  signature: {
    data: string
    type: number
  }
  privKey: string
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
      const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, WALLET_TEST_CASES_PATH), 'utf-8')) as WalletTestCase[]

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
    const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, WALLET_TEST_CASES_PATH), 'utf-8')) as WalletTestCase[]

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

  describe('Sign transactions', () => {
    const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, TXS_TEST_CASES_PATH), 'utf-8')) as TxTestCase[]

    describe('From raw JSON', () => {
      vectors.forEach(({ tx: txJSON, signature, privKey }, i) => {
        test('Tx ' + i, async () => {
          const tx = Transaction.fromJSON(txJSON)
          const sig = await Wallet.signTransaction(privKey, tx)

          expect(sig.Data).toBe(signature.data)
          expect(sig.Type).toBe(signature.type)
        })
      })
    })

    describe('From CBOR encoded', () => {
      vectors.forEach(({ cbor, signature, privKey }, i) => {
        test('Tx ' + i, async () => {
          const tx = await Transaction.fromCBOR(Network.Mainnet, cbor)
          const sig = await Wallet.signTransaction(privKey, tx)

          expect(sig.Data).toBe(signature.data)
          expect(sig.Type).toBe(signature.type)
        })
      })
    })
  })
})
