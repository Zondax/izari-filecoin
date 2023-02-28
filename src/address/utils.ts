import blake from 'blakejs'
import { Network } from '../artifacts/address.js'

export function getChecksum(payload: Buffer): Buffer {
  const blakeCtx = blake.blake2bInit(4)
  blake.blake2bUpdate(blakeCtx, payload)
  return Buffer.from(blake.blake2bFinal(blakeCtx))
}

export function getLeb128Length(input: Buffer): number {
  let count = 0
  while (count < input.length) {
    const byte = input[count]
    count++
    if (byte < 128) break
  }
  if (count == input.length) {
    return -1
  }
  return count
}

export const validateNetwork = (network: string): network is Network => network == Network.Mainnet || network == Network.Testnet
