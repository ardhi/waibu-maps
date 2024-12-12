import control from './control.js'
const storeKey = 'mapControl.mousePos'

async function controlMousePosition () {
  const WmapsControl = await control.call(this)

  return class WmapsControlMousePosition extends WmapsControl {
    static scripts = [
      ...super.scripts,
      'bajoSpatial.virtual:/geolib/lib/index.js',
      'waibuMaps.asset:/js/control-mouse-position.js'
    ]

    static css = [
      ...super.css,
      'waibuMaps.asset:/css/control-mouse-position.css'
    ]

    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { req } = this.component
      const pos = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'bottom-left'
      const centerTrack = this.params.attr.centerTrack ? 'trackCenter: true,' : ''
      const labelFormatDms = `
        function labelFormatDms ({ lng, lat }) {
          const opts = { north: '${req.t('dirN')}', south: '${req.t('dirS')}', east: '${req.t('dirE')}', west: '${req.t('dirW')}' }
          return '<span class="maplibregl-ctrl-mouse-position-lat-lng dms">${req.t('Lng')}: ' + wmapsUtil.decToDms(lng, _.merge({}, opts, { isLng: true })) + '</span>, <span class="maplibregl-ctrl-mouse-position-lat-lng dms">${req.t('Lat')}: ' + wmapsUtil.decToDms(lat, _.merge({}, opts, { isLng: false })) + '</span>'
        }
      `
      const labelFormatDd = `
        function labelFormatDd ({ lng, lat }) {
          return '<span class="maplibregl-ctrl-mouse-position-lat-lng">${req.t('Lng')}: ' + lng + '</span>, <span class="maplibregl-ctrl-mouse-position-lat-lng">${req.t('Lat')}: ' + lat + '</span>'
        }
      `
      this.block.control.push(`
        ${labelFormatDd}
        ${labelFormatDms}
        const format = (Alpine.store('mapSetting') ?? {}).degree ?? '${this.params.attr.format ?? 'DMS'}'
        const cmpOpts = {
          ${centerTrack}
          labelFormat: format === 'DD' ? labelFormatDd : labelFormatDms
        }
        map.addControl(new ControlMousePosition(cmpOpts)${pos ? `, '${pos}'` : ''})
        if (Alpine.store('mapControl')) {
          el = document.querySelector('#' + map._container.id + ' .maplibregl-ctrl-mouse-position')
          el.setAttribute('x-data', '')
          el.setAttribute('x-show', '$store.${storeKey}')
        }
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlMousePosition
