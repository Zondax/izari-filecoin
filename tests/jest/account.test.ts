import { Account } from '../../src/account'
import { RPC } from '../../src/rpc'
import { Wallet } from '../../src/wallet'
import { Token } from '../../src/token'
import { SignatureType } from '../../src/types'

jest.setTimeout(60 * 1000)

const nodeUrl = process.env.NODE_RPC_URL
const nodeToken = process.env.NODE_RPC_TOKEN
const mnemonic = process.env.ACCOUNT_MNEMONIC
const sender_path = process.env.SENDER_ACCOUNT_PATH
const receiver_path = process.env.RECEIVER_ACCOUNT_PATH

if (!nodeUrl) throw new Error('NODE_RPC_URL must be defined')
if (!nodeToken) throw new Error('NODE_RPC_TOKEN must be defined')
if (!mnemonic) throw new Error('ACCOUNT_MNEMONIC must be defined')
if (!sender_path) throw new Error('SENDER_ACCOUNT_PATH must be defined')
if (!receiver_path) throw new Error('RECEIVER_ACCOUNT_PATH must be defined')

describe('Account', () => {
  test('Send', async () => {
    const rpcNode = new RPC({ url: nodeUrl, token: nodeToken })
    const senderAccountData = Wallet.deriveAccount(mnemonic, SignatureType.SECP256K1, sender_path)
    const receiverAccountData = Wallet.deriveAccount(mnemonic, SignatureType.SECP256K1, receiver_path)

    const cid = await Account.send(rpcNode, senderAccountData, receiverAccountData.address, Token.fromAtto('100'))

    expect('error' in cid).toBe(false)
    expect('result' in cid).toBe(true)
    if ('result' in cid) expect(cid.result['/']).toBeDefined()
  })
})
