import {
  defineConfig,
  PageFactory,
  Plugin,
  RenderedPage,
  SausContext,
  UserConfig,
} from 'saus/core'
import { capturePng } from './png'

export default (config: UserConfig) =>
  defineConfig({
    plugins: [],
  })

function servePngInDev(): Plugin {
  let context: SausContext
  return {
    name: 'repng:serve',
    apply: 'serve',
    enforce: 'pre',
    saus: {
      onContext(c) {
        context = c
      },
    },
    configureServer(server) {
      const { logger } = server.config
      server.middlewares.use('/*.png', async (req, res, next) => {
        const pngUrl = req.originalUrl!
        const page = await context.servePage!(getHtmlUrl(pngUrl))
        if (!page) {
          return next()
        }
        if (page.error) {
          logger.error(page.error)
          res.writeHead(500)
          return res.end()
        }
        const bitmap = await capturePng(page.body)
        if (!bitmap) {
          return next()
        }
        res.writeHead(200, undefined, {
          'Content-Type': 'image/png',
        })
        res.write(bitmap)
        res.end()
      })
    },
  }
}

const indexPng = '/index.png'

function getHtmlUrl(pngUrl: string) {
  return pngUrl.endsWith(indexPng)
    ? pngUrl.slice(0, -indexPng.length)
    : pngUrl.slice(0, -4)
}
