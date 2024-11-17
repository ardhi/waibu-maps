import { scripts, css, ctrlPos } from './map.js'

const controlScale = {
  scripts,
  css,
  handler: async function (params = {}) {
    const { jsonStringify } = this.plugin.app.waibuMpa
    const { isString } = this.plugin.app.bajo.lib._
    params.noTag = true
    const opts = {}
    if (['imperial', 'metric', 'nautical'].includes(params.attr.unit)) opts.unit = params.attr.unit
    if (isString(params.attr.maxWidth) && Number(params.attr.maxWidth)) opts.maxWidth = Number(params.attr.maxWidth)
    params.attr.store = isString(params.attr.store) ? params.attr.store : 'controlScale'
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : undefined
    params.html = `<script type="controlScale">
      this.map.addControl(new maplibregl.ScaleControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
      el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-scale')
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

export default controlScale
