import wmapsBase from '../wmaps-base.js'

async function controlDraw () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsControlDraw extends WmapsBase {
    static scripts = [
      ...super.scripts,
      'waibuMaps.virtual:/terra-draw/terra-draw.umd.js'
    ]

    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { isString } = this.plugin.app.bajo.lib._
      const opts = {}
      if (['imperial', 'metric', 'nautical'].includes(this.params.attr.unit)) opts.unit = this.params.attr.unit
      if (isString(this.params.attr.maxWidth) && Number(this.params.attr.maxWidth)) opts.maxWidth = Number(this.params.attr.maxWidth)
      // const pos = ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      this.params.html = `<script type="controlDraw">
        draw = new terraDraw.TerraDraw({
          adapter: new terraDraw.TerraDrawMapLibreGLAdapter({
            map,
            lib: maplibregl
          }),
          modes: [new terraDraw.TerraDrawFreehandMode()]
        })
        this.draw = draw
        this.draw.start()
        this.draw.setMode('freehand')
      </script>`
      this.params.html += `\n<script type="nonReactive">
        let draw
      </script>`
    }
  }
}

export default controlDraw