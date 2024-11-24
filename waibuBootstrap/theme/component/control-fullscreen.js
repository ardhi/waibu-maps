import { scripts, css, ctrlPos } from './map.js'
const storeKey = 'mapControl.fullscreen'

const controlFullscreen = {
  scripts,
  css,
  handler: async function (params = {}) {
    const { jsonStringify } = this.plugin.app.waibuMpa
    const { isString } = this.plugin.app.bajo.lib._
    params.noTag = true
    const opts = {}
    if (isString(params.attr.container)) opts.container = params.attr.container
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : undefined
    params.html = `<script type="controlFullscreen">
      this.map.addControl(new maplibregl.FullscreenControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
      if (Alpine.store('mapControl')) {
        el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-fullscreen').closest('.maplibregl-ctrl-group')
        el.setAttribute('x-data', '')
        el.setAttribute('x-show', '$store.${storeKey}')
      }
    </script>`
  }
}

export default controlFullscreen
