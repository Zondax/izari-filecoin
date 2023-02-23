import * as addressTests from './src/address.js'
import * as walletTests from './src/wallet.js'
import * as transactionTests from './src/transaction.js'

async function test() {
  await addressTests.run()
  await walletTests.run()
  await transactionTests.run()
}

test()
