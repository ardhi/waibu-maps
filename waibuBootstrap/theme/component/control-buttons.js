import { scripts, css, ctrlPos } from './map.js'

const ccss = [...css]
ccss.push('waibuMaps.asset:/css/control-buttons.css')
const cscripts = [...scripts]
cscripts.push('waibuMaps.asset:/js/control-buttons.js')

const controlButtons = {
  scripts: cscripts,
  css: ccss,
  handler: async function (params = {}) {
    const { routePath } = this.plugin.app.waibu
    const { jsonStringify } = this.plugin.app.waibuMpa
    const { isEmpty, isString, pick, camelCase } = this.plugin.app.bajo.lib._
    const $ = this.$
    params.noTag = true
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : 'top-left'
    const items = []
    $(`<div>${params.html}</div>`).find('div').each(function () {
      const opts = {}
      const attrs = {}
      for (const k in this.attribs) {
        attrs[camelCase(k)] = this.attribs[k]
      }
      if (isString(attrs.url)) opts.url = routePath(attrs.url)
      if (isString(attrs.imageUrl)) opts.imageUrl = routePath(attrs.imageUrl)
      if (isString(attrs.dataBsTarget)) {
        opts.attrib = pick(attrs, ['dataBsTarget', 'dataBsToggle', 'ariaControls'])
      }
      if (isString(attrs.newTab)) opts.newTab = true
      if (isString(attrs.fn)) opts.fn = attrs.fn
      if (isString(attrs.fnParams)) opts.fnParams = attrs.fnParams
      opts.icon = $(this).find('i').prop('class')
      items.push(opts)
    })
    params.html = ''
    if (!isEmpty(items)) {
      params.html = `<script type="controlButtons">
        this.map.addControl(new ControlButtons(${jsonStringify({ items }, true)})${pos ? `, '${pos}'` : ''})
      </script>`
    }
  }
}

export default controlButtons
