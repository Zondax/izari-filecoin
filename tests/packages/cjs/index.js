const addressTests = require('./src/address.js')
const walletTests = require('./src/wallet.js')
const transactionTests = require('./src/transaction.js')

async function test() {
  await addressTests.run()
  await walletTests.run()
  await transactionTests.run()
}

test()
