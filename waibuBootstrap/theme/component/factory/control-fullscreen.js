import wmapsBase from '../wmaps-base.js'

const storeKey = 'mapControl.fullscreen'

async function controlFullscreen (component) {
  const WmapsBase = await wmapsBase(component)

  return class WmapsControlFullscreen extends WmapsBase {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { isString } = this.plugin.app.bajo.lib._
      const opts = {}
      if (isString(this.params.attr.container)) opts.container = this.params.attr.container
      const pos = WmapsBase.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : undefined
      this.params.html = `<script type="controlFullscreen">
        this.map.addControl(new maplibregl.FullscreenControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
        if (Alpine.store('mapControl')) {
          el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-fullscreen').closest('.maplibregl-ctrl-group')
          el.setAttribute('x-data', '')
          el.setAttribute('x-show', '$store.${storeKey}')
        }
      </script>`
    }
  }
}

export default controlFullscreen
