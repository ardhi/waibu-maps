import { scripts, css, ctrlPos } from './map.js'

const ccss = [...css]
ccss.push('waibuMaps.asset:/css/control-image.css')
const cscripts = [...scripts]
cscripts.push('waibuMaps.asset:/js/control-image.js')

const controlLogo = {
  css: ccss,
  scripts: cscripts,
  handler: async function (params = {}) {
    const { fastGlob } = this.plugin.app.bajo.lib
    const { routePath } = this.plugin.app.waibu
    const { jsonStringify } = this.plugin.app.waibuMpa
    params.noTag = true
    let logo = 'waibu'
    const files = await fastGlob(`${this.plugin.app.main.dir.pkg}/bajo/logo.*`)
    if (files.length > 0) logo = 'main'
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : 'top-left'
    const opts = {
      imageUrl: routePath(`waibuMpa:/logo/${logo}`),
      fn: 'wbs.appLauncher',
      fnParams: 'user - fullscreen darkmode language',
      imageWidth: 48,
      imageHeight: 48
    }
    params.html = `<script type="controlImage">
      this.map.addControl(new ControlImage(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
    </script>`
  }
}

export default controlLogo
