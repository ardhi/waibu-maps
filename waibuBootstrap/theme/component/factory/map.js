import wmapsBase from '../wmaps-base.js'

import initializing from './map/initializing.js'
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
      this.block.reactive.unshift(
        'get map () { return map }',
        'get wmaps () { return wmaps }'
      )
    }

    async build () {
      const { generateId } = this.plugin.app.bajo
      const { without, omit, isString } = this.plugin.app.bajo.lib._
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { $ } = this.component

      this.params.attr.id = 'map' + (isString(this.params.attr.id) ? this.params.attr.id : generateId('alpha'))
      this.params.tag = 'div'
      this.params.attr['x-data'] = this.params.attr.id
      this.params.attr['@keyup'] = 'onKeyup'
      const defInitializing = await initializing.call(this, this.params)
      const mapOptions = await options.call(this, this.params)
      this.block.reactive.push(`async windowLoad () {
        const mapOpts = ${jsonStringify(mapOptions, true)}
        const mapInfo = Alpine.store('mapInfo')
        for (const item of ['center', 'zoom', 'bearing', 'pitch']) {
        if (_.get(mapInfo, item)) mapOpts[item] = _.get(mapInfo, item)
        }
        ${this.block.mapOptions.join('\n')}
        await this.run(new maplibregl.Map(mapOpts))
      }`)
      this.params.attr['@load.window'] = 'await windowLoad()'
      this.params.append = `<script>
        document.addEventListener('alpine:init', () => {
          Alpine.data('${this.params.attr.id}', () => {
            let map
            let wmaps
            ${this.block.nonReactive.join('\n')}
            return {
              init () {
                ${this.block.dataInit.join('\n')}
              },
              ${this.block.reactive.join(',\n')},
              async onMapLoad (evt) {
                ${this.block.mapLoad.join('\n')}
                this.onMapStyle()
              },
              async onMapStyle () {
                ${this.block.mapStyle.join('\n')}
              },
              async onMissingImage (evt) {
                ${this.block.missingImage.join('\n')}
              },
              onLayerVisible (layerId, shown) {
                if (!shown) {
                  for (const el of document.querySelectorAll('.popup-layer-' + layerId)) {
                    el.remove()
                  }
                }
                ${this.block.layerVisible.join('\n')}
              },
              async onKeyup (evt) {
                if (evt.key === 'Escape') {
                  if (this.wmaps.popup) this.wmaps.popup.remove()
                }
                ${this.block.keyup.join('\n')}
              },
              async run (instance) {
                map = instance
                wmaps = new WaibuMaps(instance, this)
                let el
                ${this.block.control.join('\n')}
                ${this.block.run.join('\n')}
                this.map.on('styledataloading', () => {
                  this.map.once('styledata', this.onMapStyle.bind(this))
                })
                this.map.on('styleimagemissing', this.onMissingImage.bind(this))
                this.map.on('load', this.onMapLoad.bind(this))
              }
            }
          })
          ${this.block.init.join('\n')}
        })
        document.addEventListener('alpine:initializing', () => {
          ${defInitializing.join('\n')}
          ${this.block.initializing.join('\n')}
        })
      </script>`
      const html = []
      $(`<div>${this.params.html}</div>`).find('.childmap').each(function () {
        html.push($(this).prop('outerHTML'))
      })
      this.params.html = html.join('\n')
      const keys = without(Object.keys(mapOptions), 'style')
      const omitted = ['noBasemap', ...keys]
      this.params.attr = omit(this.params.attr, omitted)
    }
  }
}

export default map
