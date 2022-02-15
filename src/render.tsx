import { renderTo } from '@saus/react'
import { capturePng } from './png'
import {
  render as renderHtml,
  Buffer,
  ClientState,
  InferRouteParams,
  RenderCall,
  RenderRequest,
  RouteModule,
} from 'saus/core'

type Promisable<T> = T | PromiseLike<T>

const defineRenderer = renderTo(
  renderHtml,
  async function (html, { file }, { command }) {
    if (command == 'dev') {
      this.emitFile(file, 'text/html', html)
    } else {
      // TODO: start a local server for capture ._.
      const bitmap = await capturePng(html, '')
      if (bitmap)
        this.emitFile(
          file.replace(/\.html$/, '.png'),
          'image/png',
          Buffer.from(bitmap as any)
        )
    }
  }
)

/** Render a page for a route. */
export function render<
  Route extends string,
  Module extends object = RouteModule,
  State extends object = ClientState
>(
  route: Route,
  render: (
    module: Module,
    request: RenderRequest<State, InferRouteParams<Route>>
  ) => Promisable<JSX.Element | null | void>
): RenderCall<JSX.Element>

/** Set the fallback renderer. */
export function render<
  Module extends object = RouteModule,
  State extends object = ClientState
>(
  render: (
    module: Module,
    request: RenderRequest<State>
  ) => Promisable<JSX.Element>
): RenderCall<JSX.Element>

export function render(...args: [any, any?, any?]) {
  if (typeof args[0] !== 'string') {
    args.unshift('')
  }
  return defineRenderer(...args).api
}
