import { AccountData, Cid, PayChActorMethods } from '../artifacts/index.js'
import { Address } from '../address/index.js'
import { RPC } from '../rpc/index.js'
import { Token } from '../token/index.js'
import { Wallet } from '../wallet/index.js'
import { ExecParams, InitActor } from '../actors/init/index.js'
import { ConstructorParams } from '../actors/paymentChannel/index.js'
import { getActorCidsFromNetwork } from '../actors/utils.js'
import { Transaction } from '../transaction/index.js'

/**
 * Payment channels are generally used as a mechanism to increase the scalability of blockchains and enable users to transact without involving
 * (i.e., publishing their transactions on) the blockchain, which: i) increases the load of the system, and ii) incurs gas costs for the user.
 * For more information about payment channels on Filecoin, please refer to the {@link https://spec.filecoin.io/systems/filecoin_token/payment_channels|docs} or this {@link https://www.evernote.com/shard/s10/client/snv?noteGuid=135ecd3b-b743-4f6d-8943-e9c381fbf7df&noteKey=51f2120ace7d6ed6&sn=https%3A%2F%2Fwww.evernote.com%2Fshard%2Fs10%2Fsh%2F135ecd3b-b743-4f6d-8943-e9c381fbf7df%2F51f2120ace7d6ed6&title=Filecoin%2527s%2Bexisting%2Bpayment%2Bchannels%2B-%2BFilecoin%2BRetrieval%2BMarket%2B-%2BConfluence|article}
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
   * Allows to create a new payment channel. It will create a transaction to do it, broadcast it and wait until it gets
   * into a block. Therefore, it will take some time until the network processes the transaction.
   * @param rpc - rpc connection used to interact with the node
   * @param fromAccountData - sender account data, required to sign the transaction
   * @param to - receiver address
   */
  static new = async (rpc: RPC, fromAccountData: AccountData, to: Address): Promise<PaymentChannel> => {
    const cid = await PaymentChannel.create(rpc, fromAccountData, to)
    return await PaymentChannel.newFromCid(rpc, fromAccountData.address, to, cid)
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
    if (to.getNetworkPrefix() !== from.getNetworkPrefix()) throw new Error('both "from" and "to" addressees should belong to the same network')

    // Get payment channel data
    const payChanCid = getActorCidsFromNetwork(rpc.getNetwork()).PaymentChannel
    const payChanParams = await new ConstructorParams(from, to).serialize()

    // Create exec tx to init new actor
    const execParams = new ExecParams(payChanCid, payChanParams)
    const tx = await InitActor.newExecTx(from, Token.zero(), execParams)

    return await PaymentChannel.sendTx(rpc, fromAccountData, tx)
  }

  /**
   * Allows to create a new payment channel instance from the result of a creation transaction previously broadcast to the blockchain.
   * @param rpc - rpc connection used to interact with the node
   * @param from - sender address
   * @param to - receiver address
   * @param cid - id of the transaction to create the payment channel (broadcasted to the network)
   * @returns new PaymentChannel instance
   */
  static newFromCid = async (rpc: RPC, from: Address, to: Address, cid: Cid): Promise<PaymentChannel> => {
    const creationResult = await rpc.waitMsgState({ '/': cid })
    if ('error' in creationResult) throw new Error(creationResult.error.message)
    if (!creationResult.result.ReturnDec) throw new Error('new payment channel address missing')

    const channelAddr = Address.fromString(creationResult.result.ReturnDec.RobustAddress)
    return new PaymentChannel(channelAddr, from, to)
  }

  /**
   * Sets the settlesAt property on the payment channel - a block height after which the channel can’t be updated.
   * @param rpc - rpc connection used to interact with the node
   * @param accountData - whether the sender or receiver can settle the payment channel
   */
  settle = (rpc: RPC, accountData: AccountData): Promise<Cid> => {
    const { address: from } = accountData
    const tx = Transaction.getNew(this.channelAddress, from, Token.zero(), PayChActorMethods.Settle)

    return PaymentChannel.sendTx(rpc, accountData, tx)
  }

  /**
   * After the channel is settled, it can be collected. This causes some value to be sent to receiver and the rest of the channel balance to be returned to sender.
   * @param rpc - rpc connection used to interact with the node
   * @param accountData - whether the sender or receiver can collect the payment channel
   */
  collect = (rpc: RPC, accountData: AccountData): Promise<Cid> => {
    const { address: from } = accountData
    const tx = Transaction.getNew(this.channelAddress, from, Token.zero(), PayChActorMethods.Collect)

    return PaymentChannel.sendTx(rpc, accountData, tx)
  }

  /**
   * Prepare tx to send, sign and broadcast it
   * @param rpc - rpc connection used to interact with the node
   * @param accountData - sender account data, required to sign the tx
   * @param tx - transaction to be signed and broadcast
   * @returns transaction id
   */
  protected static sendTx = async (rpc: RPC, accountData: AccountData, tx: Transaction): Promise<Cid> => {
    await tx.prepareToSend(rpc)

    // Sign tx
    const signature = await Wallet.signTransaction(accountData, tx)

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
