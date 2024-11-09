import { scripts, css, ctrlPos } from './map.js'

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
    params.html = `<script control-fullscreen>
      map.addControl(new maplibregl.GeolocateControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
    </script>`
  }
}

export default controlGeolocate
