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
    } finally {
      await browser.close()
    }
  }, 20000)
})
