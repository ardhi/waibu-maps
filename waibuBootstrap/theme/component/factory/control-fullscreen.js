import control from './control.js'

const storeKey = 'mapControl.fullscreen'

async function controlFullscreen () {
  const WmapsControl = await control.call(this)

  return class WmapsControlFullscreen extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { isString } = this.plugin.app.bajo.lib._
      const opts = {}
      if (isString(this.params.attr.container)) opts.container = this.params.attr.container
      const pos = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'bottom-right'
      this.block.control.push(`
        this.map.addControl(new maplibregl.FullscreenControl(${jsonStringify(opts, true)})${pos ? `, '${pos}'` : ''})
        if (Alpine.store('mapControl')) {
          el = document.querySelector('#' + this.map._container.id + ' .maplibregl-ctrl-fullscreen').closest('.maplibregl-ctrl-group')
          el.setAttribute('x-data', '')
          el.setAttribute('x-show', '$store.${storeKey}')
        }
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlFullscreen
