import { scripts, css } from './map.js'

const cscripts = [...scripts]
cscripts.push('waibuMaps.asset:/js/control-center-position.js')
const ccss = [...css]
ccss.push('waibuMaps.asset:/css/control-center-position.css')
const storeKey = 'mapControl.centerPos'

const controlCenterPosition = {
  scripts: cscripts,
  css: ccss,
  handler: async function (params = {}) {
    params.noTag = true
    params.html = `<div class="childmap maplibregl-ctrl-center" x-data>
      <div x-show="$store.mapControl ? $store.${storeKey} : true"></div>
    </div>`
  }
}

export default controlCenterPosition
