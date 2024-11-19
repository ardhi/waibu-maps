import { scripts, css, ctrlPos } from './map.js'

const controlNavigation = {
  scripts,
  css,
  handler: async function (params = {}) {
    const { isString } = this.plugin.app.bajo.lib._
    const { jsonStringify } = this.plugin.app.waibuMpa
    params.noTag = true
    const opts = {}
    if (params.attr.noCompass) opts.showCompass = false
    if (params.attr.noZoom) opts.showZoom = false
    if (params.attr.visualizePitch) opts.visualizePitch = true
    const hasStore = isString(params.attr.store)
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : undefined
    params.html = `<script type="controlNavigation">
      this.map.addControl(new maplibregl.NavigationControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})`
    if (hasStore) {
      params.html += `
          el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-zoom-in').closest('.maplibregl-ctrl-group')
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

export default controlNavigation
