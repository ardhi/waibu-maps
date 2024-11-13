import { scripts, css, ctrlPos } from './map.js'

const cscripts = [...scripts]
cscripts.push(
  'bajoSpatial.virtual:/geolib/lib/index.js',
  'waibuMaps.asset:/js/control-ruler.js'
)
const ccss = ['$waibuMaps.asset:/css/control-ruler.css', ...css]

const controlMousePosition = {
  scripts: cscripts,
  css: ccss,
  handler: async function (params = {}) {
    const { routePath } = this.plugin.app.waibu
    const { jsonStringify } = this.plugin.app.waibuMpa
    params.noTag = true
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : 'top-left'
    const opts = {
      icon: routePath('waibuMaps.asset:/image/ruler.svg')
    }
    params.html = `<script type="controlRuler">
      this.map.addControl(new ControlRuler(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
    </script>`
  }
}

export default controlMousePosition
