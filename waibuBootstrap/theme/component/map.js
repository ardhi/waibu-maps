import initializing from './map/initializing.js'
import options from './map/options.js'

export const scriptTypes = ['init', 'initializing', 'run', 'handler', 'mapLoad',
  'nonReactive', 'dataInit', 'mapOptions', 'mapStyle']
export const scripts = [
  'waibuMaps.virtual:/maplibre/maplibre-gl.js',
  'waibuMaps:/wmaps.js'
]
export const css = [
  'waibuMaps.virtual:/maplibre/maplibre-gl.css',
  'waibuMaps.asset:/css/map.css'
]
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
    const { uniq, trim, omit, trimStart, trimEnd, isString } = this.plugin.app.bajo.lib._
    const { jsonStringify } = this.plugin.app.waibuMpa
    const $ = this.$

    params.attr.id = params.attr.id ?? generateId('alpha')
    const inits = []
    $(`<div>${params.html}</div>`).find('script[type^="control"]').each(function () {
      inits.push($(this).prop('innerHTML'))
    })
    const handlers = [
      'get map () { return map }',
      'get wmaps () { return wmaps }'
    ]
    params.tag = 'div'
    params.attr['x-data'] = `map${params.attr.id}`
    const defInitializing = await initializing.call(this, params)
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
    const mapOptions = await options.call(this, params)
    handlers.push(`async windowLoad () {
      const mapOpts = ${jsonStringify(mapOptions, true)}
      const mapInfo = Alpine.store('mapInfo')
      for (const item of ['center', 'zoom', 'bearing', 'pitch']) {
       if (_.get(mapInfo, item)) mapOpts[item] = _.get(mapInfo, item)
      }
      ${script.mapOptions.join('\n')}
      await this.run(new maplibregl.Map(mapOpts))
    }`)
    if (canLoadResource) {
      handlers.push(loadResource)
    }
    handlers.push(...script.handler)
    script.run.unshift(...inits)
    params.attr['@load.window'] = 'await windowLoad()'
    params.append = `
      <script type="alpine:init">
        Alpine.data('map${params.attr.id}', () => {
          let map
          let wmaps
          ${script.nonReactive.join('\n')}
          return {
            init () {
              ${script.dataInit.join('\n')}
            },
            ${handlers.join(',\n')},
            async onMapLoad () {
              ${script.mapLoad.join('\n')}
            },
            async onMapStyle () {
              ${script.mapStyle.join('\n')}
            },
            async run (instance) {
              map = instance
              wmaps = new WMaps(instance)
              let el
              ${script.run.join('\n')}
              this.map.on('styledata', this.onMapStyle.bind(this))
              this.map.on('load', this.onMapLoad.bind(this))
            }
          }
        })
        ${script.init.join('\n')}
      </script>
      <script type="alpine:initializing">
        ${defInitializing.join('\n')}
        ${script.initializing.join('\n')}
      </script>
    `
    const html = []
    $(`<div>${params.html}</div>`).find('.childmap').each(function () {
      html.push($(this).prop('outerHTML'))
    })
    params.html = html.join('\n')
    const omitted = ['noBasemap', ...Object.keys(mapOptions)]
    params.attr = omit(params.attr, omitted)
  }
}

export default map
