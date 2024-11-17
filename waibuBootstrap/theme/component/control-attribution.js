import { scripts, css, ctrlPos } from './map.js'

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
    params.attr.store = isString(params.attr.store) ? params.attr.store : 'controlAttribution'
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : undefined
    params.html = `<script type="controlAttribution">
      this.map.addControl(new maplibregl.AttributionControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
      el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-attrib')
      el.setAttribute('x-data', '')
      el.setAttribute('x-show', '$store.${params.attr.store}.on')
    </script>
    <script type="initializing">
      Alpine.store('${params.attr.store}', {
        on: Alpine.$persist(true).as('${params.attr.store}On')
      })
    </script>`
  }
}

export default controlAttribution
