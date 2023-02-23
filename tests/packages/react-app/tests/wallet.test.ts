import puppeteer from 'puppeteer'

describe('Wallet', () => {
  test('Misc', async () => {
    let browser = await puppeteer.launch({
      headless: true,
    })
    let page = await browser.newPage()

    page.emulate({
      viewport: {
        width: 1000,
        height: 1000,
      },
      userAgent: '',
    })

    try {
      await page.goto('http://localhost:3000/')
      await page.waitForSelector('#mnemonic', { timeout: 10000 })

      const mnemonic = await page.$eval('#mnemonic', e => e.innerHTML)
      const address = await page.$eval('#address', e => e.innerHTML)

      expect(mnemonic).toBeDefined()
      expect(address).toBe('Address: t1hp5wy3mjpxcbarjzczfrku3yiy6nyx5kej4fwei')

      await page.waitForSelector('#signature', { timeout: 10000 })

      const signatureData = await page.$eval('#signature.data', e => e.innerHTML)
      const signatureType = await page.$eval('#signature.type', e => e.innerHTML)
      expect(signatureData).toBe('Signature Data: wW6G6jykbQQWL+J8V/TcbmTvgN7e71EM8WxC54nfv5gd1nc0CvPGFND1ndfWmVQ1Fl6W1Liyc3pD4jAYTz/Z9AE=')
      expect(signatureType).toBe('Signature Type: 1')
    } finally {
      await browser.close()
    }
  }, 20000)
})
