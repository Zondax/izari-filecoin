import BN from 'bn.js'
import { bnToString } from './utils.js'

const ATTO_DECIMALS = 18
const NANO_DECIMALS = 9

const NANO_MUL = new BN(10).pow(new BN(NANO_DECIMALS))
const WHOLE_MUL = new BN(10).pow(new BN(ATTO_DECIMALS))

/**
 * Token allows to handle the different denominations filecoin uses.
 * You can convert from and to atto, nano and whole, as well as do operations like
 * addition and subtraction. Besides, logical operations can be applied, such as
 * grater than, equal to, less than, and so on.
 * For more information about denominations, please refer to this {@link https://docs.filecoin.io/about/assets/fil-token/#denominations-of-filecoin|link}
 */
export class Token {
  constructor(public value: BN) {}

  /**
   * Creates an instance with 0 as value
   */
  static getDefault = () => new Token(new BN('0'))

  /**
   * Parse string value as attoFil
   * @param value - attoFil value to parse
   * @returns new Token instance
   */
  static fromAtto = (value: string) => new Token(new BN(value))

  /**
   * Parse string value as nanoFil
   * @param value - nanoFil value to parse
   * @returns new Token instance
   */
  static fromNano = (value: string) => new Token(new BN(value).mul(NANO_MUL))

  /**
   * Parse string value as FIL (tokens as whole unit)
   * @param value - fils value to parse
   * @returns new Token instance
   */
  static fromWhole = (value: string) => new Token(new BN(value).mul(WHOLE_MUL))

  /**
   * Allows to add to Token amounts. It will update the current value internally.
   * @param val - Token to add to the current value
   * @returns the current Token instance (with the internal value updated). This allows to chain many operations together.
   */
  add = (val: Token): Token => {
    this.value = this.value.add(val.value)
    return this
  }

  /**
   * Allows to subtract to Token amounts. It will update the current value internally.
   * @param val - Token to substract to the current value
   * @returns the current Token instance (with the internal value updated). This allows to chain many operations together.
   */
  sub = (val: Token): Token => {
    this.value = this.value.sub(val.value)
    return this
  }

  /**
   * Allows compare which is grater
   * @param val - Token to compare to the current value
   * @returns if the current value is grater or not
   */
  gt = (val: Token): boolean => this.value.gt(val.value)

  /**
   * Allows compare which is grater or equal
   * @param val - Token to compare to the current value
   * @returns if the current value is grater or equal, or not
   */
  gte = (val: Token): boolean => this.value.gte(val.value)

  /**
   * Allows compare which is less
   * @param val - Token to compare to the current value
   * @returns if the current value is less or not
   */
  lt = (val: Token): boolean => this.value.lt(val.value)

  /**
   * Allows compare which is less or equal
   * @param val - Token to compare to the current value
   * @returns if the current value is less or equal, or not
   */
  lte = (val: Token): boolean => this.value.lte(val.value)

  /**
   * Check if the value is negative
   * @returns whether the value is negative or not
   */
  isNegative = (): boolean => this.value.isNeg()

  /**
   * Check if the value is positive
   * @returns whether the value is positive or not
   */
  isPositive = (): boolean => !this.value.isNeg()

  /**
   * Check if the value is zero
   * @returns whether the value is zero or not
   */
  isZero = (): boolean => this.value.isZero()

  /**
   * Express the current value as fil (token unit as whole)
   * @returns the value expressed as whole
   */
  toWhole = (): string => bnToString(this.value, ATTO_DECIMALS)

  /**
   * Express the current value as nanoFil
   * @returns the value expressed as nanoFil
   */
  toNano = (): string => bnToString(this.value, NANO_DECIMALS)

  /**
   * Express the current value as attoFil.
   * @returns the value expressed as attoFil
   */
  toAtto = (): string => bnToString(this.value, 0)
}
