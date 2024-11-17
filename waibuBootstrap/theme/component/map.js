export const scriptTypes = ['init', 'initializing', 'run', 'handler', 'mapLoad', 'nonReactive']
export const scripts = [
  'waibuMaps.virtual:/maplibre/maplibre-gl.js',
  'waibuMaps.asset:/js/wmaps.js'
]
export const css = [
  'waibuMaps.virtual:/maplibre/maplibre-gl.css',
  'waibuMaps.asset:/css/map.css'
]
export const ctrlPos = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
export const opts = {
  boolTrue: ['antialias', 'hash', 'maplibreLogo'],
  boolFalse: ['noBoxZoom', 'noDoubleClickZoom', 'noDoubleClickZoom', 'noDragPan', 'noDragRotate',
    'noInteractive', 'noKeyboard', 'noPitchWithRotate', 'noRenderWorldCopies', 'noScrollZoom',
    'noTouchPitch', 'noTouchZoomRotate', 'noTrackResize', 'noValidateStyle'],
  number: ['zoom', 'bearing', 'bearingSnap', 'clickTolerance', 'fadeDuration', 'maxPitch',
    'maxZoom', 'minPitch', 'minZoom', 'pitch'],
  array: ['center', 'bounds', 'maxBounds'],
  string: []
}

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
    const { uniq, trim, omit, trimStart, trimEnd, isString, camelCase } = this.plugin.app.bajo.lib._
    const { routePath } = this.plugin.app.waibu
    const { jsonStringify, attrToArray } = this.plugin.app.waibuMpa
    const { buildMapStyle } = this.plugin.app.waibuMaps
    const $ = this.$

    params.attr.id = params.attr.id ?? generateId('alpha')
    const mapOpts = this.plugin.app.waibuMaps.getConfig().mapOptions
    mapOpts.container = params.attr.id
    for (const key in params.attr) {
      const val = params.attr[key]
      if (val === true) {
        if (opts.boolTrue.includes(key)) mapOpts[key] = true
        if (opts.boolFalse.includes(key)) mapOpts[camelCase(key.slice(2))] = false
      } else {
        if (key === 'mapStyle') mapOpts.style = val
        else if (opts.number.includes(key)) mapOpts[key] = Number(val)
        else if (opts.array.includes(key)) mapOpts[key] = attrToArray(val).map(v => Number(v))
        else if (opts.string.includes(key)) mapOpts[key] = val
      }
    }
    mapOpts.style = buildMapStyle(routePath(mapOpts.style))
    mapOpts.attributionControl = $(`<div>${params.html}</div>`).find('script[type="controlAttribution"]').length === 0
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
              let el
              ${script.run.join('\n')}
              this.map.on('load', this.onMapLoad.bind(this))
            }
          }
        })
        ${script.init.join('\n')}
      </script>
      <script type="alpine:initializing">
        ${script.initializing.join('\n')}
      </script>
    `
    const html = []
    $(`<div>${params.html}</div>`).find('.childmap').each(function () {
      html.push($(this).prop('outerHTML'))
    })
    params.html = html.join('\n')
    const omitted = ['mapStyle', ...Object.keys(opts)]
    params.attr = omit(params.attr, omitted)
  }
}

export default map
