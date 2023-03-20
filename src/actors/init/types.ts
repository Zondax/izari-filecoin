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

export class ExecParams {
  constructor(protected targetActorCid: string, protected targetConstructorParams: Uint8Array) {}
  serialize = async (): Promise<Uint8Array> => {
    const cbor: IpldDagCbor = await waitFor<IpldDagCbor>(() => globalCbor)
    const multiformats: Multiformats = await waitFor<Multiformats>(() => globalMultiformats)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return cbor.encode([multiformats.CID.parse(this.targetActorCid), this.targetConstructorParams])
  }
}
