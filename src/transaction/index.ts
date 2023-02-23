import BN from 'bn.js'

import { Address } from '../address/index.js'
import { serializeBigNum } from './utils.js'
import { Network } from '../address/constants.js'
import { RPC } from '../rpc/index.js'
import { TransactionJSON, TxInputData, TxVersion } from './types.js'
import { IpldDagCbor } from '../external/dag-cbor.js'
import { waitFor } from '../utils/sleep.js'

// Loading this module dynamically as it has no support to CJS
// The only way to keep CJS supported on our side is to load it dynamically
// The interface has been copied from the repo itself
let globalCbor: IpldDagCbor | undefined
import('@ipld/dag-cbor')
  .then(localCbor => {
    globalCbor = localCbor
  })
  .catch(e => {
    throw e
  })

export class Transaction {
  constructor(
    public version: TxVersion,
    public to: Address,
    public from: Address,
    public nonce: number,
    public value: string,
    public gasLimit: number,
    public gasFeeCap: string,
    public gasPremium: string,
    public method: number,
    public params: string
  ) {}

  static getNew = (to: Address, from: Address, value: string, method: number): Transaction => {
    if (value === '' || value.includes('-')) throw new Error('value must not be empty or negative')

    return new Transaction(TxVersion.Zero, to, from, 0, value, 0, '0', '0', method, '')
  }

  static fromCBOR = async (network: Network, cborMessage: Buffer | string): Promise<Transaction> => {
    if (typeof cborMessage === 'string') cborMessage = Buffer.from(cborMessage, 'hex')

    const cbor: IpldDagCbor = await waitFor<IpldDagCbor>(() => globalCbor)

    const decoded = cbor.decode<TxInputData>(cborMessage)
    if (!(decoded instanceof Array)) throw new Error('Decoded raw tx should be an array')

    if (decoded[0] !== TxVersion.Zero) throw new Error('Unsupported version')
    if (decoded.length < 10) throw new Error('The cbor is missing some fields... please verify you have 9 fields.')
    if (decoded[4][0] === 0x01) throw new Error('Value cant be negative')

    const value = new BN(Buffer.from(decoded[4]).toString('hex'), 16).toString(10)
    const gasFeeCap = new BN(Buffer.from(decoded[6]).toString('hex'), 16).toString(10)
    const gasPremium = new BN(Buffer.from(decoded[7]).toString('hex'), 16).toString(10)

    return new Transaction(
      decoded[0],
      Address.fromBytes(network, decoded[1]),
      Address.fromBytes(network, decoded[2]),
      decoded[3],
      value,
      decoded[5],
      gasFeeCap,
      gasPremium,
      decoded[8],
      decoded[9].toString('base64')
    )
  }

  static fromJSON = (message: unknown): Transaction => {
    if (typeof message !== 'object' || message == null) throw new Error('tx should be an json object')

    if (!('To' in message) || typeof message['To'] !== 'string') throw new Error("'To' is a required field and has to be a 'string'")

    if (!('From' in message) || typeof message['From'] !== 'string') throw new Error("'From' is a required field and has to be a 'string'")

    if (!('Nonce' in message) || typeof message['Nonce'] !== 'number')
      throw new Error("'Nonce' is a required field and has to be a 'number'")

    if (!('Value' in message) || typeof message['Value'] !== 'string' || message['Value'] === '' || message['Value'].includes('-'))
      throw new Error("'Value' is a required field and has to be a 'string' but not empty or negative")

    if (!('GasFeeCap' in message) || typeof message['GasFeeCap'] !== 'string')
      throw new Error("'GasFeeCap' is a required field and has to be a 'string'")

    if (!('GasPremium' in message) || typeof message['GasPremium'] !== 'string')
      throw new Error("'GasPremium' is a required field and has to be a 'string'")

    if (!('GasLimit' in message) || typeof message['GasLimit'] !== 'number')
      throw new Error("'GasLimit' is a required field and has to be a 'number'")

    if (!('Method' in message) || typeof message['Method'] !== 'number')
      throw new Error("'Method' is a required field and has to be a 'number'")

    if (!('Params' in message) || typeof message['Params'] !== 'string')
      throw new Error("'Params' is a required field and has to be a 'string'")

    return new Transaction(
      TxVersion.Zero,
      Address.fromString(message.To),
      Address.fromString(message.From),
      message.Nonce,
      message.Value,
      message.GasLimit,
      message.GasFeeCap,
      message.GasPremium,
      message.Method,
      message.Params
    )
  }

  toJSON = (): TransactionJSON => ({
    To: this.to.toString(),
    From: this.from.toString(),
    Nonce: this.nonce,
    Value: this.value,
    Params: this.params,
    GasFeeCap: this.gasFeeCap,
    GasPremium: this.gasPremium,
    GasLimit: this.gasLimit,
    Method: this.method,
  })

  serialize = async (): Promise<Buffer> => {
    const cbor: IpldDagCbor = await waitFor<IpldDagCbor>(() => globalCbor)

    const message_to_encode: TxInputData = [
      this.version,
      this.to.toBytes(),
      this.from.toBytes(),
      this.nonce,
      serializeBigNum(this.value, 10),
      this.gasLimit,
      serializeBigNum(this.gasFeeCap, 10),
      serializeBigNum(this.gasPremium, 10),
      this.method,
      Buffer.from(this.params, 'base64'),
    ]

    return Buffer.from(cbor.encode(message_to_encode))
  }

  prepareToSend = async (nodeRpc: RPC): Promise<void> => {
    const nonceResult = await nodeRpc.getNonce(this.from.toString())
    if ('error' in nonceResult) throw new Error(nonceResult.error.message)

    this.nonce = nonceResult.result

    const gasResult = await nodeRpc.getGasEstimation(this.toJSON())
    if ('error' in gasResult) throw new Error(gasResult.error.message)

    this.gasFeeCap = gasResult.result.GasFeeCap
    this.gasLimit = gasResult.result.GasLimit
    this.gasPremium = gasResult.result.GasPremium
  }
}
