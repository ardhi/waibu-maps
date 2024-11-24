import { scripts, css, ctrlPos } from './map.js'
const storeKey = 'mapControl.nav'

const controlNavigation = {
  scripts,
  css,
  handler: async function (params = {}) {
    const { jsonStringify } = this.plugin.app.waibuMpa
    params.noTag = true
    const opts = {}
    if (params.attr.noCompass) opts.showCompass = false
    if (params.attr.noZoom) opts.showZoom = false
    if (params.attr.visualizePitch) opts.visualizePitch = true
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : undefined
    params.html = `<script type="controlNavigation">
      this.map.addControl(new maplibregl.NavigationControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
      if (Alpine.store('mapControl')) {
        el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-zoom-in').closest('.maplibregl-ctrl-group')
        el.setAttribute('x-data', '')
        el.setAttribute('x-show', '$store.${storeKey}')
      }
    </script>`
  }
}

export default controlNavigation
