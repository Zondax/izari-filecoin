import { RPC } from '../src/rpc'

const nodeUrl = process.env.NODE_RPC_URL
const nodeToken = process.env.NODE_RPC_TOKEN
if (!nodeUrl) throw new Error('NODE_RPC_URL must be defined')
if (!nodeToken) throw new Error('NODE_RPC_TOKEN must be defined')

describe('Filecoin RPC', () => {
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

  test('Estimate fees for send tx', () => {
    // TODO
  })

  test('Broadcast new transaction', () => {
    // TODO
  })
})
