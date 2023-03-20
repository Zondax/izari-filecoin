const { Address } = require('@zondax/izari-filecoin/address')
const { ProtocolIndicator, NetworkPrefix } = require('@zondax/izari-filecoin/artifacts')
const assert = require('assert')

function run() {
  const addr = Address.fromString('t08666')
  assert(addr.toString() === 't08666')
  assert(addr.toBytes().toString('hex') === '00da43')
  assert(addr.getProtocol() === ProtocolIndicator.ID)
  assert(addr.getNetworkPrefix() === NetworkPrefix.Testnet)
}

module.exports = { run }
