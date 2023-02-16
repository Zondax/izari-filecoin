import { Address, ProtocolIndicator, Network, Wallet } from '@zondax/izari-filecoin-tools'
import assert from 'assert'

const addr = Address.fromString('t08666')
assert(addr.toString() === 't08666')
assert(addr.toBytes().toString('hex') === '00da43')
assert(addr.protocol === ProtocolIndicator.ID)
assert(addr.network === Network.Testnet)

for (let i = 0; i < 100; i++) {
  const data = Wallet.generateMnemonic()
  const words = data.split(' ')
  assert(words.length === 24)
}
