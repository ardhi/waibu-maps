import wmapsBase from '../wmaps-base.js'

const storeKey = 'mapControl.geolocate'

async function controlGeolocate () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsControlGeolocate extends WmapsBase {
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
      const pos = WmapsBase.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : undefined
      this.params.html = `<script type="controlFullscreen">
        this.map.addControl(new maplibregl.GeolocateControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
        if (Alpine.store('mapControl')) {
          el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-geolocate').closest('.maplibregl-ctrl-group')
          el.setAttribute('x-data', '')
          el.setAttribute('x-show', '$store.${storeKey}')
        }
      </script>`
    }
  }
}

export default controlGeolocate
