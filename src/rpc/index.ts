import axios, { AxiosInstance } from 'axios'
import {
  GasEstimationResponse,
  GetNonceResponse,
  MpoolPushResponse,
  ReadStateResponse,
  RpcError,
  SendSignMessageResponse,
  SignedTransaction,
  StateWaitMsgResponse,
} from './types.js'
import { TransactionJSON } from '../transaction/types'

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

  async broadcastTransaction(signedTx: SignedTransaction, waitTxToBeConfirmed?: boolean): Promise<SendSignMessageResponse> {
    try {
      const mpoolResponse = await this.fetcher.post<MpoolPushResponse>('', {
        jsonrpc: '2.0',
        method: 'Filecoin.MpoolPush',
        id: 1,
        params: [signedTx],
      })

      if (!waitTxToBeConfirmed) return mpoolResponse.data
      if ('error' in mpoolResponse.data) return mpoolResponse.data

      if (!('result' in mpoolResponse.data)) throw new Error('response is empty')

      const stateWaitResponse = await this.fetcher.post<StateWaitMsgResponse>('', {
        jsonrpc: '2.0',
        method: 'Filecoin.StateWaitMsg',
        id: 1,
        params: [mpoolResponse.data.result, 0, null, false],
      })

      return stateWaitResponse.data
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

  private handleError<T>(e: unknown): T {
    if (axios.isAxiosError(e)) {
      if (e.response) return e.response.data as T
      if (e.request) return { error: { message: 'request made but no response received' } } as T
      if (e.message) return { error: { message: e.message } } as T
    }
    throw e
  }
}
