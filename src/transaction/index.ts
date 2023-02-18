import * as cbor from '@ipld/dag-cbor'
import { ByteView } from '@ipld/dag-cbor'
import BN from 'bn.js'

import { Address } from '../address/index.js'
import { serializeBigNum } from './utils.js'
import { Network } from '../address/constants.js'
import { RPC } from '../rpc/index.js'
import { TransactionJSON, TxVersion, TxInputData } from './types.js'

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

  static getDefault = (to: Address, from: Address, value: string, method: number) =>
    new Transaction(TxVersion.Zero, to, from, 0, value, 0, '0', '0', method, '')

  static parse = (network: Network, cborMessage: Buffer | string) => {
    if (typeof cborMessage === 'string') cborMessage = Buffer.from(cborMessage, 'hex')

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

  serialize = (): ByteView<TxInputData> => {
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

    return cbor.encode<TxInputData>(message_to_encode)
  }

  prepare = async (nodeRpc: RPC) => {
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
