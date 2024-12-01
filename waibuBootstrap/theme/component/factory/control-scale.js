import wmapsBase from '../wmaps-base.js'

const storeKey = 'mapControl.scale'

async function controlScale () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsControlScale extends WmapsBase {
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
      const pos = WmapsBase.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : undefined
      this.params.html = `<script type="controlScale">
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
}

export default controlScale
