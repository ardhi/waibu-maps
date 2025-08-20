import control from './control.js'

async function controlScale () {
  const WmapsControl = await control.call(this)

  return class WmapsControlScale extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { isString } = this.plugin.app.bajo.lib._
      const opts = {}
      if (['imperial', 'metric', 'nautical'].includes(this.params.attr.unit)) opts.unit = this.params.attr.unit
      if (isString(this.params.attr.maxWidth) && Number(this.params.attr.maxWidth)) opts.maxWidth = Number(this.params.attr.maxWidth)
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'bottom-left'
      this.addBlock('control', `
        await wmaps.createControlNative('ScaleControl', ${jsonStringify(opts, true)})
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlScale
