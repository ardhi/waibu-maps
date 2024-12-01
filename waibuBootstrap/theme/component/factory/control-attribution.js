import wmapsBase from '../wmaps-base.js'

const storeKey = 'mapControl.attrib'

async function controlAttribution () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsControlAttribution extends WmapsBase {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { isString } = this.plugin.app.bajo.lib._
      const opts = {
        compact: !this.params.attr.noCompact
      }
      if (isString(this.params.attr.text)) opts.customAttribution = this.params.attr.text
      const pos = WmapsBase.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : undefined
      this.params.html = `<script type="controlAttribution">
        this.map.addControl(new maplibregl.AttributionControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
        if (Alpine.store('mapControl')) {
          el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-attrib')
          el.setAttribute('x-data', '')
          el.setAttribute('x-show', '$store.${storeKey}')
        }
      </script>`
    }
  }
}

export default controlAttribution
