import control from './control.js'
const storeKey = 'mapControl.centerPos'

async function controlCenterPosition () {
  const WmapsControl = await control.call(this)

  return class WmapsControlCenterPosition extends WmapsControl {
    static scripts = [
      ...super.scripts,
      'waibuMaps.asset:/js/control-center-position.js'
    ]

    static css = [
      ...super.css,
      'waibuMaps.asset:/css/control-center-position.css'
    ]

    constructor (options) {
      super(options)
      this.params.noTag = true
      this.params.html = `<div class="childmap maplibregl-ctrl-center" x-data>
        <div x-show="$store.mapControl ? $store.${storeKey} : true"></div>
      </div>`
    }
  }
}

export default controlCenterPosition
