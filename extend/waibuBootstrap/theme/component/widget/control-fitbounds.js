import control from './control.js'
const prefix = 'cfitb'

async function controlFitbounds () {
  const WmapsControl = await control.call(this)

  return class WmapsControlFitbounds extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { jsonStringify } = this.app.waibuMpa
      const opts = {}
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      const layers = (this.params.attr.layers ?? '').split(' ')
      opts.class = prefix + ' maplibregl-ctrl-group'
      this.addBlock('reactive', `
        async ${prefix}Builder (params) {
          const body = [
            \`<c:button dim="height:100" flex="align-items:center justify-content:center" @click="fitBounds()" x-data="{
              async fitBounds() {
                if (!window.smaps) return
                const layers = ${jsonStringify(layers, true)}
                const feats = []
                for (const l of layers) {
                  const layer = window.smaps.map.getLayer(l)
                  if (!layer) continue
                  const data = await window.smaps.map.getSource(layer.source).getData()
                  data.features.forEach(f => feats.push(f))
                }
                window.smaps.fitBounds(feats, { enlarge: true })
              }
            }">\`,
            '<c:icon name="intersect" />',
            '</c:button>'
          ]
          return [await wmpa.createComponent(body)]
        }
      `)

      this.addBlock('control', `
        await wmaps.createControl(_.merge(${jsonStringify(opts, true)}, { builder: this.${prefix}Builder }))
      `)

      this.params.html = this.writeBlock()
    }
  }
}

export default controlFitbounds
