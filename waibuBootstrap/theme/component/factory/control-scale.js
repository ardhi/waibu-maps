import control from './control.js'
const storeKey = 'mapControl.scale'

async function controlScale () {
  const WmapsControl = await control.call(this)

  return class WmapsControlScale extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { isString } = this.plugin.app.bajo.lib._
      const opts = {}
      if (['imperial', 'metric', 'nautical'].includes(this.params.attr.unit)) opts.unit = this.params.attr.unit
      if (isString(this.params.attr.maxWidth) && Number(this.params.attr.maxWidth)) opts.maxWidth = Number(this.params.attr.maxWidth)
      const pos = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'bottom-left'
      this.block.control.push(`
        const scaleOpts = ${jsonStringify(opts, true)}
        if ((Alpine.store('mapSetting') ?? {}).measure) scaleOpts.unit = Alpine.store('mapSetting').measure
        map.addControl(new maplibregl.ScaleControl(scaleOpts)${pos ? `, '${pos}'` : ''})
        if (Alpine.store('mapControl')) {
          el = document.querySelector('#' + map._container.id + ' .maplibregl-ctrl-scale')
          el.setAttribute('x-data', '')
          el.setAttribute('x-show', '$store.${storeKey}')
        }
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlScale
