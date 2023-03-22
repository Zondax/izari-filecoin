import { IpldDagCbor } from '../../external/dag-cbor.js'
import { Multiformats } from '../../external/multiformats.js'
import { waitFor } from '../../utils/sleep.js'

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

/**
 * Allows to create and serialize parameters related to the exec method of the init actor.
 * For more information about this type, please refer to this {@link https://github.com/filecoin-project/builtin-actors/blob/master/actors/init/src/lib.rs|code}
 */
export class ExecParams {
  /**
   * Create new exec params instance
   * @param targetActorCid - actor cid the init actor will create
   * @param targetConstructorParams - constructor parameters of the new actor instance the init actor will create
   */
  constructor(protected targetActorCid: string, protected targetConstructorParams: Uint8Array) {}

  /**
   * Serialize to cbor. Required to sign and send an exec transaction to the blockchain
   * @returns serialized data
   */
  serialize = async (): Promise<Uint8Array> => {
    const cbor: IpldDagCbor = await waitFor<IpldDagCbor>(() => globalCbor)
    const multiformats: Multiformats = await waitFor<Multiformats>(() => globalMultiformats)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return cbor.encode([multiformats.CID.parse(this.targetActorCid), this.targetConstructorParams])
  }
}
