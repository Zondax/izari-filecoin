import { Address } from '../../address/index.js'
import { IpldDagCbor } from '../../external/dag-cbor.js'
import { waitFor } from '../../utils/sleep.js'

let globalCbor: IpldDagCbor | undefined
import('@ipld/dag-cbor')
  .then(localCbor => {
    globalCbor = localCbor
  })
  .catch(e => {
    throw e
  })

export class ConstructorParams {
  constructor(protected from: Address, protected to: Address) {}

  serialize = async () => {
    const cbor: IpldDagCbor = await waitFor<IpldDagCbor>(() => globalCbor)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return cbor.encode([this.from.toBytes(), this.to.toBytes()])
  }
}
