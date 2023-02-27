import { Address } from '../address/index.js'
import { Token } from '../token/index.js'
import { Transaction } from '../transaction/index.js'
import { AccountData } from '../wallet/types.js'
import { Wallet } from '../wallet/index.js'
import { RPC } from '../rpc/index.js'

export class Account {
  static send = async (nodeRpc: RPC, account: AccountData, to: Address, value: Token) => {
    if (value.isNegative()) throw new Error('value cannot be negative')
    if (value.isZero()) throw new Error('value cannot be zero')

    const tx = Transaction.getNew(to, account.address, value.toAtto(), 0)
    await tx.prepareToSend(nodeRpc)

    const signature = await Wallet.signTransaction(account, tx)

    return await nodeRpc.broadcastTransaction({ Message: tx.toJSON(), Signature: signature.toJSON() })
  }
}
