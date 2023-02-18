const { Wallet } = require('@zondax/izari-filecoin-tools')
const assert = require('assert')

for (let i = 0; i < 100; i++) {
  const data = Wallet.generateMnemonic()
  const words = data.split(' ')
  assert(words.length === 24)
}

const extendedKey = Wallet.keyDerive(
  'raw include ecology social turtle still perfect trip dance food welcome aunt patient very toss very program estate diet portion city camera loop guess',
  "44'/461'/0'/0/0",
  undefined
)
assert(extendedKey.address === 'f17levgrkmq7jeloew44ixqokvl4qdozvmacidp7i')
assert(extendedKey.publicKey.length > 0)
assert(extendedKey.privateKey.length > 0)
