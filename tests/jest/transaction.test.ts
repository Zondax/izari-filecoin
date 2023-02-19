import fs from 'fs'
import path from 'path'

import { Network, Transaction } from '../../src'

const TXS_VECTOR = '../vectors/txs.json'

describe('Transaction', () => {
  const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, TXS_VECTOR), 'utf-8')) as any[]

  describe('From encoded data', () => {
    vectors.forEach(({ cbor, tx }, i) => {
      test('Tx ' + i, async () => {
        const parseTx = await Transaction.parse(Network.Mainnet, cbor)

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
})
