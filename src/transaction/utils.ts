import BN from 'bn.js'

/**
 * Serialize a string number to serialized BigInt per filecoin specification
 * @param value - string number to serialize
 * @param base - number base
 * @returns serialized bigint as buffer
 */
export const serializeBigNum = (value: string, base = 10): Buffer => {
  if (value.toString() === '0') return Buffer.from('')

  const valueBN = new BN(value, base)
  const valueBuffer = valueBN.toArrayLike(Buffer, 'be', valueBN.byteLength())
  const signFlagBuffer = Buffer.from(valueBN.isNeg() ? '01' : '00', 'hex')
  return Buffer.concat([signFlagBuffer, valueBuffer])
}

/**
 * Deserialize a buffer to string number per filecoin specification
 * @param value - buffer number to deserialize
 * @param base - number base
 * @returns deserialized bigint as string
 */
export const deserializeBigNum = (value: Buffer, base = 10): string => {
  if (value.length === 0) return '0'
  if (value[0] != 0x00 && value[0] != 0x01) throw new Error('invalid bigint')

  const sign = value[0] === 0x01 ? '-' : ''
  const valueBN = new BN(value.subarray(1))

  return sign + valueBN.toString(base)
}
