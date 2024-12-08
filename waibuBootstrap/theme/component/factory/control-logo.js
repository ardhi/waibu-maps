import control from './control.js'

async function controlLogo () {
  const WmapsControl = await control.call(this)

  return class WmapsControlLogo extends WmapsControl {
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
      const { fastGlob } = this.plugin.app.bajo.lib
      const { routePath } = this.plugin.app.waibu
      const { jsonStringify } = this.plugin.app.waibuMpa
      let logo = 'waibu'
      const files = await fastGlob(`${this.plugin.app.main.dir.pkg}/bajo/logo.*`)
      if (files.length > 0) logo = 'main'
      const pos = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      const opts = {
        imageUrl: routePath(`waibuMpa:/logo/${logo}`),
        fn: 'wbs.appLauncher',
        fnParams: 'user - fullscreen darkmode language',
        imageWidth: 48,
        imageHeight: 48
      }
      this.block.control.push(`
        this.map.addControl(new ControlImage(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlLogo
