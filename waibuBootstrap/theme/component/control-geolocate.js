import { scripts, css, ctrlPos } from './map.js'

const controlGeolocate = {
  scripts,
  css,
  handler: async function (params = {}) {
    const { jsonStringify } = this.plugin.app.waibuMpa
    const { set, isString } = this.plugin.app.bajo.lib._
    params.noTag = true
    const opts = {}
    if (params.attr.highAccuracy) set(opts, 'positionOptions.enableHighAccuracy', true)
    if (params.attr.trackUserLocation) opts.trackUserLocation = true
    const hasStore = isString(params.attr.store)
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : undefined
    params.html = `<script type="controlFullscreen">
      this.map.addControl(new maplibregl.GeolocateControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})`
    if (hasStore) {
      params.html += `
          el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-geolocate').closest('.maplibregl-ctrl-group')
          el.setAttribute('x-data', '')
          el.setAttribute('x-show', '$store.${params.attr.store}.on')
        </script>
        <script type="initializing">
          Alpine.store('${params.attr.store}', {
            on: Alpine.$persist(true).as('${params.attr.store}On')
          })
        </script>`
    } else params.html += '</script>'
  }
}

export default controlGeolocate
