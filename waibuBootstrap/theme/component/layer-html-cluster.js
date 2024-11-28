import { scripts, css } from './map.js'
import { buildSource } from './layer-geojson.js'

const cscripts = [...scripts]
cscripts.push('waibuMaps.asset:/js/donut-chart.js')

function createLayerLabel (params) {
  return `{
    id: '${params.attr.name}_label',
    type: 'symbol',
    source: '${params.attr.name}',
    filter: ['!=', '${params.attr.clusterKey}', true],
    layout: {
      'text-field': [
        'number-format',
        ['get', '${params.attr.valueKey}'],
        {'min-fraction-digits': 1, 'max-fraction-digits': 1}
      ],
      'text-font': ['Open Sans Bold'],
      'text-size': 10
    },
    paint: {
      'text-color': [
        'case',
        ['<', ['get', '${params.attr.valueKey}'], 3],
        'black',
        'white'
      ]
    }
  }`
}

function createLayerCircle (params, filters) {
  const circle = [`{
    id: '${params.attr.name}_circle',
    type: 'circle',
    source: '${params.attr.name}',
    filter: ['!=', '${params.attr.clusterKey}', true],
    paint: {
      'circle-color': [
        'case',
  `]
  let i = 0
  const keys = Object.keys(filters)
  for (const key of keys) {
    circle.push(`this.filter.${key},`, `this.colors[${i}],`)
    i++
    if (i >= keys.length - 1) break
  }
  circle.push(`this.colors[${i}]`, '],\'circle-opacity\': 0.6, \'circle-radius\': 12 }}')
  return circle.join('\n')
}

const layerHtmlCluster = {
  scripts: cscripts,
  css,
  handler: async function (params = {}) {
    const { generateId } = this.plugin.app.bajo
    const { attrToArray, jsonStringify } = this.plugin.app.waibuMpa
    const { fetch, routePath } = this.plugin.app.waibu
    const { isString } = this.plugin.app.bajo.lib._
    params.noTag = true
    if (!params.attr.src) return
    params.attr.name = params.attr.name ?? generateId('alpha')
    params.attr.valueKey = params.attr.valueKey ?? ''
    params.attr.clusterKey = params.attr.clusterKey ?? 'cluster'
    params.attr.clusterIdKey = params.attr.clusterIdKey ?? 'clusterId'
    const colors = attrToArray(params.attr.color ?? '#fed976 #feb24c #fd8d3c #fc4e2a #e31a1c')
    params.attr.filter = routePath(params.attr.filter)
    const filters = await fetch(params.attr.filter)
    const extra = [
      'data.cluster = true',
      `data.clusterRadius = ${isString(params.attr.clusterRadius) ? Number(params.attr.clusterRadius) : 80}`,
      'data.clusterProperties = {'
    ]
    for (const key in filters) {
      extra.push(`${key}: ['+', ['case', this.filter.${key}, 1, 0]],`)
    }
    extra.push('}')
    params.html = `<script type="mapLoad" has-resource>
      ${buildSource.call(this, params, extra)}
      this.map.addLayer(
        ${createLayerCircle.call(this, params, filters)}
      )
      this.map.addLayer(
        ${createLayerLabel.call(this, params)}
      )
      this.map.on('data', e => {
        if (e.sourceId !== '${params.attr.name}' || !e.isSourceLoaded) return
        this.map.on('move', () => { this.updateMarkers() })
        this.map.on('moveend', () => { this.updateMarkers() })
        this.updateMarkers()
      })
    </script>`
    params.html += `\n<script type="reactive">{
      colors: ${jsonStringify(colors, true)},
      filter: ${jsonStringify(filters, true)},
      updateMarkers () {
        const filter = Alpine.raw(this.filter)
        const colors = Alpine.raw(this.colors)
        wmaps.updateClusterMarkers({
          sourceId: '${params.attr.name}',
          clusterKey: '${params.attr.clusterKey}',
          clusterIdKey: '${params.attr.clusterIdKey}',
          handler: function (props) {
            return donutChart.create(props, Object.keys(filter), colors)
          }
        })
      }
    }</script>
    `
  }
}

export default layerHtmlCluster
