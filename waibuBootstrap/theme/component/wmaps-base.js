async function wmapsBase () {
  return class WmapsBase extends this.baseFactory {
    static scripts = [...super.scripts,
      'waibuMaps.asset:/js/lib/worker-timers.js',
      'bajoSpatial.virtual:/geolib/lib/index.js',
      'waibuMaps.virtual:/maplibre/maplibre-gl.js',
      '$waibuMaps:/wmaps.js'
    ]

    static css = [...super.css,
      'waibuMaps.virtual:/maplibre/maplibre-gl.css',
      'waibuMaps.asset:/css/wmaps.css'
    ]

    constructor (options) {
      super(options)
      this.blockTypes = [...this.blockTypes,
        'mapLoad', 'control', 'mapOptions', 'mapStyle', 'layerVisibility', 'missingImage',
        'mapExtend'
      ]
      this.init()
    }

    static controls = ['csrc', 'navigation-control', 'crlr', 'scale-control', 'attribution-control',
      'fullscreen-control', 'geolocate-control', 'czbp', 'cmp', 'globe-control']

    async getWmapsTemplate (html, type, defEmpty = '') {
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
