const { getExchangeRate } = require('./exchange-rates');

getExchangeRate('FIL', 'USD')
  .then(rate => console.log(rate))
  .catch(error => console.error(error));
