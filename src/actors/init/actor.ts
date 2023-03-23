import { Address, AddressId } from '../../address/index.js'
import { InitActorMethods, SystemActorIDs } from '../../artifacts/index.js'
import { Transaction } from '../../transaction/index.js'
import { Token } from '../../token/index.js'
import { ExecParams } from './types.js'

/**
 * Allows to create transactions for each method the init actor has.
 * For more information about the Init actor, please refer to this {@link https://docs.filecoin.io/basics/the-blockchain/actors/#initactor|link}
 */
export class InitActor {
  /**
   * Allows to get a new transaction to execute any method of the init actor, as you need to pass the method number
   * @param from - sender address
   * @param value - amount of tokens to transfer to the new created actor
   * @param method - method number to execute
   * @param params - params to be passed to the method that will be executed
   */
  protected static newTx = (from: Address, value: Token, method: number, params: Uint8Array): Transaction => {
    const initActor = new AddressId(from.getNetworkPrefix(), SystemActorIDs.Init.toString())
    return Transaction.getNew(initActor, from, value, method, Buffer.from(params))
  }

  /**
   * Allows to get a new transaction to execute the "exec" method of the init actor
   * @param from - sender address
   * @param value - amount of tokens to transfer to the new created actor
   * @param params - params to be passed to the exec method
   */
  static newExecTx = async (from: Address, value: Token, params: ExecParams): Promise<Transaction> => {
    const serializedParams = await params.serialize()
    return this.newTx(from, value, InitActorMethods.Exec, serializedParams)
  }
}
