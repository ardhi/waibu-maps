import { scripts, css, ctrlPos } from './map.js'

const cscripts = [...scripts]
cscripts.push(
  'bajoSpatial.virtual:/geolib/lib/index.js',
  'waibuMaps.asset:/js/control-mouse-position.js'
)
const ccss = [...css]
ccss.push('waibuMaps.asset:/css/control-mouse-position.css')
const storeKey = 'mapControl.mousePos'

const controlMousePosition = {
  scripts: cscripts,
  css: ccss,
  handler: async function (params = {}) {
    params.noTag = true
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : 'bottom-left'
    const centerTrack = params.attr.centerTrack ? 'trackCenter: true,' : ''
    const labelFormatDms = `
      function labelFormatDms ({ lng, lat }) {
        const opts = { north: '${this.req.t('dirN')}', south: '${this.req.t('dirS')}', east: '${this.req.t('dirE')}', west: '${this.req.t('dirW')}' }
        return '<span class="maplibregl-ctrl-mouse-position-lat-lng dms">${this.req.t('Lng')}: ' + wmapsUtil.decToDms(lng, _.merge({}, opts, { isLng: true })) + '</span>, <span class="maplibregl-ctrl-mouse-position-lat-lng dms">${this.req.t('Lat')}: ' + wmapsUtil.decToDms(lat, _.merge({}, opts, { isLng: false })) + '</span>'
      }
    `
    const labelFormatDd = `
      function labelFormatDd ({ lng, lat }) {
        return '<span class="maplibregl-ctrl-mouse-position-lat-lng">${this.req.t('Lng')}: ' + lng + '</span>, <span class="maplibregl-ctrl-mouse-position-lat-lng">${this.req.t('Lat')}: ' + lat + '</span>'
      }
    `
    params.html = `<script type="controlMousePosition">
      ${labelFormatDd}
      ${labelFormatDms}
      const format = (Alpine.store('mapSetting') ?? {}).degree ?? '${params.attr.format ?? 'DMS'}'
      const cmpOpts = {
        ${centerTrack}
        labelFormat: format === 'DD' ? labelFormatDd : labelFormatDms
      }
      this.map.addControl(new ControlMousePosition(cmpOpts)${pos ? `, '${pos}'` : ''})
      if (Alpine.store('mapControl')) {
        el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-mouse-position')
        el.setAttribute('x-data', '')
        el.setAttribute('x-show', '$store.${storeKey}')
      }
    </script>`
  }
}

export default controlMousePosition
