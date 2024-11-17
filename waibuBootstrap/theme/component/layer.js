import { scripts, css } from './map.js'

export function buildLayers (params) {
  const { isString, map } = this.plugin.app.bajo.lib._
  const { routePath } = this.plugin.app.waibu
  const { attrToArray, jsonStringify } = this.plugin.app.waibuMpa

  if (!isString(params.attr.layer)) return ''
  const items = map(attrToArray(params.attr.layer), item => routePath(item))
  return `
    for (const l of ${jsonStringify(items, true)}) {
      const layer = await this.loadResource(l)
      layer.source = '${params.attr.name}'
      this.map.addLayer(layer)
    }
  `
}

export function buildImage (params) {
  const { isString, map } = this.plugin.app.bajo.lib._
  const { routePath } = this.plugin.app.waibu
  const { attrToArray, jsonStringify } = this.plugin.app.waibuMpa

  if (!isString(params.attr.image)) return ''
  const items = map(attrToArray(params.attr.image), item => routePath(item))
  return `
    for (const l of ${jsonStringify(items, true)}) {
      let [item, name] = l.split(';')
      if (!name) name = _.last(l.split('?')[0].split('#')[0].split('/')).split('.')[0]
      if (this.map.listImages().includes(name)) continue
      const resp = await this.map.loadImage(l)
      this.map.addImage(name, resp.data)
    }
  `
}

export async function buildSrcImages (params) {
  const { isString } = this.plugin.app.bajo.lib._
  const { routePath, fetch } = this.plugin.app.waibu

  if (!isString(params.attr.srcImages)) return
  params.attr.srcImages = routePath(params.attr.srcImages)
  const items = await fetch(params.attr.srcImages)
  const lines = []
  for (const key in items) {
    lines.push(`${items[key]};${key}`)
  }
  params.attr.image = lines.join(' ')
  return buildImage.call(this, params)
}

export function buildSource (params, extra = []) {
  const { routePath } = this.plugin.app.waibu
  params.attr.src = routePath(params.attr.src)
  return `
    const rsc = await this.loadResource('${params.attr.src}')
    let data = {}
    if (rsc.type === 'geojson' && rsc.data) data = rsc
    else {
      data.type = 'geojson'
      data.data = rsc
    }
    ${params.attr.lineGradient ? 'data.lineMetrics = true' : ''}
    ${extra.join('\n')}
    this.map.addSource('${params.attr.name}', data)
  `
}

const layer = {
  scripts,
  css,
  handler: async function (params = {}) {
    const { generateId } = this.plugin.app.bajo
    const { isString } = this.plugin.app.bajo.lib._
    const { groupAttrs } = this.plugin.app.waibuMpa
    params.noTag = true
    if (!params.attr.src) return
    params.attr.name = params.attr.name ?? generateId('alpha')
    const group = groupAttrs(params.attr, ['cluster'])
    const cluster = []
    if (group.cluster) {
      cluster.push('data.cluster = true')
      if (isString(group.cluster.radius)) cluster.push('data.clusterRadius = ' + Number(group.cluster.radius))
      if (isString(group.cluster.maxZoom)) cluster.push('data.clusterMaxZoom = ' + Number(group.cluster.maxZoom))
    }

    params.html = `<script type="mapLoad" has-resource>
      ${params.attr.srcImages ? (await buildSrcImages.call(this, params)) : buildImage.call(this, params)}
      ${buildSource.call(this, params, cluster)}
      ${buildLayers.call(this, params)}
    </script>`
  }
}

export default layer
