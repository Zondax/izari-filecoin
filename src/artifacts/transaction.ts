/**
 *
 */
export enum TxVersion {
  Zero = 0,
}

/**
 * Alias for transaction receiver address in raw format
 */
type To = Buffer

/**
 * Alias for transaction sender address in raw format
 */
type From = Buffer

/**
 * Alias for transaction gas limit in raw format
 */
type GasLimit = number

/**
 * Alias for transaction gas fee cap in raw format
 */
type GasFeeCap = Buffer

/**
 * Alias for transaction gas premium in raw format
 */
type GasPremium = Buffer

/**
 * Alias for transaction value in raw format
 */
type Value = Buffer

/**
 * Alias for transaction method in raw format
 */
type Method = number

/**
 * Alias for transaction params in raw format
 */
type Params = Buffer

/**
 * Alias for transaction nonce in raw format
 */
type Nonce = number

/**
 * Represents the data related to a filecoin transaction, ordered as a tuple. A transaction is transmitted as a cbor array, so data must be
 * ordered before serializing it. In the same way, when deserializing a transaction, the outcome will be presented as an array with a given order.
 */
export type TxInputData = [TxVersion, To, From, Nonce, Value, GasLimit, GasFeeCap, GasPremium, Method, Params]

/**
 * JSON representation of a filecoin transaction
 */
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
