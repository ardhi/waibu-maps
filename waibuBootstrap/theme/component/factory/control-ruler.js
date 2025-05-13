import control from './control.js'
const storeKey = 'crlr'

async function controlRuler () {
  const WmapsControl = await control.call(this)

  return class WmapsControlRuler extends WmapsControl {
    static scripts = [
      ...super.scripts,
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

    build = async () => {
      const { routePath } = this.plugin.app.waibu
      const { jsonStringify } = this.plugin.app.waibuMpa
      const pos = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'bottom-right'
      const opts = {
        imageUrl: routePath('waibuMaps.asset:/image/ruler.svg')
      }
      this.addBlock('control', `
        const rulerCtrl = new ControlRuler(${jsonStringify(opts, true)})
        map.addControl(rulerCtrl${pos ? `, '${pos}'` : ''})
        if (this.$store.map) {
          el = document.querySelector('#' + map._container.id + ' .maplibregl-ctrl-crlr')
          el.setAttribute('x-data', '')
          el.setAttribute('x-show', '$store.mapCtrl.${storeKey}')
          // TODO: disable measuring first
          // el.setAttribute('x-init', "$watch('$store.${storeKey}', val => console.log(rulerCtrl))")
        }
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlRuler
