const { getExchangeRate } = require('./exchange-rates');

describe('getExchangeRate', () => {
  test('returns a number for valid currency pair', async () => {
    const rate = await getExchangeRate('FIL', 'USD');
    expect(typeof rate).toBe('number');
  });

  test('throws an error for invalid currency pair', async () => {
    await expect(getExchangeRate('INVALID', 'CURRENCY')).rejects.toThrow();
  });
});
