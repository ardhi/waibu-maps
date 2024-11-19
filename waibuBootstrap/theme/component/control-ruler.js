import { scripts, css, ctrlPos } from './map.js'

const cscripts = [...scripts]
cscripts.push(
  'bajoSpatial.virtual:/geolib/lib/index.js',
  'waibuMaps.asset:/js/control-ruler.js'
)
const ccss = [...css]
ccss.push('waibuMaps.asset:/css/control-ruler.css')

const controlMousePosition = {
  scripts: cscripts,
  css: ccss,
  handler: async function (params = {}) {
    const { isString } = this.plugin.app.bajo.lib._
    const { routePath } = this.plugin.app.waibu
    const { jsonStringify } = this.plugin.app.waibuMpa
    params.noTag = true
    const hasStore = isString(params.attr.store)
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : 'top-left'
    const opts = {
      imageUrl: routePath('waibuMaps.asset:/image/ruler.svg')
    }
    params.html = `<script type="controlRuler">
      const rulerCtrl = new ControlRuler(${jsonStringify(opts, true)})
      this.map.addControl(rulerCtrl${pos ? `, '${pos}'` : ''})`
    if (hasStore) {
      params.html += `
          el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-ruler')
          el.setAttribute('x-data', '')
          el.setAttribute('x-show', '$store.${params.attr.store}.on')
          // TODO: disable measuring first
          // el.setAttribute('x-init', "$watch('$store.${params.attr.store}.on', val => console.log(rulerCtrl))")
        </script>
        <script type="initializing">
          Alpine.store('${params.attr.store}', {
            on: Alpine.$persist(true).as('${params.attr.store}On')
          })
        </script>`
    } else params.html += '</script>'
  }
}

export default controlMousePosition
