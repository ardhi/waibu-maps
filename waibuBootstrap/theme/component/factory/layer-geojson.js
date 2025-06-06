import wmapsBase from '../wmaps-base.js'

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
      map.addLayer(layer)
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
      if (map.listImages().includes(name)) continue
      const resp = await map.loadImage(l)
      map.addImage(name, resp.data)
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
    map.addSource('${params.attr.name}', data)
  `
}

async function layerGeojson () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsLayerGeojson extends WmapsBase {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { generateId } = this.plugin.app.bajo
      const { isString } = this.plugin.app.bajo.lib._
      const { groupAttrs } = this.plugin.app.waibuMpa
      this.params.noTag = true
      if (!this.params.attr.src) return
      this.params.attr.name = this.params.attr.name ?? generateId('alpha')
      const group = groupAttrs(this.params.attr, ['cluster'])
      const cluster = []
      if (group.cluster) {
        cluster.push('data.cluster = true')
        if (isString(group.cluster.radius)) cluster.push('data.clusterRadius = ' + Number(group.cluster.radius))
        if (isString(group.cluster.maxZoom)) cluster.push('data.clusterMaxZoom = ' + Number(group.cluster.maxZoom))
      }

      this.addBlock('mapLoad', `
        ${this.params.attr.srcImages ? (await buildSrcImages.call(this, this.params)) : buildImage.call(this, this.params)}
        ${buildSource.call(this, this.params, cluster)}
        ${buildLayers.call(this, this.params)}
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default layerGeojson
