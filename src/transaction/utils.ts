import BN from 'bn.js'
export const serializeBigNum = (value: string, base = 10): Buffer => {
  if (value.toString() === '0') return Buffer.from('')

  const valueBN = new BN(value, base)
  const valueBuffer = valueBN.toArrayLike(Buffer, 'be', valueBN.byteLength())
  return Buffer.concat([Buffer.from('00', 'hex'), valueBuffer])
}
