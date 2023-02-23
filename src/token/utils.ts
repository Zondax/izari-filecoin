import BN from 'bn.js'

export const trimTrailingZeros = (value: string) => {
  let i = 0
  for (i = value.length - 1; i >= 0; i--) {
    if (value[i] == '.') {
      i--
      break
    } else if (value[i] != '0' || i === 1) break
  }

  return value.substr(0, i + 1)
}

export const bnToString = (value: BN, precision: number) => {
  let sign = ''
  if (value.isNeg()) {
    value = value.abs()
    sign = '-'
  }

  const valueStr = value.toString()
  const decimals = valueStr.length - precision
  const parsedValue = trimTrailingZeros(
    decimals > 0 ? `${valueStr.substring(0, decimals)}.${valueStr.substring(decimals)}` : `0.${''.padStart(-1 * decimals, '0')}${valueStr}`
  )

  return sign + parsedValue
}
