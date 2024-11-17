import path from 'path'

const defSources = {
  type: 'raster',
  tileSize: 256,
  maxzoom: 19
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
    const url = new URL(src)
    const domain = camelCase(url.hostname)
    const sources = {}
    sources[domain] = merge({}, { tiles: [src] }, defSources)
    const layers = [merge({}, { id: domain, source: domain }, defLayer)]
    merge(result, defStyle, { sources, layers })
  } else {
    const sources = {}
    sources[src.code] = merge({}, { tiles: [src.url], attribution: src.attribution, minzoom: src.minZoom ?? 1, maxzoom: src.maxZoom ?? 19 }, defSources)
    const layers = [merge({}, { id: src.code, source: src.code }, defLayer)]
    merge(result, defStyle, { sources, layers })
  }
  console.log(result)
  return result
}

export default buildMapStyle
