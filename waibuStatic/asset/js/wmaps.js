/* global maplibregl, geolib */

class WMaps { // eslint-disable-line no-unused-vars
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

  async handleNonClusterClick (layerId, handler) {
    this.map.on('click', layerId, async (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice()

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      if (handler) await handler.call(this, e, coordinates, layerId)
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

  popup (html, coordinates) {
    new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(html)
      .addTo(this.map)
  }

  handleClusterPointer (layerId) {
    this.map.on('mouseenter', layerId, () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })
    this.map.on('mouseleave', layerId, () => {
      this.map.getCanvas().style.cursor = ''
    })
  }
}

class WMapsUtil {
  decToDms (decimal, opts = {}) {
    if (opts === true || opts === false) opts = { isLng: opts }
    opts.north = opts.north ?? 'N'
    opts.south = opts.south ?? 'S'
    opts.east = opts.east ?? 'E'
    opts.west = opts.west ?? 'W'
    const result = geolib.decimalToSexagesimal(decimal)
    if (opts.isLng) return `${result} ${decimal >= 0 ? opts.east : opts.west}`
    else return `${result} ${decimal >= 0 ? opts.north : opts.south}`
  }
}

const wmapsUtil = new WMapsUtil() // eslint-disable-line no-unused-vars
