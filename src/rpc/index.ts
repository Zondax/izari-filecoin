import axios, { AxiosInstance } from 'axios'
import {
  GasEstimationResponse,
  GetNonceResponse,
  MpoolPushResponse,
  ReadStateResponse,
  SendSignMessageResponse,
  SignedMessage,
  StateWaitMsgResponse,
  TransactionRaw,
} from './types'

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
      if (axios.isAxiosError(e) && e.response) return e.response.data as GetNonceResponse
      throw e
    }
  }

  async broadcastTransaction(signedMessage: SignedMessage, skipStateWaitMsg?: boolean): Promise<SendSignMessageResponse> {
    const mpoolResponse = await this.fetcher.post<MpoolPushResponse>('', {
      jsonrpc: '2.0',
      method: 'Filecoin.MpoolPush',
      id: 1,
      params: [signedMessage],
    })

    if (skipStateWaitMsg) return mpoolResponse.data
    if ('error' in mpoolResponse.data) return mpoolResponse.data

    if (!('result' in mpoolResponse.data)) throw new Error('response is empty')

    const stateWaitResponse = await this.fetcher.post<StateWaitMsgResponse>('', {
      jsonrpc: '2.0',
      method: 'Filecoin.StateWaitMsg',
      id: 1,
      params: [mpoolResponse.data.result, 0, null, false],
    })

    return stateWaitResponse.data
  }

  async getGasEstimation(message: TransactionRaw): Promise<GasEstimationResponse> {
    const response = await this.fetcher.post('', {
      jsonrpc: '2.0',
      method: 'Filecoin.GasEstimateMessageGas',
      id: 1,
      params: [message, { MaxFee: '0' }, null],
    })

    return response.data as GasEstimationResponse
  }

  async readState(address: string): Promise<ReadStateResponse> {
    const response = await this.fetcher.post('', {
      jsonrpc: '2.0',
      method: 'Filecoin.StateReadState',
      id: 1,
      params: [address, null],
    })

    return response.data as ReadStateResponse
  }
}
