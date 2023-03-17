import { IpldDagCbor } from '../external/dag-cbor.js'
import { Multiformats } from '../external/multiformats.js'
import { waitFor } from '../utils/sleep.js'
import { ActorsV10, SystemActorIDs, AccountData, ActorsV13, Cid } from '../artifacts/index.js'
import { Address, AddressId } from '../address/index.js'
import { Transaction } from '../transaction'
import { RPC } from '../rpc/index.js'
import { Token } from '../token/index.js'
import { Wallet } from '../wallet/index.js'

// Loading this module dynamically as it has no support to CJS
// The only way to keep CJS supported on our side is to load it dynamically
// The interface IpldDagCbor has been copied from the repo itself
let globalCbor: IpldDagCbor | undefined
import('@ipld/dag-cbor')
  .then(localCbor => {
    globalCbor = localCbor
  })
  .catch(e => {
    throw e
  })

let globalMultiformats: Multiformats | undefined
import('multiformats')
  .then(localMultiformats => {
    globalMultiformats = localMultiformats
  })
  .catch(e => {
    throw e
  })

export class PaymentChannel {
  static create = async (rpc: RPC, fromAccountData: AccountData, to: Address): Promise<Cid> => {
    const from = fromAccountData.address
    if (to.getNetwork() !== from.getNetwork()) throw new Error('both "from" and "to" addressees should belong to the same network')

    // Load ESM only packages
    const cbor: IpldDagCbor = await waitFor<IpldDagCbor>(() => globalCbor)
    const multiformats: Multiformats = await waitFor<Multiformats>(() => globalMultiformats)

    // Create constructor arguments for new payment channel
    const paymentChannelParams = [from.toBytes(), to.toBytes()]

    // Create constructor arguments for init actor
    const constructorParams = [multiformats.CID.parse(ActorsV13.PaymentChannel), cbor.encode(paymentChannelParams)]

    // Serialize params to cbor
    const serialized = cbor.encode(constructorParams)

    const initActor = new AddressId(rpc.getNetwork(), SystemActorIDs.Init.toString())

    const tx = Transaction.getNew(initActor, from, Token.zero(), 2, Buffer.from(serialized))
    await tx.prepareToSend(rpc)

    const signature = await Wallet.signTransaction(fromAccountData, tx)

    const response = await rpc.broadcastTransaction(tx, signature)
    if ('error' in response) throw new Error(response.error.message)

    return response.result['/']
  }

  static createVoucher = async (
    timeLockMin: string,
    timeLockMax: string,
    amount: string,
    lane: string,
    nonce: string,
    minSettleHeight: string
  ): Promise<string> => {
    const cbor: IpldDagCbor = await waitFor<IpldDagCbor>(() => globalCbor)

    let voucher = [timeLockMin, timeLockMax, Buffer.alloc(0), null, lane, nonce, amount, minSettleHeight, [], Buffer.alloc(0)]

    let serializedVoucher = cbor.encode(voucher)

    return Buffer.from(serializedVoucher).toString('base64')
  }
}
