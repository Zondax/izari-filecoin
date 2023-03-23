import { Address } from '../address/index.js'
import { Token } from '../token/index.js'
import { Transaction } from '../transaction/index.js'
import { AccountData, Cid, Methods } from '../artifacts/index.js'
import { Wallet } from '../wallet/index.js'
import { RPC } from '../rpc/index.js'

/**
 * Group functions related to accounts, like transferring funds from one account to another, fetch account balances, and much more.
 */
export class Account {
  /**
   * Allows to transfer some funds from one account to another in an easy and straightforward way.
   * @param nodeRpc - rpc connection used to interact with the node
   * @param fromAccount - sender account data, required to sign the transaction
   * @param to - receiver address
   * @param value - amount of tokens to be transferred
   * @returns the id of the transaction broadcast to the network
   */
  static send = async (nodeRpc: RPC, fromAccount: AccountData, to: Address, value: Token): Promise<Cid> => {
    if (value.isNegative()) throw new Error('value cannot be negative')
    if (value.isZero()) throw new Error('value cannot be zero')

    const method = Address.isFilEthAddress(to) ? Methods.InvokeEVM : Methods.Transfer

    const tx = Transaction.getNew(to, fromAccount.address, value, method)
    await tx.prepareToSend(nodeRpc)

    const signature = await Wallet.signTransaction(fromAccount, tx)

    const response = await nodeRpc.broadcastTransaction(tx, signature)
    if ('error' in response) throw new Error(response.error.message)

    return response.result['/']
  }

  /**
   * Allow to fetch the current balance of a given account
   * @param nodeRpc - rpc connection to broadcast used to interact with the node
   * @param account - account data required to sign the get the address to fetch the balance
   * @returns the current account balance
   */
  static getBalance = async (nodeRpc: RPC, account: Pick<AccountData, 'address'>): Promise<Token> => {
    const response = await nodeRpc.walletBalance(account.address)
    if ('error' in response) throw new Error(response.error.message)

    return Token.fromAtto(response.result)
  }
}
