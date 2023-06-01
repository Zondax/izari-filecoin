import * as playwright from 'playwright'

const browsers = [
  { name: 'Chromium', instance: playwright.chromium },
  { name: 'Firefox', instance: playwright.firefox },
  //{ name: 'Safari', instance: playwright.webkit },
]

describe('Addresses', () => {
  test.each(browsers)(
    'Type ID - $name',
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
        await page.waitForSelector('#network', { timeout: 10000 })

        const network = await page.$eval('#network', e => e.innerHTML)
        const protocol = await page.$eval('#protocol', e => e.innerHTML)
        const payload = await page.$eval('#payload', e => e.innerHTML)
        const string = await page.$eval('#string', e => e.innerHTML)
        const bytes = await page.$eval('#bytes', e => e.innerHTML)

        expect(network).toBe('Network: t')
        expect(payload).toBe('Payload: da43')
        expect(protocol).toBe('Protocol: 0')
        expect(string).toBe('String: t08666')
        expect(bytes).toBe('Bytes: 00da43')
      } finally {
        await browser.close()
      }
    },
    20000
  )
})
