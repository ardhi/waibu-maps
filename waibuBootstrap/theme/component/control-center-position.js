import { scripts, css } from './map.js'

const cscripts = [...scripts]
cscripts.push('waibuMaps.asset:/js/control-center-position.js')
const ccss = [...css]
ccss.push('waibuMaps.asset:/css/control-center-position.css')

const controlCenterPosition = {
  scripts: cscripts,
  css: ccss,
  handler: async function (params = {}) {
    const { isString } = this.plugin.app.bajo.lib._
    params.noTag = true
    params.attr.store = isString(params.attr.store) ? params.attr.store : 'controlCenterPosition'
    params.html = `<div class="childmap maplibregl-ctrl-center" x-data>
      <div x-show="$store.${params.attr.store}.on"></div>
    </div>
    <script type="initializing">
      Alpine.store('${params.attr.store}', {
        on: Alpine.$persist(true).as('${params.attr.store}On')
      })
    </script>
    `
  }
}

export default controlCenterPosition
