import path from 'path'

const defSources = {
  type: 'raster',
  tileSize: 256,
  maxzoom: 19,
  attribution: 'Waibu Maps'
}
const defLayer = {
  type: 'raster'
}

const defStyle = {
  version: 8,
  glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  sources: {},
  layers: []
}

function buildMapStyle (src) {
  const { isString, isPlainObject, merge, camelCase } = this.app.bajo.lib._
  if ((isPlainObject(src) && src.version && src.sources) || (isString(src) && path.extname(src) === '.json')) return src
  const result = {}
  if (isString(src)) {
    const [u, a] = src.split('|')
    const url = new URL(u)
    const domain = camelCase(url.hostname)
    const sources = {}
    sources[domain] = merge({}, defSources, { tiles: [u], attribution: a })
    const layers = [merge({}, defLayer, { id: domain, source: domain })]
    merge(result, defStyle, { sources, layers })
  } else {
    const sources = {}
    const code = camelCase(src.code)
    sources[code] = merge({}, defSources, { name: src.name, provider: src.provider, tiles: [src.url], attribution: src.attribution, minzoom: src.minZoom ?? 1, maxzoom: src.maxZoom ?? 19 })
    const layers = [merge({}, defLayer, { id: code, source: code })]
    merge(result, defStyle, { sources, layers })
  }
  return result
}

export default buildMapStyle
