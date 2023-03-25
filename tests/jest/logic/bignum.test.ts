import fs from 'fs'
import path from 'path'

import { serializeBigNum, deserializeBigNum } from '../../../src/transaction/utils'

jest.setTimeout(60 * 1000)

const BIGNUMS_VECTOR = '../vectors/bigNums.json'

type BigNumTestCase = {
  numString: string
  numSerialized: string
}

describe('Big Numbers', () => {
  describe('Serialize', () => {
    const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, BIGNUMS_VECTOR), 'utf-8')) as BigNumTestCase[]

    vectors.forEach(({ numString, numSerialized }, index) => {
      test(`Test case ${index}: ${numString}`, () => {
        const expectedValue = serializeBigNum(numString).toString('hex')

        expect(expectedValue).toBe(numSerialized)
      })
    })
  })

  describe('Deserialize', () => {
    const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, BIGNUMS_VECTOR), 'utf-8')) as BigNumTestCase[]

    vectors.forEach(({ numString, numSerialized }, index) => {
      test(`Test case ${index}: ${numString}`, () => {
        const expectedValue = deserializeBigNum(Buffer.from(numSerialized, 'hex'))

        expect(expectedValue).toBe(numString)
      })
    })
  })
})
