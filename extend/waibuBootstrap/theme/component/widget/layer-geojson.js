import wmapsBase from '../wmaps-base.js'

export function buildLayers () {
  const { isString, map } = this.app.lib._
  const { routePath, attrToArray } = this.app.waibu
  const { jsonStringify } = this.app.waibuMpa

  if (!isString(this.params.attr.layer)) return ''
  const items = map(attrToArray(this.params.attr.layer), item => routePath(item))
  return `
    for (const l of ${jsonStringify(items, true)}) {
      const layer = await this.loadResource(l)
      layer.source = '${this.params.attr.name}'
      map.addLayer(layer)
    }
  `
}

export function buildImage () {
  const { isString, map } = this.app.lib._
  const { routePath, attrToArray } = this.app.waibu
  const { jsonStringify } = this.app.waibuMpa

  if (!isString(this.params.attr.image)) return ''
  const items = map(attrToArray(this.params.attr.image), item => routePath(item))
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

export async function buildSrcImages () {
  const { isString } = this.app.lib._
  const { routePath, fetch } = this.app.waibu

  if (!isString(this.params.attr.srcImages)) return
  this.params.attr.srcImages = routePath(this.params.attr.srcImages)
  const items = await fetch(this.params.attr.srcImages)
  const lines = []
  for (const key in items) {
    lines.push(`${items[key]};${key}`)
  }
  this.params.attr.image = lines.join(' ')
  return buildImage.call(this)
}

export function buildSource (extra = []) {
  const { routePath } = this.app.waibu
  this.params.attr.src = routePath(this.params.attr.src)
  return `
    const rsc = await this.loadResource('${this.params.attr.src}')
    let data = {}
    if (rsc.type === 'geojson' && rsc.data) data = rsc
    else {
      data.type = 'geojson'
      data.data = rsc
    }
    ${this.params.attr.lineGradient ? 'data.lineMetrics = true' : ''}
    ${extra.join('\n')}
    map.addSource('${this.params.attr.name}', data)
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
      const { generateId } = this.app.lib.aneka
      const { isString } = this.app.lib._
      const { groupAttrs } = this.app.waibuMpa
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
        ${this.params.attr.srcImages ? (await buildSrcImages.call(this)) : buildImage.call(this)}
        ${buildSource.call(this, cluster)}
        ${buildLayers.call(this)}
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default layerGeojson
