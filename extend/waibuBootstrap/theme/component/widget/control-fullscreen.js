import control from './control.js'

async function controlFullscreen () {
  const WmapsControl = await control.call(this)

  return class WmapsControlFullscreen extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { jsonStringify } = this.app.waibuMpa
      const { isString } = this.app.lib._
      const opts = {}
      if (isString(this.params.attr.container)) opts.container = this.params.attr.container
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'bottom-right'
      this.addBlock('control', `
        await wmaps.createControlNative('FullscreenControl', ${jsonStringify(opts, true)})
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlFullscreen
