import blake from 'blakejs'
import { InvalidPrivateKeyFormat } from '../address/errors.js'

const CID_PREFIX = Buffer.from([0x01, 0x71, 0xa0, 0xe4, 0x02, 0x20])

export const getCoinTypeFromPath = (path: string): string => path.split('/')[2].slice(0, -1)

export function getCID(message: ArrayLike<number>): Buffer {
  const blakeCtx = blake.blake2bInit(32)
  blake.blake2bUpdate(blakeCtx, message)
  const hash = Buffer.from(blake.blake2bFinal(blakeCtx))
  return Buffer.concat([CID_PREFIX, hash])
}

export function getDigest(message: ArrayLike<number>): Buffer {
  // digest = blake2-256( prefix + blake2b-256(tx) )

  const blakeCtx = blake.blake2bInit(32)
  blake.blake2bUpdate(blakeCtx, getCID(message))
  return Buffer.from(blake.blake2bFinal(blakeCtx))
}

export const getPayloadSECP256K1 = (uncompressedPublicKey: Uint8Array): Buffer => {
  // blake2b-160
  const blakeCtx = blake.blake2bInit(20)
  blake.blake2bUpdate(blakeCtx, uncompressedPublicKey)
  return Buffer.from(blake.blake2bFinal(blakeCtx))
}

export const tryToPrivateKeyBuffer = (privateKey: string | Buffer): Buffer => {
  if (typeof privateKey === 'string') {
    // We should have a padding!
    if (privateKey.slice(-1) === '=') privateKey = Buffer.from(privateKey, 'base64')
    else throw new InvalidPrivateKeyFormat()
  }

  if (privateKey.length !== 32) throw new InvalidPrivateKeyFormat()

  return privateKey
}
