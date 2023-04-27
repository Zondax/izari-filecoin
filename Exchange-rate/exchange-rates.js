const axios = require('axios');

async function getExchangeRate(currency1, currency2) {
  const apiKey = '70670c13-25a1-4fa3-a088-47f7b3c375f0';
  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${currency1}&convert=${currency2}`;
  const response = await axios.get(url, {
    headers: {
      'X-CMC_PRO_API_KEY': apiKey,
    },
  });
  return response.data.data[currency1].quote[currency2].price;
}

module.exports = { getExchangeRate };
