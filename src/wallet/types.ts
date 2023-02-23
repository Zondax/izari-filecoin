import { ProtocolIndicator } from '../address/constants.js'

export type Signature = {
  Data: Buffer
  Type: ProtocolIndicator
}
