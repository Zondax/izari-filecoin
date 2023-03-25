import { Token } from '../../../src/token'

jest.setTimeout(60 * 1000)

describe('Token', () => {
  test('Zero', () => {
    expect(Token.zero().toAtto()).toBe('0')
    expect(Token.zero().toFemto()).toBe('0')
    expect(Token.zero().toPico()).toBe('0')
    expect(Token.zero().toNano()).toBe('0')
    expect(Token.zero().toMicro()).toBe('0')
    expect(Token.zero().toMilli()).toBe('0')
    expect(Token.zero().toWhole()).toBe('0')
  })

  describe('Positive', () => {
    test('From whole', () => {
      expect(Token.fromWhole('1').toAtto()).toBe('1000000000000000000')
      expect(Token.fromWhole('1').toFemto()).toBe('1000000000000000')
      expect(Token.fromWhole('1').toPico()).toBe('1000000000000')
      expect(Token.fromWhole('1').toNano()).toBe('1000000000')
      expect(Token.fromWhole('1').toMicro()).toBe('1000000')
      expect(Token.fromWhole('1').toMilli()).toBe('1000')
      expect(Token.fromWhole('1').toWhole()).toBe('1')

      expect(Token.fromWhole('100').toAtto()).toBe('100000000000000000000')
      expect(Token.fromWhole('100').toFemto()).toBe('100000000000000000')
      expect(Token.fromWhole('100').toPico()).toBe('100000000000000')
      expect(Token.fromWhole('100').toNano()).toBe('100000000000')
      expect(Token.fromWhole('100').toMicro()).toBe('100000000')
      expect(Token.fromWhole('100').toMilli()).toBe('100000')
      expect(Token.fromWhole('100').toWhole()).toBe('100')

      expect(Token.fromWhole('10000').toAtto()).toBe('10000000000000000000000')
      expect(Token.fromWhole('10000').toFemto()).toBe('10000000000000000000')
      expect(Token.fromWhole('10000').toPico()).toBe('10000000000000000')
      expect(Token.fromWhole('10000').toNano()).toBe('10000000000000')
      expect(Token.fromWhole('10000').toMicro()).toBe('10000000000')
      expect(Token.fromWhole('10000').toMilli()).toBe('10000000')
      expect(Token.fromWhole('10000').toWhole()).toBe('10000')
    })

    test('From nano', () => {
      expect(Token.fromNano('1').toAtto()).toBe('1000000000')
      expect(Token.fromNano('1').toFemto()).toBe('1000000')
      expect(Token.fromNano('1').toPico()).toBe('1000')
      expect(Token.fromNano('1').toNano()).toBe('1')
      expect(Token.fromNano('1').toMicro()).toBe('0.001')
      expect(Token.fromNano('1').toMilli()).toBe('0.000001')
      expect(Token.fromNano('1').toWhole()).toBe('0.000000001')

      expect(Token.fromNano('100').toAtto()).toBe('100000000000')
      expect(Token.fromNano('100').toFemto()).toBe('100000000')
      expect(Token.fromNano('100').toPico()).toBe('100000')
      expect(Token.fromNano('100').toNano()).toBe('100')
      expect(Token.fromNano('100').toMicro()).toBe('0.1')
      expect(Token.fromNano('100').toMilli()).toBe('0.0001')
      expect(Token.fromNano('100').toWhole()).toBe('0.0000001')

      expect(Token.fromNano('10000').toAtto()).toBe('10000000000000')
      expect(Token.fromNano('10000').toFemto()).toBe('10000000000')
      expect(Token.fromNano('10000').toPico()).toBe('10000000')
      expect(Token.fromNano('10000').toNano()).toBe('10000')
      expect(Token.fromNano('10000').toMicro()).toBe('10')
      expect(Token.fromNano('10000').toMilli()).toBe('0.01')
      expect(Token.fromNano('10000').toWhole()).toBe('0.00001')

      expect(Token.fromNano('10000000').toAtto()).toBe('10000000000000000')
      expect(Token.fromNano('10000000').toFemto()).toBe('10000000000000')
      expect(Token.fromNano('10000000').toPico()).toBe('10000000000')
      expect(Token.fromNano('10000000').toNano()).toBe('10000000')
      expect(Token.fromNano('10000000').toMicro()).toBe('10000')
      expect(Token.fromNano('10000000').toMilli()).toBe('10')
      expect(Token.fromNano('10000000').toWhole()).toBe('0.01')

      expect(Token.fromNano('10000000000').toAtto()).toBe('10000000000000000000')
      expect(Token.fromNano('10000000000').toFemto()).toBe('10000000000000000')
      expect(Token.fromNano('10000000000').toPico()).toBe('10000000000000')
      expect(Token.fromNano('10000000000').toNano()).toBe('10000000000')
      expect(Token.fromNano('10000000000').toMicro()).toBe('10000000')
      expect(Token.fromNano('10000000000').toMilli()).toBe('10000')
      expect(Token.fromNano('10000000000').toWhole()).toBe('10')

      expect(Token.fromNano('1000000000000000000').toAtto()).toBe('1000000000000000000000000000')
      expect(Token.fromNano('1000000000000000000').toFemto()).toBe('1000000000000000000000000')
      expect(Token.fromNano('1000000000000000000').toPico()).toBe('1000000000000000000000')
      expect(Token.fromNano('1000000000000000000').toNano()).toBe('1000000000000000000')
      expect(Token.fromNano('1000000000000000000').toMicro()).toBe('1000000000000000')
      expect(Token.fromNano('1000000000000000000').toMilli()).toBe('1000000000000')
      expect(Token.fromNano('1000000000000000000').toWhole()).toBe('1000000000')

      expect(Token.fromNano('11231000000000000000000').toAtto()).toBe('11231000000000000000000000000000')
      expect(Token.fromNano('10000000000000000000000').toFemto()).toBe('10000000000000000000000000000')
      expect(Token.fromNano('10000000000000000000000').toPico()).toBe('10000000000000000000000000')
      expect(Token.fromNano('11231000000000000000000').toNano()).toBe('11231000000000000000000')
      expect(Token.fromNano('10000000000000000000000').toMicro()).toBe('10000000000000000000')
      expect(Token.fromNano('10000000000000000000000').toMilli()).toBe('10000000000000000')
      expect(Token.fromNano('11231000000000000000000').toWhole()).toBe('11231000000000')

      expect(Token.fromNano('11231000001100000000011').toAtto()).toBe('11231000001100000000011000000000')
      expect(Token.fromNano('11231000001100000000011').toFemto()).toBe('11231000001100000000011000000')
      expect(Token.fromNano('11231000001100000000011').toPico()).toBe('11231000001100000000011000')
      expect(Token.fromNano('11231000001100000000011').toNano()).toBe('11231000001100000000011')
      expect(Token.fromNano('11231000001100000000011').toMicro()).toBe('11231000001100000000.011')
      expect(Token.fromNano('11231000001100000000011').toMilli()).toBe('11231000001100000.000011')
      expect(Token.fromNano('11231000001100000000011').toWhole()).toBe('11231000001100.000000011')
    })

    test('From atto', () => {
      expect(Token.fromAtto('1').toAtto()).toBe('1')
      expect(Token.fromAtto('1').toFemto()).toBe('0.001')
      expect(Token.fromAtto('1').toPico()).toBe('0.000001')
      expect(Token.fromAtto('1').toNano()).toBe('0.000000001')
      expect(Token.fromAtto('1').toMicro()).toBe('0.000000000001')
      expect(Token.fromAtto('1').toMilli()).toBe('0.000000000000001')
      expect(Token.fromAtto('1').toWhole()).toBe('0.000000000000000001')

      expect(Token.fromAtto('100').toAtto()).toBe('100')
      expect(Token.fromAtto('100').toFemto()).toBe('0.1')
      expect(Token.fromAtto('100').toPico()).toBe('0.0001')
      expect(Token.fromAtto('100').toNano()).toBe('0.0000001')
      expect(Token.fromAtto('100').toMicro()).toBe('0.0000000001')
      expect(Token.fromAtto('100').toMilli()).toBe('0.0000000000001')
      expect(Token.fromAtto('100').toWhole()).toBe('0.0000000000000001')

      expect(Token.fromAtto('10000').toAtto()).toBe('10000')
      expect(Token.fromAtto('10000').toFemto()).toBe('10')
      expect(Token.fromAtto('10000').toPico()).toBe('0.01')
      expect(Token.fromAtto('10000').toNano()).toBe('0.00001')
      expect(Token.fromAtto('10000').toMicro()).toBe('0.00000001')
      expect(Token.fromAtto('10000').toMilli()).toBe('0.00000000001')
      expect(Token.fromAtto('10000').toWhole()).toBe('0.00000000000001')

      expect(Token.fromAtto('10000000').toAtto()).toBe('10000000')
      expect(Token.fromAtto('10000000').toFemto()).toBe('10000')
      expect(Token.fromAtto('10000000').toPico()).toBe('10')
      expect(Token.fromAtto('10000000').toNano()).toBe('0.01')
      expect(Token.fromAtto('10000000').toMicro()).toBe('0.00001')
      expect(Token.fromAtto('10000000').toMilli()).toBe('0.00000001')
      expect(Token.fromAtto('10000000').toWhole()).toBe('0.00000000001')

      expect(Token.fromAtto('10000000000').toAtto()).toBe('10000000000')
      expect(Token.fromAtto('10000000000').toFemto()).toBe('10000000')
      expect(Token.fromAtto('10000000000').toPico()).toBe('10000')
      expect(Token.fromAtto('10000000000').toNano()).toBe('10')
      expect(Token.fromAtto('10000000000').toMicro()).toBe('0.01')
      expect(Token.fromAtto('10000000000').toMilli()).toBe('0.00001')
      expect(Token.fromAtto('10000000000').toWhole()).toBe('0.00000001')

      expect(Token.fromAtto('1000000000000000000').toAtto()).toBe('1000000000000000000')
      expect(Token.fromAtto('1000000000000000000').toFemto()).toBe('1000000000000000')
      expect(Token.fromAtto('1000000000000000000').toPico()).toBe('1000000000000')
      expect(Token.fromAtto('1000000000000000000').toNano()).toBe('1000000000')
      expect(Token.fromAtto('1000000000000000000').toMicro()).toBe('1000000')
      expect(Token.fromAtto('1000000000000000000').toMilli()).toBe('1000')
      expect(Token.fromAtto('1000000000000000000').toWhole()).toBe('1')

      expect(Token.fromAtto('11231000000000000000000').toAtto()).toBe('11231000000000000000000')
      expect(Token.fromAtto('11231000000000000000000').toFemto()).toBe('11231000000000000000')
      expect(Token.fromAtto('11231000000000000000000').toPico()).toBe('11231000000000000')
      expect(Token.fromAtto('11231000000000000000000').toNano()).toBe('11231000000000')
      expect(Token.fromAtto('11231000000000000000000').toMicro()).toBe('11231000000')
      expect(Token.fromAtto('11231000000000000000000').toMilli()).toBe('11231000')
      expect(Token.fromAtto('11231000000000000000000').toWhole()).toBe('11231')

      expect(Token.fromAtto('11231000001100000000011').toAtto()).toBe('11231000001100000000011')
      expect(Token.fromAtto('11231000001100000000011').toFemto()).toBe('11231000001100000000.011')
      expect(Token.fromAtto('11231000001100000000011').toPico()).toBe('11231000001100000.000011')
      expect(Token.fromAtto('11231000001100000000011').toNano()).toBe('11231000001100.000000011')
      expect(Token.fromAtto('11231000001100000000011').toMicro()).toBe('11231000001.100000000011')
      expect(Token.fromAtto('11231000001100000000011').toMilli()).toBe('11231000.001100000000011')
      expect(Token.fromAtto('11231000001100000000011').toWhole()).toBe('11231.000001100000000011')
    })
  })

  describe('Negative', () => {
    test('From whole', () => {
      expect(Token.fromWhole('-1').toAtto()).toBe('-1000000000000000000')
      expect(Token.fromWhole('-1').toNano()).toBe('-1000000000')
      expect(Token.fromWhole('-1').toWhole()).toBe('-1')

      expect(Token.fromWhole('-100').toAtto()).toBe('-100000000000000000000')
      expect(Token.fromWhole('-100').toNano()).toBe('-100000000000')
      expect(Token.fromWhole('-100').toWhole()).toBe('-100')

      expect(Token.fromWhole('-10000').toAtto()).toBe('-10000000000000000000000')
      expect(Token.fromWhole('-10000').toNano()).toBe('-10000000000000')
      expect(Token.fromWhole('-10000').toWhole()).toBe('-10000')
    })

    test('From nano', () => {
      expect(Token.fromNano('-1').toAtto()).toBe('-1000000000')
      expect(Token.fromNano('-1').toNano()).toBe('-1')
      expect(Token.fromNano('-1').toWhole()).toBe('-0.000000001')

      expect(Token.fromNano('-100').toAtto()).toBe('-100000000000')
      expect(Token.fromNano('-100').toNano()).toBe('-100')
      expect(Token.fromNano('-100').toWhole()).toBe('-0.0000001')

      expect(Token.fromNano('-10000').toAtto()).toBe('-10000000000000')
      expect(Token.fromNano('-10000').toNano()).toBe('-10000')
      expect(Token.fromNano('-10000').toWhole()).toBe('-0.00001')

      expect(Token.fromNano('-10000000').toAtto()).toBe('-10000000000000000')
      expect(Token.fromNano('-10000000').toNano()).toBe('-10000000')
      expect(Token.fromNano('-10000000').toWhole()).toBe('-0.01')

      expect(Token.fromNano('-10000000000').toAtto()).toBe('-10000000000000000000')
      expect(Token.fromNano('-10000000000').toNano()).toBe('-10000000000')
      expect(Token.fromNano('-10000000000').toWhole()).toBe('-10')

      expect(Token.fromNano('-1000000000000000000').toAtto()).toBe('-1000000000000000000000000000')
      expect(Token.fromNano('-1000000000000000000').toNano()).toBe('-1000000000000000000')
      expect(Token.fromNano('-1000000000000000000').toWhole()).toBe('-1000000000')

      expect(Token.fromNano('-11231000000000000000000').toAtto()).toBe('-11231000000000000000000000000000')
      expect(Token.fromNano('-11231000000000000000000').toNano()).toBe('-11231000000000000000000')
      expect(Token.fromNano('-11231000000000000000000').toWhole()).toBe('-11231000000000')

      expect(Token.fromNano('-11231000001100000000011').toAtto()).toBe('-11231000001100000000011000000000')
      expect(Token.fromNano('-11231000001100000000011').toNano()).toBe('-11231000001100000000011')
      expect(Token.fromNano('-11231000001100000000011').toWhole()).toBe('-11231000001100.000000011')
    })

    test('From atto', () => {
      expect(Token.fromAtto('-1').toAtto()).toBe('-1')
      expect(Token.fromAtto('-1').toNano()).toBe('-0.000000001')
      expect(Token.fromAtto('-1').toWhole()).toBe('-0.000000000000000001')

      expect(Token.fromAtto('-100').toAtto()).toBe('-100')
      expect(Token.fromAtto('-100').toNano()).toBe('-0.0000001')
      expect(Token.fromAtto('-100').toWhole()).toBe('-0.0000000000000001')

      expect(Token.fromAtto('-10000').toAtto()).toBe('-10000')
      expect(Token.fromAtto('-10000').toNano()).toBe('-0.00001')
      expect(Token.fromAtto('-10000').toWhole()).toBe('-0.00000000000001')

      expect(Token.fromAtto('-10000000').toAtto()).toBe('-10000000')
      expect(Token.fromAtto('-10000000').toNano()).toBe('-0.01')
      expect(Token.fromAtto('-10000000').toWhole()).toBe('-0.00000000001')

      expect(Token.fromAtto('-10000000000').toAtto()).toBe('-10000000000')
      expect(Token.fromAtto('-10000000000').toNano()).toBe('-10')
      expect(Token.fromAtto('-10000000000').toWhole()).toBe('-0.00000001')

      expect(Token.fromAtto('-1000000000000000000').toAtto()).toBe('-1000000000000000000')
      expect(Token.fromAtto('-1000000000000000000').toNano()).toBe('-1000000000')
      expect(Token.fromAtto('-1000000000000000000').toWhole()).toBe('-1')

      expect(Token.fromAtto('-11231000000000000000000').toAtto()).toBe('-11231000000000000000000')
      expect(Token.fromAtto('-11231000000000000000000').toNano()).toBe('-11231000000000')
      expect(Token.fromAtto('-11231000000000000000000').toWhole()).toBe('-11231')

      expect(Token.fromAtto('-11231000001100000000011').toAtto()).toBe('-11231000001100000000011')
      expect(Token.fromAtto('-11231000001100000000011').toNano()).toBe('-11231000001100.000000011')
      expect(Token.fromAtto('-11231000001100000000011').toWhole()).toBe('-11231.000001100000000011')
    })
  })
})
