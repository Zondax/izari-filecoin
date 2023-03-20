import { Account } from '../../src/account'
import { Address } from '../../src/address'
import { RPC } from '../../src/rpc'
import { Wallet } from '../../src/wallet'
import { Token } from '../../src/token'
import { Network, SignatureType } from '../../src/artifacts'

jest.setTimeout(60 * 1000)

const networkStr = process.env.NETWORK
const nodeUrl = process.env.NODE_RPC_URL
const nodeToken = process.env.NODE_RPC_TOKEN
const mnemonic = process.env.ACCOUNT_MNEMONIC
const sender_path = process.env.SENDER_ACCOUNT_PATH
const receiver_path = process.env.RECEIVER_ACCOUNT_PATH

if (!networkStr) throw new Error('NETWORK must be defined')
if (!nodeUrl) throw new Error('NODE_RPC_URL must be defined')
if (!nodeToken) throw new Error('NODE_RPC_TOKEN must be defined')
if (!mnemonic) throw new Error('ACCOUNT_MNEMONIC must be defined')
if (!sender_path) throw new Error('SENDER_ACCOUNT_PATH must be defined')
if (!receiver_path) throw new Error('RECEIVER_ACCOUNT_PATH must be defined')

const network = networkStr == 'mainnet' ? Network.Mainnet : Network.Testnet

describe('Account', () => {
  test('Send', async () => {
    const senderAccountData = Wallet.deriveAccount(mnemonic, SignatureType.SECP256K1, sender_path, '', network)
    const receiverAccountData = Wallet.deriveAccount(mnemonic, SignatureType.SECP256K1, receiver_path, '', network)

    const rpcNode = new RPC(network, { url: nodeUrl, token: nodeToken })

    const cid = await Account.send(rpcNode, senderAccountData, receiverAccountData.address, Token.fromAtto('100'))
    expect(cid).toBeDefined()
    expect(typeof cid).toBe('string')

    // Wait until the tx is confirmed
    await rpcNode.waitMsgState({ '/': cid })
  })

  test('Send to t410 (eth address)', async () => {
    const senderAccountData = Wallet.deriveAccount(mnemonic, SignatureType.SECP256K1, sender_path, '', network)
    const receiverAddress = Address.fromEthAddress(network, '0x689c9B3232210aa9B84Ef444D0Ef35D11102AD1F')

    const rpcNode = new RPC(network, { url: nodeUrl, token: nodeToken })

    const cid = await Account.send(rpcNode, senderAccountData, receiverAddress, Token.fromAtto('100'))
    expect(cid).toBeDefined()
    expect(typeof cid).toBe('string')

    // Wait until the tx is confirmed
    await rpcNode.waitMsgState({ '/': cid })
  })

  test('Balance', async () => {
    const senderAccountData = Wallet.deriveAccount(mnemonic, SignatureType.SECP256K1, sender_path, '', network)

    const rpcNode = new RPC(network, { url: nodeUrl, token: nodeToken })

    const balance = await Account.getBalance(rpcNode, senderAccountData)
    expect(balance.gt(Token.zero())).toBeTruthy()
  })
})
