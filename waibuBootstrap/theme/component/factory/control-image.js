import control from './control.js'

async function controlImage () {
  const WmapsControl = await control.call(this)

  return class WmapsControlImage extends WmapsControl {
    static scripts = [
      ...super.scripts,
      'waibuMaps.asset:/js/control-image.js'
    ]

    static css = [
      ...super.css,
      'waibuMaps.asset:/css/control-image.css'
    ]

    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { routePath } = this.plugin.app.waibu
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { isString, pick } = this.plugin.app.bajo.lib._
      const pos = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      const opts = {}
      if (isString(this.params.attr.url)) opts.url = routePath(this.params.attr.url)
      if (isString(this.params.attr.imageUrl)) opts.imageUrl = routePath(this.params.attr.imageUrl)
      if (isString(this.params.attr.imageStyle)) opts.imageStyle = this.params.attr.imageStyle
      if (isString(this.params.attr.text)) opts.text = this.params.attr.text
      if (isString(this.params.attr.dataBsTarget)) {
        opts.attrib = pick(this.params.attr, ['dataBsTarget', 'dataBsToggle', 'ariaControls'])
      }
      this.block.control.push(`
        map.addControl(new ControlImage(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlImage
