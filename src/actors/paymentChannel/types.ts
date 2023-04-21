import cbor from 'cbor'

import { Address } from '../../address/index.js'

/**
 * Allows to create and serialize parameters related to the constructor method of the payment channel actor.
 * For more information about this type, please refer to this {@link https://github.com/filecoin-project/builtin-actors/blob/master/actors/paych/src/lib.rs|code}
 */
export class ConstructorParams {
  /**
   * Create new constructor params instance for payment channel actor
   * @param from - payment channel sender address
   * @param to - payment channel receiver address
   */
  constructor(protected from: Address, protected to: Address) {}

  /**
   * Serialize to cbor. Required to sign and send an exec transaction to the blockchain
   * @returns serialized data
   */
  serialize = () => cbor.encode([this.from.toBytes(), this.to.toBytes()])
}
