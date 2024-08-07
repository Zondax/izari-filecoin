import { Transaction } from '@zondax/izari-filecoin/transaction'
import { NetworkPrefix } from '@zondax/izari-filecoin/artifacts'
import assert from 'assert'

export async function run() {
  const tx = await Transaction.fromCBOR(
    NetworkPrefix.Mainnet,
    '8a0042006355013bfb6c6d897dc4104539164b155378463cdc5faa197c58440001733519cbac4400011d0f4300028f1a0001257e40'
  )
  assert(tx.to.toString() === 'f099')
  assert(tx.from.toString() === 'f1hp5wy3mjpxcbarjzczfrku3yiy6nyx5kej4fwei')
  assert(tx.value === '95029')
  assert(tx.gasFeeCap === '72975')
  assert(tx.gasPremium === '655')
  assert(tx.gasLimit === 52140)
  assert(tx.nonce === 31832)
  assert(tx.method === 75134)
}
