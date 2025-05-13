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

    static controls = ['csrc', 'navigation-control', 'crlr', 'scale-control', 'attribution-control',
      'centerpos', 'fullscreen-control', 'geolocate-control', 'czbp', 'cmp']

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
