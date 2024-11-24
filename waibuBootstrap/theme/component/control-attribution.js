import { scripts, css, ctrlPos } from './map.js'
const storeKey = 'mapControl.attrib'

const controlAttribution = {
  scripts,
  css,
  handler: async function (params = {}) {
    const { jsonStringify } = this.plugin.app.waibuMpa
    const { isString } = this.plugin.app.bajo.lib._
    params.noTag = true
    const opts = {
      compact: !params.attr.noCompact
    }
    if (isString(params.attr.text)) opts.customAttribution = params.attr.text
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : undefined
    params.html = `<script type="controlAttribution">
      this.map.addControl(new maplibregl.AttributionControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
      if (Alpine.store('mapControl')) {
        el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-attrib')
        el.setAttribute('x-data', '')
        el.setAttribute('x-show', '$store.${storeKey}')
      }
    </script>`
  }
}

export default controlAttribution
