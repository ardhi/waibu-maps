import { scripts, css, ctrlPos } from './map.js'

const cscripts = [...scripts]
cscripts.push(
  'bajoSpatial.virtual:/geolib/lib/index.js',
  'waibuMaps.asset:/js/control-mouse-position.js'
)
const ccss = ['$waibuMaps.asset:/css/control-mouse-position.css', ...css]

const controlMousePosition = {
  scripts: cscripts,
  css: ccss,
  handler: async function (params = {}) {
    params.noTag = true
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : 'bottom-left'
    const centerTrack = params.attr.centerTrack ? 'trackCenter: true,' : ''
    const labelFormatDms = `
      labelFormat: ({ lng, lat }) => {
        const opts = { north: '${this.req.t('dirN')}', south: '${this.req.t('dirS')}', east: '${this.req.t('dirE')}', west: '${this.req.t('dirW')}' }
        return '<span class="maplibregl-ctrl-mouse-position-lat-lng dms">${this.req.t('Lng')}: ' + this.wmaps.decToDms(lng, _.merge({}, opts, { isLng: true })) + '</span>, <span class="maplibregl-ctrl-mouse-position-lat-lng dms">${this.req.t('Lat')}: ' + this.wmaps.decToDms(lat, _.merge({}, opts, { isLng: false })) + '</span>'
      }
    `
    const labelFormatDd = `
      labelFormat: ({ lng, lat }) => {
        return '<span class="maplibregl-ctrl-mouse-position-lat-lng">${this.req.t('Lng')}: ' + lng + '</span>, <span class="maplibregl-ctrl-mouse-position-lat-lng">${this.req.t('Lat')}: ' + lat + '</span>'
      }
    `
    params.html = `<script type="controlMousePosition">
      const cmpOpts = {
        ${centerTrack}
        ${params.attr.format === 'DD' ? labelFormatDd : labelFormatDms}
      }
      this.map.addControl(new ControlMousePosition(cmpOpts)${pos ? `, '${pos}'` : ''})
    </script>`
  }
}

export default controlMousePosition
