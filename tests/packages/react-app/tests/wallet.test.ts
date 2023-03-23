import * as playwright from 'playwright'

const browsers = [
  { name: 'Chromium', instance: playwright.chromium },
  { name: 'Firefox', instance: playwright.firefox },
  { name: 'Safari', instance: playwright.webkit },
]

describe('Wallet', () => {
  test.each(browsers)(
    'Misc - $name',
    async ({ instance }) => {
      let browser = await instance.launch({
        headless: true,
      })
      let page = await browser.newPage()

      await page.setViewportSize({
        width: 1000,
        height: 1000,
      })

      try {
        await page.goto('http://localhost:3000/')
        await page.waitForSelector('#mnemonic', { timeout: 10000 })

        const mnemonic = await page.$eval('#mnemonic', e => e.innerHTML)
        const address = await page.$eval('#address', e => e.innerHTML)

        expect(mnemonic).toBeDefined()
        expect(address).toBe('Address: t1hp5wy3mjpxcbarjzczfrku3yiy6nyx5kej4fwei')

        await page.waitForSelector('#signature-data', { timeout: 10000 })

        const signatureData = await page.$eval('#signature-data', e => e.innerHTML)
        const signatureType = await page.$eval('#signature-type', e => e.innerHTML)
        expect(signatureData).toBe('Signature Data: wW6G6jykbQQWL+J8V/TcbmTvgN7e71EM8WxC54nfv5gd1nc0CvPGFND1ndfWmVQ1Fl6W1Liyc3pD4jAYTz/Z9AE=')
        expect(signatureType).toBe('Signature Type: 1')
      } finally {
        await browser.close()
      }
    },
    20000
  )
})
