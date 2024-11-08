const map = {
  scripts: 'waibuMaps.virtual:/maplibre/maplibre-gl.js',
  css: 'waibuMaps.virtual:/maplibre/maplibre-gl.css',
  handler: async function (params = {}) {
    const { generateId } = this.plugin.app.bajo
    const { isString } = this.plugin.app.bajo.lib._
    const { jsonStringify, base64JsonDecode } = this.plugin.app.waibuMpa

    const initScript = []
    if (params.attr.ctlNav) initScript.push('map.addControl(new maplibregl.NavigationControl())')
    params.attr.id = params.attr.id ?? generateId('alpha')
    params.tag = 'div'
    params.attr['x-data'] = `map${params.attr.id}`
    params.attr['@load.window'] = `
      const defOpts = ${jsonStringify(this.plugin.app.waibuMaps.config.mapOptions, true)}
      defOpts.container = '${params.attr.id}'
      const opts = ${jsonStringify(isString(params.attr.options) ? base64JsonDecode(params.attr.options) : {}, true)}
      const options = _.merge({}, opts, defOpts)
      initMap(new maplibregl.Map(options))
    `
    params.append = `
      <script>
        document.addEventListener('alpine:init', () => {
          Alpine.data('map${params.attr.id}', () => {
            let map
            return {
              get map () {
                return map
              },
              initMap (instance) {
                map = instance
                ${initScript.join('\n')}
              }
            }
          })
        })
      </script>
    `
  }
}

export default map
