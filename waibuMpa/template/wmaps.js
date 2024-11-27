/* global maplibregl, geolib, _, wmpa, WorkerTimers */

class WaibuMaps { // eslint-disable-line no-unused-vars
  constructor (map) {
    this.map = map
    this.markers = {}
    this.markersOnScreen = {}
  }

  async handleClusterClick (layerId, clusterId = 'cluster_id') {
    this.map.on('click', layerId, async (e) => {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: [layerId]
      })
      const id = features[0].properties[clusterId]
      const layer = this.map.getLayer(layerId)
      const zoom = await this.map.getSource(layer.source).getClusterExpansionZoom(id)
      this.map.easeTo({
        center: features[0].geometry.coordinates,
        zoom
      })
    })
  }

  async handleNonClusterClick (layerId, handler = 'name') {
    this.map.on('click', layerId, async (e) => {
      const props = e.features[0].properties
      const coordinates = e.features[0].geometry.coordinates.slice()

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      if (_.isFunction(handler)) await handler.call(this, { props, coordinates, layerId }, e)
      else if (_.isString(handler)) this.mapPopup({ layerId, props, html: props[handler], coordinates })
    })
  }

  updateClusterMarkers ({ sourceId, clusterKey = 'cluster', clusterIdKey = 'clusterId', handler }) {
    if (!handler) return
    const newMarkers = {}
    const features = this.map.querySourceFeatures(sourceId)

    for (let i = 0; i < features.length; i++) {
      const coords = features[i].geometry.coordinates
      const props = features[i].properties
      if (!props[clusterKey]) continue
      const id = props[clusterIdKey]

      let marker = this.markers[id]
      if (!marker) {
        const el = handler(props)
        marker = this.markers[id] = new maplibregl.Marker({
          element: el
        }).setLngLat(coords)
      }
      newMarkers[id] = marker

      if (!this.markersOnScreen[id]) marker.addTo(this.map)
    }
    for (const id in this.markersOnScreen) {
      if (!newMarkers[id]) this.markersOnScreen[id].remove()
    }
    this.markersOnScreen = newMarkers
  }

  mapPopup ({ layerId, props, html, coordinates }) {
    new maplibregl.Popup({ className: 'popup-layer-' + layerId + ' popup-target-' + props.id })
      .setLngLat(coordinates)
      .setHTML(html)
      .addTo(this.map)
  }

  handlePointer (layerId) {
    this.map.on('mouseenter', layerId, () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })
    this.map.on('mouseleave', layerId, () => {
      this.map.getCanvas().style.cursor = ''
    })
  }

  getBbox () {
    const bounds = this.map.getBounds().toArray()
    return [...bounds[0], ...bounds[1]]
  }

  async loadImages (sources) {
    for (const src of sources) {
      const data = await wmpa.fetchApi(src)
      if (_.isEmpty(data)) continue
      for (let d of data) {
        if (_.isString(d)) {
          const [url, id] = d.split(';')
          d = { url, id }
        }
        if (!d.id) d.id = _.last(d.url.split('?')[0].split('#')[0].split('/')).split('.')[0]
        if (this.map.listImages().includes(d.id)) continue
        const image = await this.map.loadImage(d.url)
        this.map.addImage(d.id, image.data)
      }
    }
  }
}

class WaibuMapsUtil {
  constructor () {
    this.defSources = {
      type: 'raster',
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Waibu Maps'
    }

    this.defLayer = {
      type: 'raster'
    }

    this.defStyle = {
      version: 8,
      glyphs: '<%= glyphs %>',
      sources: {},
      layers: []
    }
  }

  decToDms (decimal, opts = {}) {
    if (opts === true || opts === false) opts = { isLng: opts }
    opts.north = opts.north ?? 'N'
    opts.south = opts.south ?? 'S'
    opts.east = opts.east ?? 'E'
    opts.west = opts.west ?? 'W'
    const result = geolib.decimalToSexagesimal(decimal)
    if (opts.isLng) return result + ' ' + (decimal >= 0 ? opts.east : opts.west)
    else return result + ' ' + (decimal >= 0 ? opts.north : opts.south)
  }

  srcAsStyle (src) {
    if ((_.isPlainObject(src) && src.version && src.sources)) return src
    const result = {}
    if (_.isString(src)) {
      const url = new URL(src)
      const ext = _.last(url.pathname.split('.'))
      if (ext === 'json') return src
      const domain = _.camelCase(url.hostname)
      const sources = {}
      sources[domain] = _.merge({}, this.defSources, { tiles: [src], attribution: url.searchParams.get('attribution') ?? '' })
      const layers = [_.merge({}, this.defLayer, { id: domain, source: domain })]
      _.merge(result, this.defStyle, { sources, layers })
    } else {
      if (src.type === 'VECTOR') return src.url
      if (!['RASTER'].includes(src.type)) throw new Error('Invalid source type')
      const sources = {}
      const code = _.camelCase(src.code)
      sources[code] = _.merge({}, this.defSources, { name: src.name, provider: src.provider, tiles: [src.url], attribution: src.attribution, minzoom: src.minZoom ?? 1, maxzoom: src.maxZoom ?? 19 })
      const layers = [_.merge({}, this.defLayer, { id: code, source: code })]
      _.merge(result, this.defStyle, { sources, layers })
    }
    return result
  }
}

const wmapsUtil = new WaibuMapsUtil() // eslint-disable-line no-unused-vars

window.setInterval = WorkerTimers.setInterval
window.clearInterval = WorkerTimers.clearInterval
window.setTimeout = WorkerTimers.setTimeout
window.clearTimeout = WorkerTimers.clearTimeout
