import { RPC } from '../../src/rpc'
import { SignatureType, Wallet } from '../../src'

jest.setTimeout(60 * 1000)

const nodeUrl = process.env.NODE_RPC_URL
const nodeToken = process.env.NODE_RPC_TOKEN
const mnemonic = process.env.ACCOUNT_MNEMONIC
const sender_path = process.env.SENDER_ACCOUNT_PATH

if (!nodeUrl) throw new Error('NODE_RPC_URL must be defined')
if (!nodeToken) throw new Error('NODE_RPC_TOKEN must be defined')
if (!mnemonic) throw new Error('ACCOUNT_MNEMONIC must be defined')
if (!sender_path) throw new Error('SENDER_ACCOUNT_PATH must be defined')

const TX_TEMPLATE = {
  From: 'REPLACE-ME',
  To: 'REPLACE-ME',
  Value: 'REPLACE-ME',
  Method: 0,
  Params: '',
  Nonce: 'REPLACE-ME',
  GasFeeCap: '0',
  GasPremium: '0',
  GasLimit: 0,
}

describe('Filecoin RPC', () => {
  test('Unauthorized', async () => {
    const rpcNode = new RPC({ url: nodeUrl, token: `${nodeToken}invalid` })
    const response = await rpcNode.getNonce('f410fnw2vjf7s7zk72dmwmvpnuxpgiowkdkehejijqey')

    expect('error' in response).toBe(true)
    expect('error' in response ? response.error.message : null).toBe('401 - Unauthorized')
  })

  test('Get nonce for new account', async () => {
    const rpcNode = new RPC({ url: nodeUrl, token: nodeToken })
    const response = await rpcNode.getNonce('f410fnw2vjf7s7zk72dmwmvpnuxpgiowkdkehejijqey')

    expect('error' in response).toBe(true)
    expect('error' in response ? response.error.message : null).toBe(
      'resolution lookup failed (t410fnw2vjf7s7zk72dmwmvpnuxpgiowkdkehejijqey): resolve address t410fnw2vjf7s7zk72dmwmvpnuxpgiowkdkehejijqey: actor not found'
    )
  })

  test('Get nonce for existing account', async () => {
    const rpcNode = new RPC({ url: nodeUrl, token: nodeToken })
    const response = await rpcNode.getNonce('f410fr5lrinnngtqxl36rqvf6ykjm6tkmqi44ehqpybi')

    expect('error' in response).toBe(false)
    expect('result' in response ? response.result : null).toBeGreaterThan(0)
  })

  test('Get nonce for wrong account', async () => {
    const rpcNode = new RPC({ url: nodeUrl, token: nodeToken })
    const response = await rpcNode.getNonce('f410fr5lrxxxxxxxxl36rqvf6ykjm6tkmqi44ehqpybi')

    expect('error' in response).toBe(true)
    expect('error' in response ? response.error.message : null).toBe(
      "unmarshaling params for 'Filecoin.MpoolGetNonce' (param: *address.Address): invalid address checksum"
    )
  })

  test('Estimate fees for send tx', async () => {
    const address = 'f410fr5lrinnngtqxl36rqvf6ykjm6tkmqi44ehqpybi'

    const rpcNode = new RPC({ url: nodeUrl, token: nodeToken })

    const response = await rpcNode.getNonce(address)
    expect('error' in response).toBe(false)
    if ('error' in response) return

    let tx = { ...TX_TEMPLATE, From: address, To: address, Nonce: response.result, Value: '100000' }
    const fees = await rpcNode.getGasEstimation({ ...tx })

    expect('error' in fees).toBe(false)
    expect('result' in fees).toBe(true)
    if ('result' in fees) {
      const { GasFeeCap, GasPremium, GasLimit } = fees.result
      expect(GasFeeCap).toBeDefined()
      expect(GasFeeCap).toBeDefined()
      expect(GasFeeCap).toBeDefined()
    }
  })

  test('Get balance for account (0 balance)', async () => {
    const rpcNode = new RPC({ url: nodeUrl, token: nodeToken })
    const response = await rpcNode.walletBalance('f410fnw2vjf7s7zk72dmwmvpnuxpgiowkdkehejijqey')

    expect('error' in response).toBe(false)
    expect('result' in response).toBe(true)
    if ('result' in response) expect(response.result).toBe('0')
  })

  test('Get balance for account (some balance)', async () => {
    const senderAccountData = Wallet.deriveAccount(mnemonic, SignatureType.SECP256K1, sender_path)

    const rpcNode = new RPC({ url: nodeUrl, token: nodeToken })
    const response = await rpcNode.walletBalance(senderAccountData.address.toString())

    expect('error' in response).toBe(false)
    expect('result' in response).toBe(true)
    if ('result' in response) expect(response.result).not.toBe('0')
  })

  test('Broadcast new transaction', () => {
    // TODO
    // Need to sign a message first in order to test this
  })
})
