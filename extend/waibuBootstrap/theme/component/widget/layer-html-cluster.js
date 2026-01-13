import wmapsBase from '../wmaps-base.js'

import { buildSource } from './layer-geojson.js'

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

async function layerHtmlCluster () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsLayerHtmlCluster extends WmapsBase {
    static scripts = [
      ...super.scripts,
      'waibuMaps.asset:/js/donut-chart.js'
    ]

    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { generateId } = this.app.lib.aneka
      const { attrToArray, jsonStringify } = this.app.waibuMpa
      const { fetch, routePath } = this.app.waibu
      const { isString } = this.app.lib._
      if (!this.params.attr.src) return
      this.params.attr.name = this.params.attr.name ?? generateId('alpha')
      this.params.attr.valueKey = this.params.attr.valueKey ?? ''
      this.params.attr.clusterKey = this.params.attr.clusterKey ?? 'cluster'
      this.params.attr.clusterIdKey = this.params.attr.clusterIdKey ?? 'clusterId'
      const colors = attrToArray(this.params.attr.color ?? '#fed976 #feb24c #fd8d3c #fc4e2a #e31a1c')
      this.params.attr.filter = routePath(this.params.attr.filter)
      const filters = await fetch(this.params.attr.filter)
      const extra = [
        'data.cluster = true',
        `data.clusterRadius = ${isString(this.params.attr.clusterRadius) ? Number(this.params.attr.clusterRadius) : 80}`,
        'data.clusterProperties = {'
      ]
      for (const key in filters) {
        extra.push(`${key}: ['+', ['case', this.filter.${key}, 1, 0]],`)
      }
      extra.push('}')
      this.addBlock('mapStyle', `
        ${buildSource.call(this, this.params, extra)}
        map.addLayer(
          ${createLayerCircle.call(this, this.params, filters)}
        )
        map.addLayer(
          ${createLayerLabel.call(this, this.params)}
        )
        map.on('data', e => {
          if (e.sourceId !== '${this.params.attr.name}' || !e.isSourceLoaded) return
          map.on('move', () => { this.updateMarkers() })
          map.on('moveend', () => { this.updateMarkers() })
          updateMarkers()
        })
      `)
      this.addBlock('reactive', [
        `colors: ${jsonStringify(colors, true)}`,
        `filter: ${jsonStringify(filters, true)}`,
        `updateMarkers () {
          const filter = Alpine.raw(this.filter)
          const colors = Alpine.raw(this.colors)
          wmaps.updateClusterMarkers({
            sourceId: '${this.params.attr.name}',
            clusterKey: '${this.params.attr.clusterKey}',
            clusterIdKey: '${this.params.attr.clusterIdKey}',
            handler: function (props) {
              return donutChart.create(props, Object.keys(filter), colors)
            }
          })
        }`
      ])
      this.params.html = this.writeBlock()
    }
  }
}

export default layerHtmlCluster
