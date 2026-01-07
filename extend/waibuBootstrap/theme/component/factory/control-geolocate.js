import control from './control.js'

async function controlGeolocate () {
  const WmapsControl = await control.call(this)

  return class WmapsControlGeolocate extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { jsonStringify } = this.app.waibuMpa
      const { set } = this.app.lib._
      const opts = {}
      if (this.params.attr.highAccuracy) set(opts, 'positionOptions.enableHighAccuracy', true)
      if (this.params.attr.trackUserLocation) opts.trackUserLocation = true
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'bottom-right'
      this.addBlock('control', `
        await wmaps.createControlNative('GeolocateControl', ${jsonStringify(opts, true)})
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlGeolocate
