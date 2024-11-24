import { scripts, css, ctrlPos } from './map.js'
const storeKey = 'mapControl.scale'

const controlScale = {
  scripts,
  css,
  handler: async function (params = {}) {
    const { jsonStringify } = this.plugin.app.waibuMpa
    const { isString } = this.plugin.app.bajo.lib._
    params.noTag = true
    const opts = {}
    if (['imperial', 'metric', 'nautical'].includes(params.attr.unit)) opts.unit = params.attr.unit
    if (isString(params.attr.maxWidth) && Number(params.attr.maxWidth)) opts.maxWidth = Number(params.attr.maxWidth)
    const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : undefined
    params.html = `<script type="controlScale">
      const scaleOpts = ${jsonStringify(opts, true)}
      if ((Alpine.store('mapSetting') ?? {}).measure) scaleOpts.unit = Alpine.store('mapSetting').measure
      this.map.addControl(new maplibregl.ScaleControl(scaleOpts)${pos ? `, '${pos}'` : ''})
      if (Alpine.store('mapControl')) {
        el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-scale')
        el.setAttribute('x-data', '')
        el.setAttribute('x-show', '$store.${storeKey}')
      }
    </script>`
  }
}

export default controlScale
