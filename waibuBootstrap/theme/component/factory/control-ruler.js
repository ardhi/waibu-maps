import control from './control.js'
const storeKey = 'mapControl.ruler'

async function controlRuler () {
  const WmapsControl = await control.call(this)

  return class WmapsControlRuler extends WmapsControl {
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
      const pos = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'bottom-right'
      const opts = {
        imageUrl: routePath('waibuMaps.asset:/image/ruler.svg')
      }
      this.block.control.push(`
        const rulerCtrl = new ControlRuler(${jsonStringify(opts, true)})
        map.addControl(rulerCtrl${pos ? `, '${pos}'` : ''})
        if (Alpine.store('mapControl')) {
          el = document.querySelector('#' + map._container.id + ' .maplibregl-ctrl-ruler')
          el.setAttribute('x-data', '')
          el.setAttribute('x-show', '$store.${storeKey}')
          // TODO: disable measuring first
          // el.setAttribute('x-init', "$watch('$store.${storeKey}', val => console.log(rulerCtrl))")
        }
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlRuler
