import cmpMapControls from '../../../lib/cmp-map-controls.js'
import { opts, cmpMapOptions } from '../../../lib/cmp-map-options.js'

export const scripts = 'waibuMaps.virtual:/maplibre/maplibre-gl.js'
export const css = 'waibuMaps.virtual:/maplibre/maplibre-gl.css'
export const ctrlPos = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

const map = {
  scripts,
  css,
  handler: async function (params = {}) {
    const { generateId } = this.plugin.app.bajo
    const { trim, isEmpty, omit, keys } = this.plugin.app.bajo.lib._
    const { jsonStringify } = this.plugin.app.waibuMpa
    const { routePath } = this.plugin.app.waibu

    params.attr.id = params.attr.id ?? generateId('alpha')
    const mapOpts = this.plugin.app.waibuMaps.getConfig().mapOptions
    mapOpts.style = routePath(mapOpts.style)
    if (this.$(`<div>${params.html}</div>`).find('script[control-attribution]').prop('innerHTML')) {
      mapOpts.attributionControl = false
    }
    cmpMapOptions.call(this, params, mapOpts)
    const initScripts = cmpMapControls.call(this, params)

    params.tag = 'div'
    params.attr['x-data'] = `map${params.attr.id}`
    params.attr['@load.window'] = `
      const options = ${jsonStringify(mapOpts, true)}
      initMap(new maplibregl.Map(options))
      runMap()
    `
    const runScript = this.$(`<div>${params.html}</div>`).find('script[type="run"]').prop('innerHTML')
    const initScript = this.$(`<div>${params.html}</div>`).find('script[type="init"]').prop('innerHTML')
    if (!isEmpty(initScript)) initScripts.push(trim(initScript))
    params.append = `
      <script type="alpine:init">
        Alpine.data('map${params.attr.id}', () => {
          let map
          return {
            get map () {
              return map
            },
            initMap (instance) {
              map = instance
              ${initScripts.join('\n')}
            },
            runMap () {
              ${runScript ? trim(runScript) : ''}
            }
          }
        })
      </script>
    `
    params.html = ''
    const omitted = []
    for (const key in params.attr) {
      if (key.startsWith('ctrl')) omitted.push(key)
      else {
        for (const k in opts) {
          if (k === 'transform') omitted.push(...keys(opts.transform))
          else omitted.push(...opts[k])
        }
      }
    }
    params.attr = omit(params.attr, omitted)
  }
}

export default map
