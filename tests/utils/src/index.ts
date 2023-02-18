import fs from 'fs'
import path from 'path'

import glif from '@glif/filecoin-address'
import * as fst from '@zondax/filecoin-signing-tools/js'

export type AddressTestCase = {
  string: string
  bytes: string
  network: string
  protocol: number
  payload: string
}

export type TransactionJSON = {
  To: string
  From: string
  Nonce: number
  Value: string
  GasLimit: number
  GasFeeCap: string
  GasPremium: string
  Method: number
  Params: string
}

export type TxTestCase = {
  tx: TransactionJSON
  cbor: string
  signature: string
  privKey: string
}

const RAW_TXS_FILE_PATH = './raw/txs.json'
const ADDRESSES_VECTOR_FILE_PATH = './output/addresses.json'
const TXS_VECTOR_FILE_PATH = './output/txs.json'

function generateAddresses() {
  const txsRaw = JSON.parse(fs.readFileSync(path.join(RAW_TXS_FILE_PATH), 'utf-8')) as any
  const txs = txsRaw.data.hyperspace_transactions

  const testCases: AddressTestCase[] = []

  function createTestCase(address: string): AddressTestCase {
    const addr = glif.newFromString(address)

    // TODO remove this when glif has fixed this bug (they are padding encoded namespace when they should not)
    const payload = Buffer.from(addr.payload()).toString('hex').replace('000000000000000a', '0a')
    const bytes = Buffer.from(addr.bytes).toString('hex').replace('04000000000000000a', '040a')

    return {
      string: address,
      bytes: bytes,
      network: addr.network(),
      protocol: addr.protocol(),
      payload: payload,
    }
  }

  for (let i in txs) {
    const { tx_from, tx_to } = txs[i]
    if (tx_from) testCases.push(createTestCase(tx_from))
    if (tx_to) testCases.push(createTestCase(tx_to))
  }

  fs.writeFileSync(path.join(ADDRESSES_VECTOR_FILE_PATH), JSON.stringify(testCases, null, 2))
}

function generateTransactions() {
  const txsRaw = JSON.parse(fs.readFileSync(path.join(RAW_TXS_FILE_PATH), 'utf-8')) as any
  const txs = txsRaw.data.hyperspace_transactions

  const mnemonic =
    'bundle hour bird man lyrics glare shrug pepper leader better illegal expect outdoor duck crew universe amount language model cabbage inhale shine accident inmate'

  const keys = []
  for (let i = 0; i < 10; i++) keys.push(fst.keyDerive(mnemonic, "44'/461'/1'/0/" + i, ''))

  const testCases: TxTestCase[] = []

  for (let i in txs) {
    const key = keys[Math.round(Math.random() * 10) % keys.length]
    const { tx_from, tx_to } = txs[i]
    if (tx_from || tx_to) {
      const tx = {
        To: tx_to || tx_from,
        From: keys[0].address,
        Value: parseInt((Math.random() * 100000).toString()).toString(),
        Params: '',
        GasFeeCap: parseInt((Math.random() * 100000).toString()).toString(),
        GasPremium: parseInt((Math.random() * 100000).toString()).toString(),
        GasLimit: parseInt((Math.random() * 100000).toString()),
        Nonce: parseInt((Math.random() * 100000).toString()),
        Method: parseInt((Math.random() * 100000).toString()),
      }
      const cbor = fst.transactionSerialize(tx)
      const privKey = key.privateKey.toString('base64')
      const signature = fst.transactionSignRaw(tx, privKey).toString('hex')

      testCases.push({ tx, cbor, signature, privKey })
    }
  }

  fs.writeFileSync(path.join(TXS_VECTOR_FILE_PATH), JSON.stringify(testCases, null, 2))
}

generateAddresses()
generateTransactions()
