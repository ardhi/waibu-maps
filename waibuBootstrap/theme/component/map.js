import { opts, cmpMapOptions } from '../../../lib/cmp-map-options.js'

export const scriptTypes = ['run', 'handler', 'mapLoad', 'nonReactive']
export const scripts = [
  'waibuMaps.virtual:/maplibre/maplibre-gl.js',
  'waibuMaps.asset:/js/wmaps.js'
]
export const css = ['waibuMaps.virtual:/maplibre/maplibre-gl.css']
export const ctrlPos = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

const loadResource = `async loadResource (src) {
  const resp = await fetch(src)
  if (!resp.ok) throw new Error('Can\\'t load resource: ' + src)
  return resp.json()
}`

const map = {
  scripts,
  css,
  handler: async function (params = {}) {
    const { generateId } = this.plugin.app.bajo
    const { uniq, trim, omit, keys, trimStart, trimEnd, isString } = this.plugin.app.bajo.lib._
    const { jsonStringify } = this.plugin.app.waibuMpa
    const { routePath } = this.plugin.app.waibu
    const $ = this.$

    params.attr.id = params.attr.id ?? generateId('alpha')
    const mapOpts = this.plugin.app.waibuMaps.getConfig().mapOptions
    mapOpts.style = routePath(mapOpts.style)
    if ($(`<div>${params.html}</div>`).find('script[control-attribution]').prop('innerHTML')) {
      mapOpts.attributionControl = false
    }
    cmpMapOptions.call(this, params, mapOpts)
    const inits = []
    $(`<div>${params.html}</div>`).find('script[type^="control"]').each(function () {
      inits.push(trim($(this).prop('innerHTML')))
    })
    const handlers = [
      'get map () { return map }',
      'get wmaps () { return wmaps }'
    ]

    params.tag = 'div'
    params.attr['x-data'] = `map${params.attr.id}`
    params.attr['@load.window'] = `
      async () => {
        const options = ${jsonStringify(mapOpts, true)}
        await run(new maplibregl.Map(options))
      }
    `
    const script = {}
    let canLoadResource = false
    for (const type of scriptTypes) {
      script[type] = script[type] ?? []
      $(`<div>${params.html}</div>`).find(`script[type="${type}"]`).each(function () {
        if (isString(this.attribs['has-resource'])) canLoadResource = true
        let html = trim($(this).prop('innerHTML'))
        if (type === 'handler') html = trim(trimEnd(trimStart(html, '{'), '}'))
        script[type].push(html)
      })
      script[type] = uniq(script[type])
    }
    if (canLoadResource) {
      handlers.push(loadResource)
    }
    handlers.push(...script.handler)
    script.run.unshift(...inits)
    params.append = `
      <script type="alpine:init">
        Alpine.data('map${params.attr.id}', () => {
          let map
          let wmaps
          ${script.nonReactive.join('\n')}
          return {
            ${handlers.join(',\n')},
            async onMapLoad () {
              ${script.mapLoad.join('\n')}
            },
            async run (instance) {
              map = instance
              wmaps = new WMaps(instance)
              ${script.run.join('\n')}
              this.map.on('load', this.onMapLoad.bind(this))
            }
          }
        })
      </script>
    `
    const html = []
    $(`<div>${params.html}</div>`).find('.maplibregl-childmap').each(function () {
      html.push($(this).prop('outerHTML'))
    })
    params.html = html.join('\n')
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
