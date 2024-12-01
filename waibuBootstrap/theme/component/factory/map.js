import wmapsBase from '../wmaps-base.js'

import initializing from './map/initializing.js'
import options from './map/options.js'

export const scriptTypes = ['init', 'initializing', 'run', 'reactive', 'mapLoad',
  'nonReactive', 'dataInit', 'mapOptions', 'mapStyle', 'layerVisible', 'missingImage']

const loadResource = `async loadResource (src) {
  const resp = await fetch(src)
  if (!resp.ok) throw new Error('Can\\'t load resource: ' + src)
  return resp.json()
}`

async function map () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsMap extends WmapsBase {
    async build () {
      const { generateId } = this.plugin.app.bajo
      const { without, uniq, trim, omit, trimStart, trimEnd, isString } = this.plugin.app.bajo.lib._
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { $ } = this.component

      this.params.attr.id = this.params.attr.id ?? generateId('alpha')
      const inits = []
      $(`<div>${this.params.html}</div>`).find('script[type^="control"]').each(function () {
        inits.push($(this).prop('innerHTML'))
      })
      const reactives = [
        'get map () { return map }',
        'get wmaps () { return wmaps }'
      ]
      this.params.tag = 'div'
      this.params.attr['x-data'] = `map${this.params.attr.id}`
      const defInitializing = await initializing.call(this, this.params)
      const script = {}
      let canLoadResource = false
      for (const type of scriptTypes) {
        script[type] = script[type] ?? []
        $(`<div>${this.params.html}</div>`).find(`script[type="${type}"]`).each(function () {
          if (isString(this.attribs['has-resource'])) canLoadResource = true
          let html = trim($(this).prop('innerHTML'))
          if (type === 'reactive') html = trim(trimEnd(trimStart(html, '{'), '}'))
          script[type].push(html)
        })
        script[type] = uniq(script[type])
      }
      const mapOptions = await options.call(this, this.params)
      reactives.push(`async windowLoad () {
        const mapOpts = ${jsonStringify(mapOptions, true)}
        const mapInfo = Alpine.store('mapInfo')
        for (const item of ['center', 'zoom', 'bearing', 'pitch']) {
        if (_.get(mapInfo, item)) mapOpts[item] = _.get(mapInfo, item)
        }
        ${script.mapOptions.join('\n')}
        await this.run(new maplibregl.Map(mapOpts))
      }`)
      if (canLoadResource) {
        reactives.push(loadResource)
      }
      reactives.push(...script.reactive)
      script.run.unshift(...inits)
      this.params.attr['@load.window'] = 'await windowLoad()'
      this.params.append = `
        <script type="alpine:init">
          Alpine.data('map${this.params.attr.id}', () => {
            let map
            let wmaps
            ${script.nonReactive.join('\n')}
            return {
              init () {
                ${script.dataInit.join('\n')}
              },
              ${reactives.join(',\n')},
              async onMapLoad (evt) {
                ${script.mapLoad.join('\n')}
                this.onMapStyle()
              },
              async onMapStyle () {
                ${script.mapStyle.join('\n')}
              },
              async onMissingImage (evt) {
                ${script.missingImage.join('\n')}
              },
              onLayerVisible (layerId, shown) {
                if (!shown) {
                  for (const el of document.querySelectorAll('.popup-layer-' + layerId)) {
                    el.remove()
                  }
                }
                ${script.layerVisible.join('\n')}
              },
              async run (instance) {
                map = instance
                wmaps = new WaibuMaps(instance)
                let el
                ${script.run.join('\n')}
                this.map.on('styledataloading', () => {
                  this.map.once('styledata', this.onMapStyle.bind(this))
                })
                this.map.on('styleimagemissing', this.onMissingImage.bind(this))
                this.map.on('load', this.onMapLoad.bind(this))
              }
            }
          })
          ${script.init.join('\n')}
        </script>
        <script type="alpine:initializing">
          ${defInitializing.join('\n')}
          ${script.initializing.join('\n')}
        </script>
      `
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
