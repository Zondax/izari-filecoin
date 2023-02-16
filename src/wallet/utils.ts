import blake from 'blakejs'
import assert from 'assert'
import { InvalidPrivateKeyFormat } from '../address/errors'

export const getCoinTypeFromPath = (path: string): string => path.split('/')[2].slice(0, -1)

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
