import blake from 'blakejs'
import { InvalidPrivateKeyFormat } from '../address/errors.js'
import { SignatureType } from '../artifacts/wallet.js'

const CID_PREFIX = Buffer.from([0x01, 0x71, 0xa0, 0xe4, 0x02, 0x20])
const CID_LEN = 32

/**
 * Returns the third position from path
 * @param path - path to parse
 * @returns coin type
 */
export const getCoinTypeFromPath = (path: string): string => path.split('/')[2].slice(0, -1)

/**
 * Calculate the CID (content identifier) from a raw data (buffer)
 * For more information about CID, please refer to this {@link https://spec.filecoin.io/glossary/#section-glossary.cid|link}
 * @param message - data to get CID from
 * @returns generated CID
 */
export function getCID(message: Buffer): Buffer {
  const blakeCtx = blake.blake2bInit(CID_LEN)
  blake.blake2bUpdate(blakeCtx, message)
  const hash = Buffer.from(blake.blake2bFinal(blakeCtx))
  return Buffer.concat([CID_PREFIX, hash])
}

/**
 * Digest a raw piece of data (buffer)
 * @param message - data to digest
 * @returns digest result
 */
export function getDigest(message: Buffer): Buffer {
  // digest = blake2-256( prefix + blake2b-256(tx) )

  const blakeCtx = blake.blake2bInit(32)
  blake.blake2bUpdate(blakeCtx, getCID(message))
  return Buffer.from(blake.blake2bFinal(blakeCtx))
}

/**
 * Run basic validation on a piece of data that could potentially be a private key
 * @param privateKey - piece of data that intents to be a private key
 * @returns parsed private key as buffer
 */
export const tryToPrivateKeyBuffer = (privateKey: string | Buffer): Buffer => {
  if (typeof privateKey === 'string') {
    // We should have a padding!
    if (privateKey.slice(-1) === '=') privateKey = Buffer.from(privateKey, 'base64')
    else throw new InvalidPrivateKeyFormat()
  }

  if (privateKey.length !== 32) throw new InvalidPrivateKeyFormat()

  return privateKey
}

/**
 * Generate the f1/t1 payload from public key
 * @param uncompressedPublicKey - public key
 * @returns generated payload
 */
export const getPayloadSECP256K1 = (uncompressedPublicKey: Uint8Array): Buffer => {
  // blake2b-160
  const blakeCtx = blake.blake2bInit(20)
  blake.blake2bUpdate(blakeCtx, uncompressedPublicKey)
  return Buffer.from(blake.blake2bFinal(blakeCtx))
}

/**
 * Validate if a given number is a valid signature type
 * @param type - possible signature type
 * @returns whether the input is a signature type or not
 */
export const isSignatureType = (type: number): type is SignatureType => SignatureType.BLS === type || SignatureType.SECP256K1 === type
