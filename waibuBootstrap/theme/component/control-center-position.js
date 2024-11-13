import { scripts, css } from './map.js'

const cscripts = ['$waibuMaps.asset:/js/control-center-position.js', ...scripts]
const ccss = ['$waibuMaps.asset:/css/control-center-position.css', ...css]

const controlCenterPosition = {
  scripts: cscripts,
  css: ccss,
  handler: async function (params = {}) {
    params.noTag = true
    params.html = `<div class="maplibregl-childmap maplibregl-ctrl-center">
      <div></div>
    </div>`
  }
}

export default controlCenterPosition
