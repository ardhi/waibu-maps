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

    static controls = ['csrc', 'navigation-control', 'crlr', 'scale-control', 'attribution-control',
      'fullscreen-control', 'geolocate-control', 'czbp', 'cmp']

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
          const html = trim($(this).prop('innerHTML'))
          if (!me.block[type].includes(html)) me.block[type].push(html)
        }
      })
    }

    writeBlock () {
      const { isString, omit } = this.plugin.app.bajo.lib._
      const { attribsStringify } = this.plugin.app.waibuMpa
      const html = []
      for (const key in this.block) {
        const items = this.block[key]
        if (items.length === 0) continue
        for (let item of items) {
          if (isString(item)) item = { content: item }
          item.block = key
          const attrs = attribsStringify(omit(item, ['content']))
          html.push(`<script ${attrs}>${item.content}</script>`)
        }
      }
      return html.join('\n')
    }

    async getTemplate (html, type, defEmpty = '') {
      const { trim, isEmpty } = this.plugin.app.bajo.lib._
      const { minify } = this.plugin.app.waibuMpa
      const { $ } = this.component
      let tpl = trim($(`<div>${html}</div>`).find(`wmaps-template[type="${type}"]`).prop('innerHTML'))
      if (isEmpty(tpl)) {
        if (defEmpty === 'popup') tpl = '<div class="px-3 py-2">{%= name %}</div>'
        else tpl = defEmpty
      }
      return await minify(tpl)
    }
  }
}

export default wmapsBase
