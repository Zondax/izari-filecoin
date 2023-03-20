import { Address } from '@zondax/izari-filecoin/address'
import { ProtocolIndicator, NetworkPrefix } from '@zondax/izari-filecoin/artifacts'
import assert from 'assert'

export async function run() {
  const addr = Address.fromString('t08666')
  assert(addr.toString() === 't08666')
  assert(addr.toBytes().toString('hex') === '00da43')
  assert(addr.getProtocol() === ProtocolIndicator.ID)
  assert(addr.getNetworkPrefix() === NetworkPrefix.Testnet)
}
