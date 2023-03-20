import { PaymentChannel } from '../../src/payment'
import { RPC } from '../../src/rpc'
import { Wallet } from '../../src/wallet'
import { SignatureType } from '../../src/artifacts'
import { getNetworkPrefix, validateNetwork } from '../../src/address/utils'

jest.setTimeout(120 * 1000)

const network = process.env.NETWORK
const nodeUrl = process.env.NODE_RPC_URL
const nodeToken = process.env.NODE_RPC_TOKEN
const mnemonic = process.env.ACCOUNT_MNEMONIC

if (!network) throw new Error('NETWORK must be defined')
if (!nodeUrl) throw new Error('NODE_RPC_URL must be defined')
if (!nodeToken) throw new Error('NODE_RPC_TOKEN must be defined')
if (!mnemonic) throw new Error('ACCOUNT_MNEMONIC must be defined')

const sender_path = "44'/461'/0'/0/1" // f1ovlkmtnqji7wrvdpcys3i22c62obbamgokmg35q
const receiver_path = "44'/461'/0'/0/2" // f1pnc33cba2c2a3olqadho7wiohyosbkl3upescei

if (!validateNetwork(network)) throw new Error('invalid network')
const networkPrefix = getNetworkPrefix(network)

describe('Payment channel', () => {
  test('New (broadcast and wait)', async () => {
    const senderAccountData = Wallet.deriveAccount(mnemonic, SignatureType.SECP256K1, sender_path, '', networkPrefix)
    const receiverAccountData = Wallet.deriveAccount(mnemonic, SignatureType.SECP256K1, receiver_path, '', networkPrefix)

    const rpcNode = new RPC(network, { url: nodeUrl, token: nodeToken })

    const pyChannel = await PaymentChannel.new(rpcNode, senderAccountData, receiverAccountData.address)
    expect(pyChannel.getAddress()).toBeDefined()
    expect(pyChannel.getFrom()).toBeDefined()
    expect(pyChannel.getTo()).toBeDefined()
  })

  test('Create (only broadcast)', async () => {
    const senderAccountData = Wallet.deriveAccount(mnemonic, SignatureType.SECP256K1, sender_path, '', networkPrefix)
    const receiverAccountData = Wallet.deriveAccount(mnemonic, SignatureType.SECP256K1, receiver_path, '', networkPrefix)

    const rpcNode = new RPC(network, { url: nodeUrl, token: nodeToken })

    const cid = await PaymentChannel.create(rpcNode, senderAccountData, receiverAccountData.address)
    expect(cid).toBeDefined()
    expect(typeof cid).toBe('string')
  })
})
