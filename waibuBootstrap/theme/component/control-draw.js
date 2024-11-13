import { scripts, css, ctrlPos } from './map.js'

const cscripts = [...scripts]
cscripts.push('waibuMaps.virtual:/terra-draw/terra-draw.umd.js')

const controlDraw = {
  scripts: cscripts,
  css,
  handler: async function (params = {}) {
    const { isString } = this.plugin.app.bajo.lib._
    params.noTag = true
    const opts = {}
    if (['imperial', 'metric', 'nautical'].includes(params.attr.unit)) opts.unit = params.attr.unit
    if (isString(params.attr.maxWidth) && Number(params.attr.maxWidth)) opts.maxWidth = Number(params.attr.maxWidth)
    // const pos = ctrlPos.includes(params.attr.position) ? params.attr.position : 'top-left'
    params.html = `<script type="controlDraw">
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
    params.html += `\n<script type="nonReactive">
      let draw
    </script>`
  }
}

export default controlDraw
