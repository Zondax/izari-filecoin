import puppeteer from 'puppeteer'

describe('Addresses', () => {
  test('Type ID', async () => {
    let browser = await puppeteer.launch({
      headless: false,
    })
    let page = await browser.newPage()

    page.emulate({
      viewport: {
        width: 1000,
        height: 1000,
      },
      userAgent: '',
    })

    await page.goto('http://localhost:3000/')
    await page.waitForSelector('#network')

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

    await browser.close()
  }, 16000)
})
