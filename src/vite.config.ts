import getServerAddr from 'get-server-address'
import { defineConfig, Plugin, SausContext, UserConfig } from 'saus/core'
import { capturePng } from './png'

export default (config: UserConfig) =>
  defineConfig({
    plugins: [servePngInDev()],
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
      let serverUrl: string
      server.middlewares.use(async (req, res, next) => {
        const pngUrl = req.originalUrl!
        if (!pngUrl.endsWith('.png')) {
          return next()
        }
        const pagePath = getPagePath(pngUrl)
        const page = await context.servePage!(pagePath)
        if (!page) {
          return next()
        }
        if (page.error) {
          logger.error(page.error)
          res.writeHead(500)
          return res.end()
        }
        serverUrl ??= getServerAddr(server.httpServer!)
        const bitmap = await capturePng(page.body, serverUrl + pagePath)
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

function getPagePath(pngUrl: string) {
  return pngUrl.endsWith(indexPng)
    ? pngUrl.slice(0, -indexPng.length)
    : pngUrl.slice(0, -4)
}
