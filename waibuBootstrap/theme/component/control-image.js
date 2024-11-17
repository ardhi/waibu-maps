import { scripts, css, ctrlPos } from './map.js'

const ccss = [...css]
ccss.push('waibuMaps.asset:/css/control-image.css')
const cscripts = [...scripts]
cscripts.push('waibuMaps.asset:/js/control-image.js')

const controlImage = {
  scripts: cscripts,
  css: ccss,
  handler: async function (params = {}) {
    const { routePath } = this.plugin.app.waibu
    const { jsonStringify } = this.plugin.app.waibuMpa
    const { isString, pick } = this.plugin.app.bajo.lib._
    params.noTag = true
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : 'top-left'
    const opts = {}
    if (isString(params.attr.url)) opts.url = routePath(params.attr.url)
    if (isString(params.attr.imageUrl)) opts.imageUrl = routePath(params.attr.imageUrl)
    if (isString(params.attr.imageStyle)) opts.imageStyle = params.attr.imageStyle
    if (isString(params.attr.text)) opts.text = params.attr.text
    if (isString(params.attr.dataBsTarget)) {
      opts.attrib = pick(params.attr, ['dataBsTarget', 'dataBsToggle', 'ariaControls'])
    }
    params.html = `<script type="controlImage">
      this.map.addControl(new ControlImage(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
    </script>`
  }
}

export default controlImage
