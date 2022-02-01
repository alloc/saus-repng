import puppeteer, { BoxModel, Browser } from 'puppeteer'

let browser: Browser | undefined

export async function capturePng(html: string): Promise<Buffer | null> {
  browser ||= await puppeteer.launch()

  const page = await browser.newPage()
  await page.setContent(html, {
    waitUntil: ['domcontentloaded', 'networkidle0'],
    timeout: 0,
  })

  const bodyEl = await page.$('body')
  if (!bodyEl) {
    return null
  }

  let bodyFrame: BoxModel | null = null
  for (;;) {
    bodyFrame = await bodyEl.boxModel()
    if (!bodyFrame || bodyFrame.height == 0) {
      await new Promise(done => setTimeout(done, 1000))
    } else break
  }

  const { width, height } = bodyFrame

  await page.setViewport({
    width,
    height,
  })

  const result = await page.screenshot({
    type: 'png',
    clip: {
      x: 0,
      y: 0,
      width,
      height,
    },
    omitBackground: true,
  })

  await page.close()
  return result as Buffer
}
