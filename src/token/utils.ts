import BN from 'bn.js'

export const trimTrailingZeros = (value: string) => {
  for (let i = value.length - 1; i >= 0; i--) {
    if (value[i] == '.') return value.substr(0, i)
    if (value[i] != '0' || i === 1) return value.substr(0, i + 1)
  }
}

export const bnToString = (value: BN, precision: number) => {
  const sign = value.isNeg() ? '-' : ''

  const valueStr = value.abs().toString()
  const decimals = valueStr.length - precision

  const parsedValue = trimTrailingZeros(
    decimals > 0 ? `${valueStr.substring(0, decimals)}.${valueStr.substring(decimals)}` : `0.${''.padStart(-1 * decimals, '0')}${valueStr}`
  )

  return sign + parsedValue
}
