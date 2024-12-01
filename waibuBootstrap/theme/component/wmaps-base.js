async function wmapsBase () {
  return class WmapsBase extends this.baseFactory {
    static scripts = [...super.scripts,
      'waibuMaps.asset:/js/lib/worker-timers.js',
      'waibuMaps.virtual:/maplibre/maplibre-gl.js',
      'waibuMaps:/wmaps.js'
    ]

    static css = [...super.css,
      'waibuMaps.virtual:/maplibre/maplibre-gl.css',
      'waibuMaps.asset:/css/map.css'
    ]

    static ctrlPos = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
  }
}

export default wmapsBase
