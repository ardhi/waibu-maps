import wmapsBase from '../wmaps-base.js'

async function controlImage () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsControlImage extends WmapsBase {
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
      const pos = WmapsBase.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      const opts = {}
      if (isString(this.params.attr.url)) opts.url = routePath(this.params.attr.url)
      if (isString(this.params.attr.imageUrl)) opts.imageUrl = routePath(this.params.attr.imageUrl)
      if (isString(this.params.attr.imageStyle)) opts.imageStyle = this.params.attr.imageStyle
      if (isString(this.params.attr.text)) opts.text = this.params.attr.text
      if (isString(this.params.attr.dataBsTarget)) {
        opts.attrib = pick(this.params.attr, ['dataBsTarget', 'dataBsToggle', 'ariaControls'])
      }
      this.params.html = `<script type="controlImage">
        this.map.addControl(new ControlImage(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
      </script>`
    }
  }
}

export default controlImage
