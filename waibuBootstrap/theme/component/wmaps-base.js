async function wmapsBase () {
  return class WmapsBase extends this.baseFactory {
    static scripts = [...super.scripts,
      'waibuMaps.asset:/js/lib/worker-timers.js',
      'waibuMaps.virtual:/maplibre/maplibre-gl.js',
      'waibuMaps:/wmaps.js'
    ]

    static css = [...super.css,
      'waibuMaps.virtual:/maplibre/maplibre-gl.css',
      'waibuMaps.asset:/css/wmaps.css'
    ]

    static blockTypes = ['init', 'initializing', 'run', 'reactive', 'mapLoad', 'control',
      'nonReactive', 'dataInit', 'mapOptions', 'mapStyle', 'layerVisibility', 'missingImage',
      'keyup']

    static controls = ['search', 'navigation-control', 'crlr', 'scale-control', 'attribution-control', 'fullscreen-control', 'geolocate-control', 'czbp']

    constructor (options) {
      super(options)
      this.block = {}
      for (const block of WmapsBase.blockTypes) {
        this.block[block] = this.block[block] ?? []
      }
    }

    readBlock (blocks = []) {
      const { isString, trim } = this.plugin.app.bajo.lib._
      const { $ } = this.component
      const me = this
      if (isString(blocks)) blocks = [blocks]
      $(`<div>${this.params.html}</div>`).find('script').each(function () {
        const type = this.attribs.block ?? 'run'
        if (blocks.length > 0 && !blocks.includes(type)) return undefined
        if (WmapsBase.blockTypes.includes(type)) {
          let html = trim($(this).prop('innerHTML'))
          if (type === 'reactive') {
            html = html.slice(1)
            html = html.slice(0, html.length - 1)
          }
          if (!me.block[type].includes(html)) me.block[type].push(html)
        }
      })
    }

    writeBlock () {
      const html = []
      for (const key in this.block) {
        let items = this.block[key]
        if (items.length === 0) continue
        if (key === 'reactive') items = ['{', items.join(',\n'), '}']
        html.push(`<script block="${key}">${items.join('\n')}</script>`)
      }
      return html.join('\n')
    }

    getTemplate (html, type, defEmpty = '') {
      const { trim, isEmpty } = this.plugin.app.bajo.lib._
      const { $ } = this.component
      let tpl = trim($(`<div>${html}</div>`).find(`wmaps-template[type="${type}"]`).prop('innerHTML'))
      if (isEmpty(tpl)) {
        if (defEmpty === 'popup') tpl = '<div class="px-3 py-2">{%= name %}</div>'
        else tpl = defEmpty
      }
      return tpl
    }
  }
}

export default wmapsBase
