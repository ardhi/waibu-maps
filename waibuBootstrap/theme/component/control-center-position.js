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
    const hasStore = isString(params.attr.store)
    params.html = '<div class="childmap maplibregl-ctrl-center" x-data>'
    if (hasStore) {
      params.html += `
        <div x-show="$store.${params.attr.store}.on"></div>
      </div>
      <script type="initializing">
        Alpine.store('${params.attr.store}', {
          on: Alpine.$persist(true).as('${params.attr.store}On')
        })
      </script>
      `
    } else params.html += '</div>'
  }
}

export default controlCenterPosition
