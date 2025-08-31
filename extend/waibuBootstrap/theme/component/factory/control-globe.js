import control from './control.js'

async function controlGlobe () {
  const WmapsControl = await control.call(this)

  return class WmapsControlFullscreen extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { isString } = this.app.lib._
      const opts = {}
      if (isString(this.params.attr.container)) opts.container = this.params.attr.container
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'bottom-right'
      this.addBlock('mapStyle', `
        await wmaps.createControlNative('GlobeControl', ${jsonStringify(opts, true)})
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlGlobe
