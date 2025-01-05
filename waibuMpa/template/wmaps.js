/* global maplibregl, geolib, _, wmpa, WorkerTimers, turf, Alpine */

class WaibuMaps { // eslint-disable-line no-unused-vars
  constructor (map, scope) {
    this.map = map
    this.scope = scope
    this.markers = {}
    this.markersOnScreen = {}
    this.popup = null
  }

  async handleClusterClick (layerId, clusterId = 'cluster_id') {
    this.handlePointer(layerId)
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

  async createPopupHtml ({ props, handler, coordinates, layerId }, evt) {
    let html = _.isString(handler) ? handler : undefined
    if (_.isFunction(handler)) html = await handler.call(this, { props, coordinates, layerId }, evt)
    if (!html) html = props.name ?? props.title ?? props.description ?? ''
    return html
  }

  getEventCoordinates (evt) {
    let coordinates = evt.features[0].geometry.coordinates.slice()
    if (_.isArray(coordinates[0])) {
      const centroid = turf.centroid(evt.features[0])
      coordinates = centroid.geometry.coordinates
    }
    while (Math.abs(evt.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += evt.lngLat.lng > coordinates[0] ? 360 : -360
    }
    return coordinates
  }

  async extractPopup ({ evt, layerId, handler, props, coordinates }) {
    props = props ?? evt.features[0].properties
    coordinates = coordinates ?? this.getEventCoordinates(evt)
    const html = await this.createPopupHtml({ props, handler, coordinates, layerId }, evt)
    return { props, coordinates, html }
  }

  createPopup () {
    if (!this.popup) {
      this.popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false
      })
    }
    return this.popup
  }

  async handleNonClusterClick (layerId, handler = 'name') {
    if (handler === true) handler = 'name'
    this.handlePointer(layerId)
    this.map.on('click', layerId, async evt => {
      const { coordinates, html, props } = await this.extractPopup({ evt, layerId, handler })
      const popup = this.createPopup()
      popup._props = props
      popup._coordinates = coordinates
      popup
        .setLngLat(coordinates)
        .setHTML(html)
        .addTo(this.map)
        .addClassName('popup-layer-' + layerId)
        .addClassName('popup-target-' + props.id + '-' + props.feed)
    })
    this.map.on('click', () => {
      if (this.popup) this.popup.remove()
    })
  }

  popup ({ layerId, props, html, coordinates }) {
    return new maplibregl.Popup({ className: 'popup-layer-' + layerId + ' popup-target-' + props.id })
      .setLngLat(coordinates)
      .setHTML(html)
      .addTo(this.map)
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

  handlePointer (layerId) {
    this.map.on('mouseenter', layerId, () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })
    this.map.on('mouseleave', layerId, () => {
      this.map.getCanvas().style.cursor = ''
    })
  }

  closePopup () {
    if (this.popup) this.popup.remove()
  }

  async loadImage (src) {
    if (_.isString(src)) {
      const [url, id] = src.split(';')
      src = { url, id }
    }
    if (!src.id) src.id = _.last(src.url.split('?')[0].split('#')[0].split('/')).split('.')[0]
    if (this.map.listImages().includes(src.id)) return
    const image = await this.map.loadImage(src.url)
    this.map.addImage(src.id, image.data)
  }

  async loadImages (sources, fetch = true) {
    for (const src of sources) {
      if (fetch) {
        const data = await wmpa.fetchApi(src)
        if (_.isEmpty(data)) continue
        for (const d of data) {
          this.loadImage(d)
        }
      } else await this.loadImage(src)
    }
  }

  async createControl (options = {}) {
    const ctrl = new WaibuMapsControl(options)
    ctrl.scope = this.scope
    if (options.builder) {
      if (_.isArray(options.builder)) ctrl.panels = options.builder
      else if (_.isString(options.builder)) {
        ctrl.panels = await wmpa.createComponent(options.builder)
      } else {
        const fn = options.builder.bind(ctrl.scope)
        ctrl.panels = await fn(options.params)
      }
    }
    this.map.addControl(ctrl)
    if (options.firstCall) options.firstCall.call(ctrl.scope)
    return ctrl
  }

  async createControlNative (className, options = {}) {
    const name = wmpa.pascalCase(className)
    const ctrl = new maplibregl[name](options)
    let type = options.classSelector
    if (!type) {
      const types = _.kebabCase(className).split('-')
      types.pop()
      type = 'maplibregl-ctrl-' + types.join('-')
    }
    this.map.addControl(ctrl, options.position)
    let el = document.querySelector('#' + this.map._container.id + ' .' + type)
    if (el) {
      if (options.classGroup) el = el.closest('.maplibregl-ctrl-group')
      el.setAttribute('oncontextmenu', 'return false')
      el.setAttribute('x-data', '')
      el.setAttribute('x-show', '$store.map.ctrl' + name)
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

  getSourceId (id, ext) {
    return 's-' + _.kebabCase(id) + (_.isEmpty(ext) ? '' : ('-' + ext))
  }

  getLayerId (id, ext = '') {
    return 'l-' + _.kebabCase(id) + (_.isEmpty(ext) ? '' : ('-' + ext))
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
      const sourceId = this.getSourceId(src.code)
      const layerId = this.getLayerId(src.code)
      sources[sourceId] = _.merge({}, this.defSources, { name: src.name, provider: src.provider, tiles: [src.url], attribution: src.attribution, minzoom: src.minZoom ?? 1, maxzoom: src.maxZoom ?? 19 })
      const layers = [_.merge({}, this.defLayer, { id: layerId, source: sourceId })]
      _.merge(result, this.defStyle, { sources, layers })
    }
    return result
  }
}

class WaibuMapsControl { // eslint-disable-line no-unused-vars
  constructor (options = {}) {
    this.position = options.position ?? 'top-right'
    this.class = options.class
  }

  createControl () {
    this.container = document.createElement('div')
    // this.container.setAttribute('oncontextmenu', 'return false')
    this.container.classList.add('maplibregl-ctrl', 'maplibregl-ctrl-wmaps')
    if (this.class) {
      const classes = _.without(this.class.split(' '), '', null, undefined)
      if (classes.length > 0) {
        this.container.classList.add(...classes)
        const ctrlName = 'ctrl' + wmpa.pascalCase(classes[0])
        if (_.has(Alpine.store('map'), ctrlName)) {
          this.container.setAttribute('x-show', 'Alpine.store(\'map\')[\'' + ctrlName + '\']') // first class will be used as control switch class
        }
      }
    }
    if (this.panels) {
      if (!_.isArray(this.panels)) this.panels = [this.panels]
      if (this.panels.length > 0) {
        for (const panel of this.panels) {
          this.container.appendChild(panel)
        }
      }
    }
  }

  onAdd (map) {
    this.map = map
    this.createControl()
    return this.container
  }

  onRemove () {
    this.container.parentNode.removeChild(this.container)
    this.map = undefined
    this.scope = undefined
  }

  getDefaultPosition () {
    return this.position
  }
}

const wmapsUtil = new WaibuMapsUtil() // eslint-disable-line no-unused-vars

// patch
window.setInterval = WorkerTimers.setInterval
window.clearInterval = WorkerTimers.clearInterval
window.setTimeout = WorkerTimers.setTimeout
window.clearTimeout = WorkerTimers.clearTimeout

const _warn = console.warn
console.warn = (...items) => {
  if (!(items[0] ?? '').includes('could not be loaded. Please make sure you have added the image with')) _warn(...items)
}
