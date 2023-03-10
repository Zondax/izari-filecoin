import BN from 'bn.js'

import { bnToString } from './utils.js'
import { ATTO_DECIMALS, FEMTO_DECIMALS, PICO_DECIMALS, NANO_DECIMALS, MICRO_DECIMALS, MILLI_DECIMALS } from '../artifacts/token.js'

const FEMTO_MUL = new BN(10).pow(new BN(MILLI_DECIMALS))
const PICO_MUL = new BN(10).pow(new BN(MICRO_DECIMALS))
const NANO_MUL = new BN(10).pow(new BN(NANO_DECIMALS))
const MICRO_MUL = new BN(10).pow(new BN(PICO_DECIMALS))
const MILLI_MUL = new BN(10).pow(new BN(FEMTO_DECIMALS))
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
  static zero = () => new Token(new BN('0'))

  /**
   * Parse string value as attoFil
   * @param value - attoFil value to parse
   * @returns new Token instance
   */
  static fromAtto = (value: string) => new Token(new BN(value)) // new BN(value).mul(ATTO_MUL)

  /**
   * Parse string value as femtoFil
   * @param value - femtoFil value to parse
   * @returns new Token instance
   */
  static fromFemto = (value: string) => new Token(new BN(value).mul(FEMTO_MUL))

  /**
   * Parse string value as picoFil
   * @param value - picoFil value to parse
   * @returns new Token instance
   */
  static fromPico = (value: string) => new Token(new BN(value).mul(PICO_MUL))

  /**
   * Parse string value as nanoFil
   * @param value - nanoFil value to parse
   * @returns new Token instance
   */
  static fromNano = (value: string) => new Token(new BN(value).mul(NANO_MUL))

  /**
   * Parse string value as microFIL
   * @param value - microFIL value to parse
   * @returns new Token instance
   */
  static fromMicro = (value: string) => new Token(new BN(value).mul(MICRO_MUL))

  /**
   * Parse string value as milliFIL
   * @param value - milliFIL value to parse
   * @returns new Token instance
   */
  static fromMilli = (value: string) => new Token(new BN(value).mul(MILLI_MUL))

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
  toWhole = (): string => bnToString(this.value, ATTO_DECIMALS) // precision: ATTO_DECIMALS - WHOLE_DECIMALS

  /**
   * Express the current value as milliFil
   * @returns the value expressed as milliFil
   */
  toMilli = (): string => bnToString(this.value, ATTO_DECIMALS - MILLI_DECIMALS)

  /**
   * Express the current value as microFil
   * @returns the value expressed as microFil
   */
  toMicro = (): string => bnToString(this.value, ATTO_DECIMALS - MICRO_DECIMALS)

  /**
   * Express the current value as nanoFil
   * @returns the value expressed as nanoFil
   */
  toNano = (): string => bnToString(this.value, ATTO_DECIMALS - NANO_DECIMALS)

  /**
   * Express the current value as picoFil
   * @returns the value expressed as picoFil
   */
  toPico = (): string => bnToString(this.value, ATTO_DECIMALS - PICO_DECIMALS)

  /**
   * Express the current value as femtoFil
   * @returns the value expressed as femtoFil
   */
  toFemto = (): string => bnToString(this.value, ATTO_DECIMALS - FEMTO_DECIMALS)

  /**
   * Express the current value as attoFil.
   * @returns the value expressed as attoFil
   */
  toAtto = (): string => bnToString(this.value, 0) // precision: ATTO_DECIMALS - ATTO_DECIMALS
}
