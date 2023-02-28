import axios, { AxiosInstance } from 'axios'
import {
  GasEstimationResponse,
  GetNonceResponse,
  MpoolPushOk,
  MpoolPushResponse,
  ReadStateResponse,
  RpcError,
  SignedTransaction,
  StateWaitMsgResponse,
  WalletBalanceResponse,
} from '../artifacts/rpc.js'
import { TransactionJSON } from '../artifacts/transaction.js'

type Args = { url: string; token: string }

export class RPC {
  fetcher: AxiosInstance

  constructor(args: Args) {
    this.fetcher = axios.create({
      baseURL: args.url,
      headers: { Authorization: `Bearer ${args.token}` },
    })
  }

  async getNonce(address: string): Promise<GetNonceResponse> {
    try {
      const response = await this.fetcher.post('', {
        jsonrpc: '2.0',
        method: 'Filecoin.MpoolGetNonce',
        id: 1,
        params: [address],
      })
      return response.data as GetNonceResponse
    } catch (e: unknown) {
      return this.handleError<RpcError>(e)
    }
  }

  async broadcastTransaction(signedTx: SignedTransaction): Promise<MpoolPushResponse> {
    try {
      const mpoolResponse = await this.fetcher.post<MpoolPushResponse>('', {
        jsonrpc: '2.0',
        method: 'Filecoin.MpoolPush',
        id: 1,
        params: [signedTx],
      })

      return mpoolResponse.data
    } catch (e: unknown) {
      return this.handleError<RpcError>(e)
    }
  }

  async getGasEstimation(txJson: TransactionJSON): Promise<GasEstimationResponse> {
    try {
      const response = await this.fetcher.post('', {
        jsonrpc: '2.0',
        method: 'Filecoin.GasEstimateMessageGas',
        id: 1,
        params: [txJson, { MaxFee: '0' }, null],
      })

      return response.data as GasEstimationResponse
    } catch (e: unknown) {
      return this.handleError<RpcError>(e)
    }
  }

  async readState(address: string): Promise<ReadStateResponse> {
    try {
      const response = await this.fetcher.post('', {
        jsonrpc: '2.0',
        method: 'Filecoin.StateReadState',
        id: 1,
        params: [address, null],
      })

      return response.data as ReadStateResponse
    } catch (e: unknown) {
      return this.handleError<RpcError>(e)
    }
  }

  async waitMsgState(cid: MpoolPushOk['result']): Promise<StateWaitMsgResponse> {
    try {
      const response = await this.fetcher.post('', {
        jsonrpc: '2.0',
        method: 'Filecoin.StateWaitMsg',
        id: 1,
        params: [cid, 0, null, false],
      })
      return response.data as StateWaitMsgResponse
    } catch (e: unknown) {
      return this.handleError<RpcError>(e)
    }
  }
  async walletBalance(address: string): Promise<WalletBalanceResponse> {
    try {
      const response = await this.fetcher.post('', {
        jsonrpc: '2.0',
        method: 'Filecoin.WalletBalance',
        id: 1,
        params: [address],
      })
      return response.data as WalletBalanceResponse
    } catch (e: unknown) {
      return this.handleError<RpcError>(e)
    }
  }

  private handleError<T>(e: unknown): T {
    if (axios.isAxiosError(e)) {
      if (e.response) {
        if (e.response.data) return e.response.data as T
        if (e.response.statusText) return { error: { message: `${e.response.status} - ${e.response.statusText}` } } as T
      }
      if (e.request) return { error: { message: 'request made but no response received' } } as T
      if (e.message) return { error: { message: e.message } } as T
    }
    throw e
  }
}
