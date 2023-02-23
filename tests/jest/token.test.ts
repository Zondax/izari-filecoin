import { Token } from '../../src/token'

describe('Token', () => {
  test('Zero', () => {
    expect(Token.getDefault().toAtto()).toBe('0')
    expect(Token.getDefault().toNano()).toBe('0')
    expect(Token.getDefault().toWhole()).toBe('0')
  })

  describe('Positive', () => {
    test('From whole', () => {
      expect(Token.fromWhole('1').toAtto()).toBe('1000000000000000000')
      expect(Token.fromWhole('1').toNano()).toBe('1000000000')
      expect(Token.fromWhole('1').toWhole()).toBe('1')

      expect(Token.fromWhole('100').toAtto()).toBe('100000000000000000000')
      expect(Token.fromWhole('100').toNano()).toBe('100000000000')
      expect(Token.fromWhole('100').toWhole()).toBe('100')

      expect(Token.fromWhole('10000').toAtto()).toBe('10000000000000000000000')
      expect(Token.fromWhole('10000').toNano()).toBe('10000000000000')
      expect(Token.fromWhole('10000').toWhole()).toBe('10000')
    })

    test('From nano', () => {
      expect(Token.fromNano('1').toAtto()).toBe('1000000000')
      expect(Token.fromNano('1').toNano()).toBe('1')
      expect(Token.fromNano('1').toWhole()).toBe('0.000000001')

      expect(Token.fromNano('100').toAtto()).toBe('100000000000')
      expect(Token.fromNano('100').toNano()).toBe('100')
      expect(Token.fromNano('100').toWhole()).toBe('0.0000001')

      expect(Token.fromNano('10000').toAtto()).toBe('10000000000000')
      expect(Token.fromNano('10000').toNano()).toBe('10000')
      expect(Token.fromNano('10000').toWhole()).toBe('0.00001')

      expect(Token.fromNano('10000000').toAtto()).toBe('10000000000000000')
      expect(Token.fromNano('10000000').toNano()).toBe('10000000')
      expect(Token.fromNano('10000000').toWhole()).toBe('0.01')

      expect(Token.fromNano('10000000000').toAtto()).toBe('10000000000000000000')
      expect(Token.fromNano('10000000000').toNano()).toBe('10000000000')
      expect(Token.fromNano('10000000000').toWhole()).toBe('10')

      expect(Token.fromNano('1000000000000000000').toAtto()).toBe('1000000000000000000000000000')
      expect(Token.fromNano('1000000000000000000').toNano()).toBe('1000000000000000000')
      expect(Token.fromNano('1000000000000000000').toWhole()).toBe('1000000000')

      expect(Token.fromNano('11231000000000000000000').toAtto()).toBe('11231000000000000000000000000000')
      expect(Token.fromNano('11231000000000000000000').toNano()).toBe('11231000000000000000000')
      expect(Token.fromNano('11231000000000000000000').toWhole()).toBe('11231000000000')

      expect(Token.fromNano('11231000001100000000011').toAtto()).toBe('11231000001100000000011000000000')
      expect(Token.fromNano('11231000001100000000011').toNano()).toBe('11231000001100000000011')
      expect(Token.fromNano('11231000001100000000011').toWhole()).toBe('11231000001100.000000011')
    })

    test('From atto', () => {
      expect(Token.fromAtto('1').toAtto()).toBe('1')
      expect(Token.fromAtto('1').toNano()).toBe('0.000000001')
      expect(Token.fromAtto('1').toWhole()).toBe('0.000000000000000001')

      expect(Token.fromAtto('100').toAtto()).toBe('100')
      expect(Token.fromAtto('100').toNano()).toBe('0.0000001')
      expect(Token.fromAtto('100').toWhole()).toBe('0.0000000000000001')

      expect(Token.fromAtto('10000').toAtto()).toBe('10000')
      expect(Token.fromAtto('10000').toNano()).toBe('0.00001')
      expect(Token.fromAtto('10000').toWhole()).toBe('0.00000000000001')

      expect(Token.fromAtto('10000000').toAtto()).toBe('10000000')
      expect(Token.fromAtto('10000000').toNano()).toBe('0.01')
      expect(Token.fromAtto('10000000').toWhole()).toBe('0.00000000001')

      expect(Token.fromAtto('10000000000').toAtto()).toBe('10000000000')
      expect(Token.fromAtto('10000000000').toNano()).toBe('10')
      expect(Token.fromAtto('10000000000').toWhole()).toBe('0.00000001')

      expect(Token.fromAtto('1000000000000000000').toAtto()).toBe('1000000000000000000')
      expect(Token.fromAtto('1000000000000000000').toNano()).toBe('1000000000')
      expect(Token.fromAtto('1000000000000000000').toWhole()).toBe('1')

      expect(Token.fromAtto('11231000000000000000000').toAtto()).toBe('11231000000000000000000')
      expect(Token.fromAtto('11231000000000000000000').toNano()).toBe('11231000000000')
      expect(Token.fromAtto('11231000000000000000000').toWhole()).toBe('11231')

      expect(Token.fromAtto('11231000001100000000011').toAtto()).toBe('11231000001100000000011')
      expect(Token.fromAtto('11231000001100000000011').toNano()).toBe('11231000001100.000000011')
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
