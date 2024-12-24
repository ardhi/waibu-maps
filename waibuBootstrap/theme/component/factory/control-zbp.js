import control from './control.js'

const prefix = 'czbp'

async function controlZbp () {
  const WmapsControl = await control.call(this)

  return class WmapsControlZbp extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { omit } = this.plugin.app.bajo.lib._
      const options = omit(this.params.attr, ['octag', 'class', 'style', 'content'])
      options.class = prefix + ' maplibregl-ctrl-widget'
      this.block.reactive.push(`
        async ${prefix}Builder () {
          const body = '<c:div color="primary">Test</c:div>'
          return await wmpa.createComponent(body)
        }
      `)

      this.block.control.push(`
        await wmaps.createControl(_.merge(${jsonStringify(options, true)}, { builder: this.${prefix}Builder }))
      `)

      this.params.html = this.writeBlock()
    }
  }
}

export default controlZbp
