import { TransactionJSON } from './transaction.js'
import { SignatureJSON } from './wallet.js'

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
      result: {
        Message: { '/': string }
        Receipt: { ExitCode: number; Return: string; GasUsed: number }
        ReturnDec: string
        TipSet: { '/': string }[]
        Height: number
      }
    }
  | RpcError

export type MpoolPushOk = {
  result: {
    ['/']: string
  }
}
export type MpoolPushResponse = MpoolPushOk | RpcError

export type ReadStateResponse = { Balance: string; Code: { '/': string } } | RpcError

export type WalletBalanceResponse = { result: string } | RpcError
