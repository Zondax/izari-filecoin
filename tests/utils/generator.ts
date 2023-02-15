import fs from 'fs'
import path from 'path'
import glif from '@glif/filecoin-address'

export type TestCase = {
  string: string
  bytes: string
  network: string
  protocol: number
  payload: string
}

function generateAddressTestCases() {
  const txsRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../raw/txs.json'), 'utf-8')) as any
  const txs = txsRaw.data.hyperspace_transactions

  const testCases: TestCase[] = []

  function createTestCase(address: string): TestCase {
    const addr = glif.newFromString(address)
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

  fs.writeFileSync(path.join(__dirname, '../vectors/addresses.json'), JSON.stringify(testCases, null, 2))
}

generateAddressTestCases()
