import fs from 'fs'
import path from 'path'

import { NetworkPrefix, Transaction } from '../../../src'
import { TransactionJSON } from '../../../src/artifacts/transaction'

jest.setTimeout(60 * 1000)

const TXS_VECTOR = '../vectors/txs.json'

type TxTestCase = {
  tx: TransactionJSON
  cbor: string
  signature: string
  privateKey: string
  publicKey: string
}

describe('Transaction', () => {
  const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, TXS_VECTOR), 'utf-8')) as TxTestCase[]

  describe('From CBOR encoded', () => {
    vectors.forEach(({ cbor, tx }, i) => {
      test('Tx ' + i, async () => {
        const parseTx = await Transaction.fromCBOR(NetworkPrefix.Mainnet, cbor)

        expect(parseTx.to.toString()).toBe(tx.To)
        expect(parseTx.from.toString()).toBe(tx.From)
        expect(parseTx.gasPremium).toBe(tx.GasPremium)
        expect(parseTx.gasLimit).toBe(tx.GasLimit)
        expect(parseTx.gasFeeCap).toBe(tx.GasFeeCap)
        expect(parseTx.method).toBe(tx.Method)
        expect(parseTx.params).toBe(tx.Params)
        expect(parseTx.nonce).toBe(tx.Nonce)
      })
    })
  })

  describe('From raw JSON', () => {
    vectors.forEach(({ cbor, tx }, i) => {
      test('Tx ' + i, async () => {
        const parseTx = Transaction.fromJSON(tx)
        const serializedTx = await parseTx.serialize()

        expect(serializedTx.toString('hex')).toBe(cbor)
      })
    })
  })
})
