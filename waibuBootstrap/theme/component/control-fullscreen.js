import { scripts, css, ctrlPos } from './map.js'

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
    const hasStore = isString(params.attr.store)
    params.html = `<script type="controlFullscreen">
      this.map.addControl(new maplibregl.FullscreenControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})`
    if (hasStore) {
      params.html += `
          el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-fullscreen').closest('.maplibregl-ctrl-group')
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

export default controlFullscreen
