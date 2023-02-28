import fs from 'fs'
import path from 'path'

import { Network, Transaction, Wallet } from '../../src'
import { TransactionJSON, SignatureType } from '../../src/artifacts'

jest.setTimeout(60 * 1000)

const WALLET_TEST_CASES_PATH = './vectors/wallets.json'
const TXS_TEST_CASES_PATH = './vectors/txs.json'

type WalletTestCase = {
  mnemonic: string
  addresses: [type: number, path: string, address: string][]
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
        addresses.forEach(([type, path, address]) => {
          const account = Wallet.deriveAccount(mnemonic, type, path)

          expect(account.address.toString()).toBe(address)
          expect(account.publicKey.length).toBeGreaterThan(0)
          expect(account.privateKey.length).toBeGreaterThan(0)
          expect(account.path).toBe(path)
        })
      })
    })

    test('Short mnemonic', () => {
      const path = "44'/461'/0'/0/1"
      const account = Wallet.deriveAccount('asadsd', SignatureType.SECP256K1, path)

      expect(account.address).toBeDefined()
      expect(account.address.toBytes().length).toBeGreaterThan(0)
      expect(account.publicKey.length).toBeGreaterThan(0)
      expect(account.privateKey.length).toBeGreaterThan(0)
      expect(account.path).toBe(path)
    })

    test('Wrong path', () => {
      expect(() => {
        const mnemonic =
          'raw include ecology social turtle still perfect trip dance food welcome aunt patient very toss very program estate diet portion city camera loop guess'
        const extendedKey = Wallet.deriveAccount(mnemonic, SignatureType.SECP256K1, 'aaaa')
      }).toThrow('Expected BIP32Path, got String "aaaa"')
    })
  })

  test('Key recover', () => {
    const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, WALLET_TEST_CASES_PATH), 'utf-8')) as WalletTestCase[]

    vectors.forEach(({ addresses, mnemonic }) => {
      addresses.forEach(([type, path, address]) => {
        const account = Wallet.deriveAccount(mnemonic, type, path)
        const recoveredAccount = Wallet.recoverAccount(Network.Mainnet, type, account.privateKey.toString('base64'))

        expect(recoveredAccount.address.toString()).toBe(account.address.toString())
        expect(recoveredAccount.publicKey).toStrictEqual(account.publicKey)
        expect(recoveredAccount.privateKey).toStrictEqual(account.privateKey)
      })
    })
  })

  describe('Sign transactions', () => {
    const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, TXS_TEST_CASES_PATH), 'utf-8')) as TxTestCase[]

    describe('From raw JSON', () => {
      vectors.forEach(({ tx: txJSON, signature, privKey }, i) => {
        test('Tx ' + i, async () => {
          const tx = Transaction.fromJSON(txJSON)
          const account = Wallet.recoverAccount(Network.Mainnet, signature.type, privKey)
          const sig = await Wallet.signTransaction(account, tx)

          expect(sig.toJSON().Data).toBe(signature.data)
          expect(sig.toJSON().Type).toBe(signature.type)
        })
      })
    })

    describe('From CBOR encoded', () => {
      vectors.forEach(({ cbor, signature, privKey }, i) => {
        test('Tx ' + i, async () => {
          const tx = await Transaction.fromCBOR(Network.Mainnet, cbor)
          const account = Wallet.recoverAccount(Network.Mainnet, signature.type, privKey)
          const sig = await Wallet.signTransaction(account, tx)

          expect(sig.toJSON().Data).toBe(signature.data)
          expect(sig.toJSON().Type).toBe(signature.type)
        })
      })
    })
  })
})
