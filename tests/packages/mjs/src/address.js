import { Address, ProtocolIndicator, Network, AddressDelegated } from '@zondax/izari-filecoin-tools'
import assert from 'assert'

export async function run() {
  const addr = Address.fromString('t08666')
  assert(addr.toString() === 't08666')
  assert(addr.toBytes().toString('hex') === '00da43')
  assert(addr.protocol === ProtocolIndicator.ID)
  assert(addr.network === Network.Testnet)
}
