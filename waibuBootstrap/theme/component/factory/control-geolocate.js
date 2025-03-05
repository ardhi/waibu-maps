import control from './control.js'

async function controlGeolocate () {
  const WmapsControl = await control.call(this)

  return class WmapsControlGeolocate extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { set } = this.plugin.app.bajo.lib._
      const opts = {}
      if (this.params.attr.highAccuracy) set(opts, 'positionOptions.enableHighAccuracy', true)
      if (this.params.attr.trackUserLocation) opts.trackUserLocation = true
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'bottom-right'
      this.block.control.push(`
        await wmaps.createControlNative('GeolocateControl', ${jsonStringify(opts, true)})
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlGeolocate
