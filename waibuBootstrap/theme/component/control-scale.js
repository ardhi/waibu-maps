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
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : undefined
    params.html = `<script control-scale>
      map.addControl(new maplibregl.ScaleControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
    </script>`
  }
}

export default controlScale
