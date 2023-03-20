import { AccountData, ActorsV13, Cid } from '../artifacts/index.js'
import { Address } from '../address/index.js'
import { RPC } from '../rpc/index.js'
import { Token } from '../token/index.js'
import { Wallet } from '../wallet/index.js'
import { InitActor, ExecParams } from '../actors/init/index'
import { ConstructorParams } from '../actors/paymentChannel'

/**
 * Payment channels are generally used as a mechanism to increase the scalability of blockchains and enable users to transact without involving
 * (i.e., publishing their transactions on) the blockchain, which: i) increases the load of the system, and ii) incurs gas costs for the user.
 * For more information about payment channels on Filecoin, please refer to this {@link https://spec.filecoin.io/systems/filecoin_token/payment_channels|link}
 */
export class PaymentChannel {
  /**
   * Create new PaymentChannel instance from raw data
   * @param channelAddress - payment channel address
   * @param from - payment channel sender address
   * @param to - payment channel receiver address
   */
  constructor(protected channelAddress: Address, protected from: Address, protected to: Address) {}

  /**
   * Getter for payment channel address
   */
  getAddress = (): Address => this.channelAddress

  /**
   * Getter for payment channel receiver address
   */
  getTo = (): Address => this.to

  /**
   * Getter for payment channel sender address
   */
  getFrom = (): Address => this.from

  /**
   * Allows to create a new payment channel. It will crate a transaction to do it, broadcast it and wait until it gets
   * into a block. Therefore, it will take some time until the network processes the transaction.
   * @param rpc - rpc connection used to interact with the node
   * @param fromAccountData - sender account data, required to sign the transaction
   * @param to - receiver address
   */
  static new = async (rpc: RPC, fromAccountData: AccountData, to: Address): Promise<PaymentChannel> => {
    const from = fromAccountData.address
    const cid = await PaymentChannel.create(rpc, fromAccountData, to)

    // Wait for tx to be processed
    const response2 = await rpc.waitMsgState({ '/': cid })
    if ('error' in response2) throw new Error(response2.error.message)

    if (!response2.result.ReturnDec) throw new Error('new payment channel address missing')

    const channelAddr = Address.fromString(response2.result.ReturnDec.IDAddress)
    return new PaymentChannel(channelAddr, from, to)
  }

  /**
   * Allows to create a broadcast a transaction to create a new payment channel. It will not wait the tx to be processed.
   * It will just return the transaction cid. In order to create a PaymentChannel instance, the channel address
   * must be fetched, which implies we should wait until the tx gets into a block.
   * @param rpc - rpc connection used to interact with the node
   * @param fromAccountData - sender account data, required to sign the transaction
   * @param to - receiver address
   */
  static create = async (rpc: RPC, fromAccountData: AccountData, to: Address): Promise<Cid> => {
    const { address: from } = fromAccountData
    if (to.getNetwork() !== from.getNetwork()) throw new Error('both "from" and "to" addressees should belong to the same network')

    const payChan = await new ConstructorParams(from, to).serialize()
    const execParams = new ExecParams(ActorsV13.PaymentChannel, payChan)
    const tx = await InitActor.newExecTx(from, Token.zero(), execParams)
    await tx.prepareToSend(rpc)

    // Sign tx
    const signature = await Wallet.signTransaction(fromAccountData, tx)

    // Broadcast tx
    const response1 = await rpc.broadcastTransaction(tx, signature)
    if ('error' in response1) throw new Error(response1.error.message)

    // return the tx cid
    return response1.result['/']
  }

  /*
  static createVoucher = async (
    timeLockMin: string,
    timeLockMax: string,
    amount: string,
    lane: string,
    nonce: string,
    minSettleHeight: string
  ): Promise<string> => {
    const cbor: IpldDagCbor = await waitFor<IpldDagCbor>(() => globalCbor)

    const voucher = [timeLockMin, timeLockMax, Buffer.alloc(0), null, lane, nonce, amount, minSettleHeight, [], Buffer.alloc(0)]

    const serializedVoucher = cbor.encode(voucher)

    return Buffer.from(serializedVoucher).toString('base64')
  }*/
}
