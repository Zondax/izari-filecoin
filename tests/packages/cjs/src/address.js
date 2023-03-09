const { Address } = require('@zondax/izari-tools/address')
const { ProtocolIndicator, Network } = require('@zondax/izari-tools/artifacts')
const assert = require('assert')

function run() {
  const addr = Address.fromString('t08666')
  assert(addr.toString() === 't08666')
  assert(addr.toBytes().toString('hex') === '00da43')
  assert(addr.getProtocol() === ProtocolIndicator.ID)
  assert(addr.getNetwork() === Network.Testnet)
}

module.exports = { run }
