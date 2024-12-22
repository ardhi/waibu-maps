import control from './control.js'

async function controlButtons () {
  const WmapsControl = await control.call(this)

  return class WmapsControlButtons extends WmapsControl {
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
      const { jsonStringify, attrToArray } = this.plugin.app.waibuMpa
      const { isEmpty, isString, pick, camelCase } = this.plugin.app.bajo.lib._
      const { $ } = this.component
      const pos = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-right'
      const classes = attrToArray(this.params.attr.classes)
      const items = []
      $(`<div>${this.params.html}</div>`).find('div').each(function () {
        const attrs = {}
        for (const k in this.attribs) {
          attrs[camelCase(k)] = this.attribs[k]
        }
        const opts = { id: attrs.id ?? generateId('alpha') }
        if (attrs.minZoom) opts.minZoom = Number(attrs.minZoom) || 0
        if (attrs.dropdown) {
          opts.fn = attrs.dropdown
          opts.fnParams = opts.id
          opts.dropdown = true
        } else if (attrs.openTab) {
          opts.url = attrs.openTab
          opts.tab = true
        } else if (attrs.openUrl) {
          opts.url = attrs.openTab
        } else if (isString(attrs.dataBsTarget)) {
          opts.attrib = pick(attrs, ['dataBsTarget', 'dataBsToggle', 'ariaControls'])
        } else if (attrs.fn) {
          opts.fn = attrs.fn
        }
        if (isString(attrs.imageUrl)) opts.imageUrl = routePath(attrs.imageUrl)
        opts.icon = $(this).find('i').prop('class')
        items.push(opts)
      })
      this.params.html = ''
      if (!isEmpty(items)) {
        this.block.control.push(`
          map.addControl(new ControlButtons(_.merge(${jsonStringify({ classes, items, position: pos }, true)}, { scopeId: Alpine.store('map').id }))${pos ? `, '${pos}'` : ''})
        `)
        this.params.html = this.writeBlock()
      }
    }
  }
}

export default controlButtons
