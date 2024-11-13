import { scripts, css, ctrlPos } from './map.js'

const cscripts = [...scripts]
cscripts.push(
  'waibuMaps.asset:/js/control-logo.js'
)

const controlLogo = {
  scripts: cscripts,
  css,
  handler: async function (params = {}) {
    const { routePath } = this.plugin.app.waibu
    const { jsonStringify } = this.plugin.app.waibuMpa
    const { isString } = this.plugin.app.bajo.lib._
    params.noTag = true
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : 'top-left'
    const opts = {}
    if (isString(params.attr.url)) opts.url = routePath(params.attr.url)
    if (isString(params.attr.logo)) opts.logo = routePath(params.attr.logo)
    if (isString(params.attr.text)) opts.text = params.attr.text
    params.html = `<script type="controlLogo">
      this.map.addControl(new ControlLogo(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
    </script>`
  }
}

export default controlLogo
