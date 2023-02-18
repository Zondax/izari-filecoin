export enum TxVersion {
  Zero = 0,
}

export type TxInputData = [TxVersion, Buffer, Buffer, number, Buffer, number, Buffer, Buffer, number, Buffer]

export type TransactionJSON = {
  To: string
  From: string
  Nonce: number
  Value: string
  GasLimit: number
  GasFeeCap: string
  GasPremium: string
  Method: number
  Params: string
}
