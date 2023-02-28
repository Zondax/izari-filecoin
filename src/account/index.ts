import { Address } from '../address/index.js'
import { Token } from '../token/index.js'
import { Transaction } from '../transaction/index.js'
import { AccountData, Cid } from '../artifacts/index.js'
import { Wallet } from '../wallet/index.js'
import { RPC } from '../rpc/index.js'

export class Account {
  static send = async (nodeRpc: RPC, account: AccountData, to: Address, value: Token): Promise<Cid> => {
    if (value.isNegative()) throw new Error('value cannot be negative')
    if (value.isZero()) throw new Error('value cannot be zero')

    const tx = Transaction.getNew(to, account.address, value.toAtto(), 0)
    await tx.prepareToSend(nodeRpc)

    const signature = await Wallet.signTransaction(account, tx)

    const response = await nodeRpc.broadcastTransaction({ Message: tx.toJSON(), Signature: signature.toJSON() })
    if ('error' in response) throw new Error(response.error.message)

    return response.result['/']
  }

  static getBalance = async (nodeRpc: RPC, account: Pick<AccountData, 'address'>): Promise<Token> => {
    const response = await nodeRpc.walletBalance(account.address.toString())
    if ('error' in response) throw new Error(response.error.message)

    return Token.fromAtto(response.result)
  }
}
