import { Address, AddressId } from '../../address/index.js'
import { InitActorMethods, SystemActorIDs } from '../../artifacts/index.js'
import { Transaction } from '../../transaction/index.js'
import { Token } from '../../token/index.js'
import { ExecParams } from './types.js'

export class InitActor {
  protected static newTx = (from: Address, value: Token, method: number, params: Uint8Array): Transaction => {
    const initActor = new AddressId(from.getNetwork(), SystemActorIDs.Init.toString())
    return Transaction.getNew(initActor, from, value, method, Buffer.from(params))
  }

  static newExecTx = async (from: Address, value: Token, params: ExecParams): Promise<Transaction> => {
    const serializedParams = await params.serialize()
    return this.newTx(from, value, InitActorMethods.Exec, serializedParams)
  }
}
