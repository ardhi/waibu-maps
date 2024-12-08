import control from './control.js'
const storeKey = 'mapControl.nav'

async function controlNavigation () {
  const WmapsControl = await control.call(this)

  return class WmapsControlNavigation extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { jsonStringify } = this.plugin.app.waibuMpa
      const opts = {}
      if (this.params.attr.noCompass) opts.showCompass = false
      if (this.params.attr.noZoom) opts.showZoom = false
      if (this.params.attr.visualizePitch) opts.visualizePitch = true
      const pos = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'bottom-right'
      this.block.control.push(`
        this.map.addControl(new maplibregl.NavigationControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
        if (Alpine.store('mapControl')) {
          el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-zoom-in').closest('.maplibregl-ctrl-group')
          el.setAttribute('x-data', '')
          el.setAttribute('x-show', '$store.${storeKey}')
        }
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlNavigation
