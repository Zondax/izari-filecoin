import BN from 'bn.js'
import { bnToString } from './utils.js'

const ATTO_PRECISION = 18
const NANO_PRECISION = 9

const NANO_MUL = new BN(10).pow(new BN(NANO_PRECISION))
const WHOLE_MUL = new BN(10).pow(new BN(ATTO_PRECISION))

export class Token {
  constructor(public value: BN) {}
  static getDefault = () => new Token(new BN('0'))
  static fromAtto = (value: string) => new Token(new BN(value))
  static fromNano = (value: string) => new Token(new BN(value).mul(NANO_MUL))
  static fromWhole = (value: string) => new Token(new BN(value).mul(WHOLE_MUL))

  add = (val: Token): Token => {
    this.value = this.value.add(val.value)
    return this
  }

  sub = (val: Token): Token => {
    this.value = this.value.sub(val.value)
    return this
  }

  isNegative = () => this.value.isNeg()
  isPositive = () => !this.value.isNeg()
  isZero = () => this.value.isZero()
  toWhole = (): string => bnToString(this.value, ATTO_PRECISION)
  toNano = (): string => bnToString(this.value, NANO_PRECISION)
  toAtto = (): string => bnToString(this.value, 0)
}
