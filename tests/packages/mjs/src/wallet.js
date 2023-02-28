import { Wallet } from '@zondax/izari-tools/wallet'
import { Transaction } from '@zondax/izari-tools/transaction'
import { Network, SignatureType } from '@zondax/izari-tools/artifacts'

import assert from 'assert'

export async function run() {
  for (let i = 0; i < 100; i++) {
    const data = Wallet.generateMnemonic()
    const words = data.split(' ')
    assert(words.length === 24)
  }

  const account = Wallet.deriveAccount(
    'raw include ecology social turtle still perfect trip dance food welcome aunt patient very toss very program estate diet portion city camera loop guess',
    SignatureType.SECP256K1,
    "44'/461'/0'/0/0",
    undefined
  )

  assert(account.address.toString() === 'f17levgrkmq7jeloew44ixqokvl4qdozvmacidp7i')
  assert(account.type === 1)
  assert(account.path === "44'/461'/0'/0/0")
  assert(account.publicKey.length > 0)
  assert(account.privateKey.length > 0)

  const rawTx = {
    tx: {
      To: 'f099',
      From: 'f1bnjnkzxzicbmhlo4nsgtbos4exostzozuxu26ba',
      Value: '71115',
      Params: '',
      GasFeeCap: '91579',
      GasPremium: '21176',
      GasLimit: 69240,
      Nonce: 6129,
      Method: 7283,
    },
    cbor: '8a0042006355010b52d566f94082c3addc6c8d30ba5c25dd29e5d91917f144000115cb1a00010e7844000165bb430052b8191c7340',
    signature: { data: 'wW6G6jykbQQWL+J8V/TcbmTvgN7e71EM8WxC54nfv5gd1nc0CvPGFND1ndfWmVQ1Fl6W1Liyc3pD4jAYTz/Z9AE=', type: 1 },
    privKey: '/mTHfeTNwxj1EYjBgbk7ZORx5nKe4ShunXXtvVQ58CA=',
  }

  const accountData = Wallet.recoverAccount(Network.Mainnet, 1, rawTx.privKey)
  const signature = await Wallet.signTransaction(accountData, Transaction.fromJSON(rawTx.tx))
  assert(signature.toJSON().Data === rawTx.signature.data)
  assert(signature.toJSON().Type === rawTx.signature.type)
}
