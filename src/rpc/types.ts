import { TransactionJSON } from '../transaction/types'
import { SignatureJSON } from '../wallet/types'

export type SignedTransaction = {
  Message: TransactionJSON
  Signature: SignatureJSON
}

export type RpcError = {
  error: {
    message: string
  }
}

export type GetNonceResponse =
  | {
      result: number
    }
  | RpcError

export type GasEstimationResponse =
  | {
      result: { GasFeeCap: string; GasPremium: string; GasLimit: number }
    }
  | RpcError

export type StateWaitMsgResponse =
  | {
      Message: { '/': string }
      Receipt: { ExitCode: number; Return: string; GasUsed: number }
      ReturnDec: string
      TipSet: { '/': string }[]
      Height: number
    }
  | RpcError

export type MpoolPushResponse =
  | {
      ['/']: string
    }
  | RpcError

export type SendSignMessageResponse = StateWaitMsgResponse | MpoolPushResponse

export type ReadStateResponse = { Balance: string; Code: { '/': string } } | RpcError
