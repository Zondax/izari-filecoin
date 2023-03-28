import { Signature, SignatureType } from '../../../src'

jest.setTimeout(60 * 1000)

describe('Signature', () => {
  describe('From JSON', function () {
    test('Correct', () => {
      const data = 'R/LNRVY9vvmx7e7+oeZo1YMbsVF7Eu8q6SSV9P9PKcYA3CoxDg/4k+Ybu9S0UreWznQltoIBvGrh7F4/OUajqQA='
      const input = {
        Type: SignatureType.SECP256K1,
        Data: data,
      }
      const signature = Signature.fromJSON(input)

      expect(signature).toBeDefined()
      expect(signature.getType()).toBe(SignatureType.SECP256K1)
      expect(signature.getData().toString('base64')).toBe(data)
      expect(signature.isSecp256k1()).toBeTruthy()
      expect(signature.isBls()).toBeFalsy()
      expect(signature.toJSON()).toStrictEqual(input)
    })

    test('Argument not an object', () => {
      expect(() => {
        Signature.fromJSON('R/LNRVY9vvmx7e7+oeZo1YMbsVF7Eu8q6SSV9P9PKcYA3CoxDg/4k+Ybu9S0UreWznQltoIBvGrh7F4/OUajqQA=')
      }).toThrow(new RegExp(/input should be an object/))
    })

    test('Argument is empty object', () => {
      expect(() => {
        Signature.fromJSON({})
      }).toThrow(new RegExp(/'Type' should be a number/))
    })

    test('Type field is not valid type', () => {
      expect(() => {
        Signature.fromJSON({ Type: '1' })
      }).toThrow(new RegExp(/'Type' should be a number/))
    })

    test('Type field is not valid value', () => {
      expect(() => {
        Signature.fromJSON({ Type: 1111 })
      }).toThrow(new RegExp(/invalid signature type/))
    })

    test('Data field is missing', () => {
      expect(() => {
        Signature.fromJSON({ Type: SignatureType.SECP256K1 })
      }).toThrow(new RegExp(/'Data' should be a base64 encoded string/))
    })

    test('Data field is not valid type', () => {
      expect(() => {
        Signature.fromJSON({ Type: SignatureType.SECP256K1, Data: 11212 })
      }).toThrow(new RegExp(/'Data' should be a base64 encoded string/))
    })
  })
})
