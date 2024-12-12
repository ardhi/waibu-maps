import control from './control.js'

const storeKey = 'mapControl.attrib'

async function controlAttribution () {
  const WmapsControl = await control.call(this)

  return class WmapsControlAttribution extends WmapsControl {
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
      const pos = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'bottom-right'
      this.block.control.push(`
        map.addControl(new maplibregl.AttributionControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
        if (Alpine.store('mapControl')) {
          el = document.querySelector('#' + map._container.id + ' .maplibregl-ctrl-attrib')
          el.setAttribute('x-data', '')
          el.setAttribute('x-show', '$store.${storeKey}')
        }
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlAttribution
