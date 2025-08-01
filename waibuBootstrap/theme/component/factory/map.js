import wmapsBase from '../wmaps-base.js'

import options from './map/options.js'

/*
const loadResource = `async loadResource (src) {
  const resp = await fetch(src)
  if (!resp.ok) throw new Error('Can\\'t load resource: ' + src)
  return resp.json()
}`
*/

async function map () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsMap extends WmapsBase {
    constructor (options) {
      super(options)
      this.readBlock()
    }

    build = async () => {
      const { generateId } = this.plugin.app.bajo
      const { without, omit, isString } = this.plugin.app.bajo.lib._
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { $ } = this.component

      this.params.attr.id = 'map' + (isString(this.params.attr.id) ? this.params.attr.id : generateId('alpha'))
      this.params.attr.class.push('wmaps')
      this.params.tag = 'div'
      this.params.attr['x-data'] = this.params.attr.id
      this.params.attr['@keyup'] = 'onKeyup'
      this.params.attr['@load.window'] = 'await windowLoad()'
      const mapOptions = await options.call(this, this.params)
      const projection = this.params.attr.projection ?? 'mercator'
      let reactiveBlock = ''
      if (this.block.reactive && this.block.reactive.length > 0) reactiveBlock = this.block.reactive.join(',\n') + ','
      this.component.addScriptBlock('alpineInit', `
        Alpine.data('${this.params.attr.id}', () => {
          let map
          let wmaps
          let projection = { type: '${projection}' }
          ${(this.block.nonReactive ?? []).join('\n')}
          return {
            init () {
              ${(this.block.dataInit ?? []).join('\n')}
              this.$watch('$store.wmpa.reqAborted', val => {
                if (!val) return
                const text = _.get(wmpa, 'fetchingApi.' + val + '.status')
                if (text.startsWith('abort:')) {
                  const [, msg] = text.split(':')
                  wbs.notify(msg, { type: 'warning' }).then()
                }
              })
            },
            async windowLoad () {
              const mapOpts = ${jsonStringify(mapOptions, true)}
              ${(this.block.mapOptions ?? []).join('\n')}
              await this.run(new maplibregl.Map(mapOpts))
            },
            ${reactiveBlock}
            async onMapLoad (evt) {
              ${(this.block.mapLoad ?? []).join('\n')}
              // this.onMapStyle()
            },
            async onMapStyle () {
              map.setProjection(projection)
              ${(this.block.mapStyle ?? []).join('\n')}
            },
            async onMissingImage (evt) {
              if (evt.id.startsWith('icon:')) await wmaps.loadIcon(evt.id)
              ${(this.block.missingImage ?? []).join('\n')}
            },
            onLayerVisibility (layerId, shown) {
              if (!shown) {
                if (wmaps.popup) {
                  const el = wmaps.popup.getElement()
                  if (el && el.classList.contains('popup-layer-' + layerId)) wmaps.popup.remove()
                }
              }
              ${(this.block.layerVisibility ?? []).join('\n')}
            },
            async onKeyup (evt) {
              if (evt.key === 'Escape') {
                if (wmaps.popup) wmaps.popup.remove()
              }
              ${(this.block.keyup ?? []).join('\n')}
            },
            async run (instance) {
              map = instance
              wmapsUtil.setMap(map, projection)
              wmaps = new WaibuMaps(instance, this)
              map.on('moveend', evt => {
                Alpine.store('map').center = evt.target.getCenter().toArray()
                Alpine.store('map').zoom = evt.target.getZoom()
                Alpine.store('map').bearing = evt.target.getBearing()
                Alpine.store('map').pitch = evt.target.getPitch()
              })
              ${(this.block.mapExtend ?? []).join('\n')}
              ${(this.block.control ?? []).join('\n')}
              ${(this.block.run ?? []).join('\n')}
              map.on('styledataloading', () => {
                map.once('styledata', this.onMapStyle.bind(this))
              })
              map.on('styleimagemissing', this.onMissingImage.bind(this))
              map.on('load', this.onMapLoad.bind(this))
              // TODO: sometime onLoad isn't called, hence these next lines...
              while (!map.isStyleLoaded()) await wmpa.delay(200)
              this.onMapStyle()
            }
          }
        })
      `)
      this.component.addScriptBlock('alpineInitializing', `
        const props = {
          id: '${this.params.attr.id}',
          degree: Alpine.$persist('DMS').as('mapDegree'),
          measure: Alpine.$persist('nautical').as('mapMeasure'),
          zoomScrollCenter: Alpine.$persist(false).as('mapZoomScrollCenter'),
          noMapRotate: Alpine.$persist(false).as('mapNoMapRotate'),
          center: Alpine.$persist(null).as('mapCenter'),
          zoom: Alpine.$persist(null).as('mapZoom'),
          bearing: Alpine.$persist(null).as('mapBearing'),
          pitch: Alpine.$persist(null).as('mapPitch')
        }
        for (const ctrl of ${jsonStringify(WmapsBase.controls, true)}) {
          const name = 'ctrl' + wmpa.pascalCase(ctrl)
          props[name] = Alpine.$persist(true).as('map' + _.upperFirst(name))
        }
        Alpine.store('map', props)
      `)
      const html = []
      $(`<div>${this.params.html}</div>`).find('.childmap').each(function () {
        html.push($(this).prop('outerHTML'))
      })
      this.params.html = html.join('\n')
      const keys = without(Object.keys(mapOptions), 'style')
      const omitted = ['noBasemap', 'projection', ...keys]
      this.params.attr = omit(this.params.attr, omitted)
    }
  }
}

export default map
