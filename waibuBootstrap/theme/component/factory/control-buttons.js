import wmapsBase from '../wmaps-base.js'

async function controlButtons () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsControlButtons extends WmapsBase {
    static scripts = [
      ...super.scripts,
      'waibuMaps.asset:/js/control-buttons.js'
    ]

    static css = [
      ...super.css,
      'waibuMaps.asset:/css/control-buttons.css'
    ]

    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { generateId } = this.plugin.app.bajo
      const { routePath } = this.plugin.app.waibu
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { isEmpty, isString, pick, camelCase } = this.plugin.app.bajo.lib._
      const { $ } = this.component
      const pos = WmapsBase.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      const items = []
      $(`<div>${this.params.html}</div>`).find('div').each(function () {
        const attrs = {}
        for (const k in this.attribs) {
          attrs[camelCase(k)] = this.attribs[k]
        }
        const opts = { id: attrs.id ?? generateId('alpha') }
        if (attrs.dropdown) {
          opts.fn = attrs.dropdown
          opts.fnParams = opts.id
          opts.dropdown = true
        } else if (attrs.openTab) {
          opts.url = attrs.openTab
          opts.tab = true
        } else if (attrs.openUrl) {
          opts.url = attrs.openTab
        } else { // open modal
          opts.url = routePath(attrs.url)
          if (isString(attrs.dataBsTarget)) {
            opts.attrib = pick(attrs, ['dataBsTarget', 'dataBsToggle', 'ariaControls'])
          }
        }
        if (isString(attrs.imageUrl)) opts.imageUrl = routePath(attrs.imageUrl)
        opts.icon = $(this).find('i').prop('class')
        items.push(opts)
      })
      this.params.html = ''
      if (!isEmpty(items)) {
        this.params.html = `<script type="controlButtons">
          this.map.addControl(new ControlButtons(${jsonStringify({ items, position: pos }, true)})${pos ? `, '${pos}'` : ''})
        </script>`
      }
    }
  }
}

export default controlButtons
