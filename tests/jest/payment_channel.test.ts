import { PaymentChannel } from '../../src/payment'
import { RPC } from '../../src/rpc'
import { Wallet } from '../../src/wallet'
import { SignatureType } from '../../src/artifacts'

jest.setTimeout(60 * 1000)

const nodeUrl = process.env.NODE_RPC_URL
const nodeToken = process.env.NODE_RPC_TOKEN
const mnemonic = process.env.ACCOUNT_MNEMONIC

if (!nodeUrl) throw new Error('NODE_RPC_URL must be defined')
if (!nodeToken) throw new Error('NODE_RPC_TOKEN must be defined')
if (!mnemonic) throw new Error('ACCOUNT_MNEMONIC must be defined')

const sender_path = "44'/461'/0'/0/0" // f1s4oa6y3srhqdulq4e4hijd2lo3izfmzaczxpb6i
const receiver_path = "44'/461'/0'/0/1" // f1tnspiqlb3ga2ft7dwxjc47nw53twttri2vle4ty

describe('Payment channel', () => {
  test('Create channel', async () => {
    const senderAccountData = Wallet.deriveAccount(mnemonic, SignatureType.SECP256K1, sender_path)
    const receiverAccountData = Wallet.deriveAccount(mnemonic, SignatureType.SECP256K1, receiver_path)
    const network = senderAccountData.address.getNetwork()

    const rpcNode = new RPC(network, { url: nodeUrl, token: nodeToken })

    const cid = await PaymentChannel.create(rpcNode, senderAccountData, receiverAccountData.address)
    expect(cid).toBeDefined()
    expect(typeof cid).toBe('string')
  })
})
