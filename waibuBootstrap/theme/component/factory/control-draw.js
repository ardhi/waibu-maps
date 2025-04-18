import control from './control.js'

async function controlDraw () {
  const WmapsControl = await control.call(this)

  return class WmapsControlDraw extends WmapsControl {
    static scripts = [
      ...super.scripts,
      'waibuMaps.virtual:/draw-ctrl/maplibre-gl-terradraw.umd.js'
    ]

    static css = [
      ...super.css,
      'waibuMaps.virtual:/draw-ctrl/maplibre-gl-terradraw.css'
    ]

    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { jsonStringify, attrToArray } = this.plugin.app.waibuMpa
      const opts = {}
      if (['imperial', 'metric', 'nautical'].includes(this.params.attr.unit)) opts.unit = this.params.attr.unit
      const pos = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      let modes = ['point', 'linestring', 'polygon', 'rectangle', 'circle', 'freehand', 'angled-rectangle', 'sensor', 'sector', 'select', 'delete-selection', 'delete', 'render', 'download']
      if (this.params.attr.modes) modes = attrToArray(this.params.attr.modes)
      this.block.control.push(`
        draw = new MaplibreTerradrawControl.MaplibreTerradrawControl({
          modes: ${jsonStringify(modes, true)},
          open: true,
        })
        map.addControl(draw, '${pos}')
      `)
      this.block.nonReactive.push(`
        let draw
      `)
      this.params.html = this.writeBlock()
    }
  }
}

export default controlDraw
