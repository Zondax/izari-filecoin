import { Address, Network, RPC, SignatureType, Transaction, Wallet } from '../../src'

jest.setTimeout(240 * 1000)

const networkStr = process.env.NETWORK
const nodeUrl = process.env.NODE_RPC_URL
const nodeToken = process.env.NODE_RPC_TOKEN
const mnemonic = process.env.ACCOUNT_MNEMONIC
const sender_path = process.env.SENDER_ACCOUNT_PATH

if (!networkStr) throw new Error('NETWORK must be defined')
if (!nodeUrl) throw new Error('NODE_RPC_URL must be defined')
if (!nodeToken) throw new Error('NODE_RPC_TOKEN must be defined')
if (!mnemonic) throw new Error('ACCOUNT_MNEMONIC must be defined')
if (!sender_path) throw new Error('SENDER_ACCOUNT_PATH must be defined')

const network = networkStr == 'mainnet' ? Network.Mainnet : Network.Testnet

const normalizeAddressByNetwork = (currentNet: Network, add: string) => `${currentNet}${add.slice(1)}`

describe('Filecoin RPC', () => {
  test('Unauthorized', async () => {
    const addrStr = normalizeAddressByNetwork(network, 'f410fnw2vjf7s7zk72dmwmvpnuxpgiowkdkehejijqey')
    const addr = Address.fromString(addrStr)

    const rpcNode = new RPC(network, { url: nodeUrl, token: `${nodeToken}invalid` })
    const response = await rpcNode.getNonce(addr)

    expect('error' in response).toBe(true)
    expect('error' in response ? response.error.message : null).toBe('401 - Unauthorized')
  })

  test('Get nonce for new account', async () => {
    const addrStr = normalizeAddressByNetwork(network, 'f410fnw2vjf7s7zk72dmwmvpnuxpgiowkdkehejijqey')
    const addr = Address.fromString(addrStr)
    const rpcNode = new RPC(network, { url: nodeUrl, token: nodeToken })
    const response = await rpcNode.getNonce(addr)

    expect('error' in response).toBe(true)
    expect('error' in response ? response.error.message : null).toBe(`resolution lookup failed (${addrStr}): resolve address ${addrStr}: actor not found`)
  })

  test('Get nonce for existing account', async () => {
    const addrStr = normalizeAddressByNetwork(network, 'f16evrgvbuk3htf44rrp647zrwzuglk4ynoiivvgi')
    const addr = Address.fromString(addrStr)

    const rpcNode = new RPC(network, { url: nodeUrl, token: nodeToken })
    const response = await rpcNode.getNonce(addr)

    expect('error' in response).toBe(false)
    expect('result' in response ? response.result : null).toBeGreaterThan(0)
  })

  test('Estimate fees for send tx', async () => {
    const addrStr = normalizeAddressByNetwork(network, 'f16evrgvbuk3htf44rrp647zrwzuglk4ynoiivvgi')
    const address = Address.fromString(addrStr)

    const rpcNode = new RPC(network, { url: nodeUrl, token: nodeToken })

    const response = await rpcNode.getNonce(address)
    expect('error' in response).toBe(false)
    if ('error' in response) return

    const tx = Transaction.getNew(address, address, '100000', 0)
    tx.nonce = response.result

    const fees = await rpcNode.getGasEstimation(tx)

    expect('error' in fees).toBe(false)
    expect('result' in fees).toBe(true)
    if ('result' in fees) {
      const { GasFeeCap, GasPremium, GasLimit } = fees.result
      expect(GasFeeCap).toBeDefined()
      expect(GasPremium).toBeDefined()
      expect(GasLimit).toBeDefined()
    }
  })

  test('Get balance for account (0 balance)', async () => {
    const addrStr = normalizeAddressByNetwork(network, 'f410fnw2vjf7s7zk72dmwmvpnuxpgiowkdkehejijqey')
    const addr = Address.fromString(addrStr)

    const rpcNode = new RPC(network, { url: nodeUrl, token: nodeToken })
    const response = await rpcNode.walletBalance(addr)

    expect('error' in response).toBe(false)
    expect('result' in response).toBe(true)
    if ('result' in response) expect(response.result).toBe('0')
  })

  test('Get balance for account (some balance)', async () => {
    const senderAccountData = Wallet.deriveAccount(mnemonic, SignatureType.SECP256K1, sender_path, '', network)

    const rpcNode = new RPC(network, { url: nodeUrl, token: nodeToken })
    const response = await rpcNode.walletBalance(senderAccountData.address)

    expect('error' in response).toBe(false)
    expect('result' in response).toBe(true)
    if ('result' in response) expect(response.result).not.toBe('0')
  })

  test('List miners', async () => {
    const rpcNode = new RPC(network, { url: nodeUrl, token: nodeToken })
    const response = await rpcNode.listMiners()

    expect('error' in response).toBe(false)
    expect('result' in response).toBe(true)
    if ('result' in response) {
      expect(typeof response.result).toBe('object')
      expect(response.result.length).toBeGreaterThan(0)
    }
  })

  test('Get miner info', async () => {
    const rpcNode = new RPC(network, { url: nodeUrl, token: nodeToken })

    const response1 = await rpcNode.listMiners()
    expect('error' in response1).toBe(false)
    if ('error' in response1) throw new Error(response1.error.message)

    const response2 = await rpcNode.getMinerInfo(response1.result[0])
    expect('error' in response2).toBe(false)
    expect('result' in response2).toBe(true)

    if ('result' in response2) {
      const { Owner, Worker, PeerId } = response2.result
      expect(PeerId).toBeDefined()
      expect(Owner).toBeDefined()
      expect(Worker).toBeDefined()
    }
  })

  test('Ask for storage to a miner', async () => {
    const rpcNode = new RPC(network, { url: nodeUrl, token: nodeToken })

    const response1 = await rpcNode.listMiners()
    expect('error' in response1).toBe(false)
    if ('error' in response1) throw new Error(response1.error.message)

    const response2 = await rpcNode.getMinerInfo(response1.result[0])
    expect('error' in response2).toBe(false)
    if ('error' in response2) throw new Error(response2.error.message)

    const response = await rpcNode.askForStorage(response1.result[0], response2.result.PeerId)

    expect('error' in response).toBe(false)
    expect('result' in response).toBe(true)
    if ('result' in response) {
      const { Response, DealProtocols } = response.result
      const { Miner, Price, VerifiedPrice, MaxPieceSize, MinPieceSize } = Response

      expect(Miner).toBeDefined()
      expect(Price).toBeDefined()
      expect(VerifiedPrice).toBeDefined()
      expect(MinPieceSize).toBeDefined()
      expect(MaxPieceSize).toBeDefined()

      expect(DealProtocols.length).toBeGreaterThan(0)
    }
  })
})
