import control from './control.js'

async function controlAttribution () {
  const WmapsControl = await control.call(this)

  return class WmapsControlAttribution extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { isString } = this.plugin.app.bajo.lib._
      const opts = {
        compact: !this.params.attr.noCompact
      }
      if (isString(this.params.attr.text)) opts.customAttribution = this.params.attr.text
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'bottom-right'
      opts.classSelector = 'maplibregl-ctrl-attrib'
      this.block.control.push(`
        await wmaps.createControlNative('AttributionControl', ${jsonStringify(opts, true)})
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlAttribution
