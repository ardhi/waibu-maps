import wmapsBase from '../wmaps-base.js'

const storeKey = 'mapControl.nav'

async function controlNavigation (component) {
  const WmapsBase = await wmapsBase(component)

  return class WmapsControlNavigation extends WmapsBase {
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
      const pos = WmapsBase.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : undefined
      this.params.html = `<script type="controlNavigation">
        this.map.addControl(new maplibregl.NavigationControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
        if (Alpine.store('mapControl')) {
          el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-zoom-in').closest('.maplibregl-ctrl-group')
          el.setAttribute('x-data', '')
          el.setAttribute('x-show', '$store.${storeKey}')
        }
      </script>`
    }
  }
}

export default controlNavigation
