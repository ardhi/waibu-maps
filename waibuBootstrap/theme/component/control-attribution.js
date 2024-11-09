import { scripts, css, ctrlPos } from './map.js'

const controlAttribution = {
  scripts,
  css,
  handler: async function (params = {}) {
    const { jsonStringify } = this.plugin.app.waibuMpa
    const { isString } = this.plugin.app.bajo.lib._
    params.noTag = true
    const opts = {}
    if (params.attr.compact) opts.compact = true
    if (isString(params.attr.text)) opts.customAttribution = params.attr.text
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : undefined
    params.html = `<script control-attribution>
      map.addControl(new maplibregl.AttributionControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
    </script>`
  }
}

export default controlAttribution
