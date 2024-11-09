import { scripts, css, ctrlPos } from './map.js'

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
    params.html = `<script control-navigation>
      map.addControl(new maplibregl.NavigationControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
    </script>`
  }
}

export default controlNavigation
