import control from './control.js'

const storeKey = 'mapControl.geolocate'

async function controlGeolocate () {
  const WmapsControl = await control.call(this)

  return class WmapsControlGeolocate extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { set } = this.plugin.app.bajo.lib._
      const opts = {}
      if (this.params.attr.highAccuracy) set(opts, 'positionOptions.enableHighAccuracy', true)
      if (this.params.attr.trackUserLocation) opts.trackUserLocation = true
      const pos = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'bottom-right'
      this.block.control.push(`
        map.addControl(new maplibregl.GeolocateControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
        if (Alpine.store('mapControl')) {
          el = document.querySelector('#' + map._container.id + ' .maplibregl-ctrl-geolocate').closest('.maplibregl-ctrl-group')
          el.setAttribute('x-data', '')
          el.setAttribute('x-show', '$store.${storeKey}')
        }
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlGeolocate
