import { scripts, css, ctrlPos } from './map.js'

const cscripts = [...scripts]
cscripts.push(
  'bajoSpatial.virtual:/geolib/lib/index.js',
  'waibuMaps.asset:/js/control-mouse-position.js'
)
const ccss = [...css]
ccss.push('waibuMaps.asset:/css/control-mouse-position.css')

const controlMousePosition = {
  scripts: cscripts,
  css: ccss,
  handler: async function (params = {}) {
    const { isString } = this.plugin.app.bajo.lib._
    params.noTag = true
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : 'bottom-left'
    const centerTrack = params.attr.centerTrack ? 'trackCenter: true,' : ''
    params.attr.store = isString(params.attr.store) ? params.attr.store : 'controlMousePosition'
    const labelFormatDms = `
      labelFormat: ({ lng, lat }) => {
        const opts = { north: '${this.req.t('dirN')}', south: '${this.req.t('dirS')}', east: '${this.req.t('dirE')}', west: '${this.req.t('dirW')}' }
        return '<span class="maplibregl-ctrl-mouse-position-lat-lng dms">${this.req.t('Lng')}: ' + wmapsUtil.decToDms(lng, _.merge({}, opts, { isLng: true })) + '</span>, <span class="maplibregl-ctrl-mouse-position-lat-lng dms">${this.req.t('Lat')}: ' + wmapsUtil.decToDms(lat, _.merge({}, opts, { isLng: false })) + '</span>'
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
      el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-mouse-position')
      el.setAttribute('x-data', '')
      el.setAttribute('x-show', '$store.${params.attr.store}.on')
    </script>
    <script type="initializing">
      Alpine.store('${params.attr.store}', {
        on: Alpine.$persist(true).as('${params.attr.store}On')
      })
    </script>`
  }
}

export default controlMousePosition
