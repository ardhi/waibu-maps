import wmapsBase from '../wmaps-base.js'

const storeKey = 'mapControl.ruler'

async function controlRuler (component) {
  const WmapsBase = await wmapsBase(component)

  return class WmapsControlRuler extends WmapsBase {
    static scripts = [
      ...super.scripts,
      'bajoSpatial.virtual:/geolib/lib/index.js',
      'waibuMaps.asset:/js/control-ruler.js'
    ]

    static css = [
      ...super.css,
      'waibuMaps.asset:/css/control-ruler.css'
    ]

    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { routePath } = this.plugin.app.waibu
      const { jsonStringify } = this.plugin.app.waibuMpa
      const pos = WmapsBase.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      const opts = {
        imageUrl: routePath('waibuMaps.asset:/image/ruler.svg')
      }
      this.params.html = `<script type="controlRuler">
        const rulerCtrl = new ControlRuler(${jsonStringify(opts, true)})
        this.map.addControl(rulerCtrl${pos ? `, '${pos}'` : ''})
        if (Alpine.store('mapControl')) {
          el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-ruler')
          el.setAttribute('x-data', '')
          el.setAttribute('x-show', '$store.${storeKey}')
          // TODO: disable measuring first
          // el.setAttribute('x-init', "$watch('$store.${storeKey}', val => console.log(rulerCtrl))")
        }
      </script>`
    }
  }
}

export default controlRuler
