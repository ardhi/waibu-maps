import { scripts, css, ctrlPos } from './map.js'
const storeKey = 'mapControl.geolocate'

const controlGeolocate = {
  scripts,
  css,
  handler: async function (params = {}) {
    const { jsonStringify } = this.plugin.app.waibuMpa
    const { set } = this.plugin.app.bajo.lib._
    params.noTag = true
    const opts = {}
    if (params.attr.highAccuracy) set(opts, 'positionOptions.enableHighAccuracy', true)
    if (params.attr.trackUserLocation) opts.trackUserLocation = true
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : undefined
    params.html = `<script type="controlFullscreen">
      this.map.addControl(new maplibregl.GeolocateControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
      if (Alpine.store('mapControl')) {
        el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-geolocate').closest('.maplibregl-ctrl-group')
        el.setAttribute('x-data', '')
        el.setAttribute('x-show', '$store.${storeKey}')
      }
    </script>`
  }
}

export default controlGeolocate
