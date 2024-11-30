import wmapsBase from '../wmaps-base.js'

const storeKey = 'mapControl.centerPos'

async function controlCenterPosition (component) {
  const WmapsBase = await wmapsBase(component)

  return class WmapsControlCenterPosition extends WmapsBase {
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
