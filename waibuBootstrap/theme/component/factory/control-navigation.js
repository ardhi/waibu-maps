import control from './control.js'

async function controlNavigation () {
  const WmapsControl = await control.call(this)

  return class WmapsControlNavigation extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { jsonStringify } = this.plugin.app.waibuMpa
      const opts = { showCompass: true }
      if (this.params.attr.compass) opts.showCompass = true
      if (this.params.attr.noZoom) opts.showZoom = false
      if (this.params.attr.visualizePitch) opts.visualizePitch = true
      opts.classSelector = 'maplibregl-ctrl-zoom-in'
      opts.classGroup = true
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'bottom-right'
      this.addBlock('control', `
        const navOpts = ${jsonStringify(opts, true)}
        if (Alpine.store('map').noMapRotate) {
          map.dragRotate.disable()
          map.touchZoomRotate.disableRotation()
          navOpts.showCompass = false
        } else {
          if (Alpine.store('map').hideCompass) navOpts.showCompass = false
        }
        await wmaps.createControlNative('NavigationControl', navOpts)
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlNavigation
