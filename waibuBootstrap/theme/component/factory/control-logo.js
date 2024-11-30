import wmapsBase from '../wmaps-base.js'

async function controlLogo (component) {
  const WmapsBase = await wmapsBase(component)

  return class WmapsControlLogo extends WmapsBase {
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
      const pos = WmapsBase.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      const opts = {
        imageUrl: routePath(`waibuMpa:/logo/${logo}`),
        fn: 'wbs.appLauncher',
        fnParams: 'user - fullscreen darkmode language',
        imageWidth: 48,
        imageHeight: 48
      }
      this.params.html = `<script type="controlImage">
        this.map.addControl(new ControlImage(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
      </script>`
    }
  }
}

export default controlLogo
