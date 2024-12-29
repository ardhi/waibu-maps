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
      const { generateId } = this.plugin.app.bajo
      const { jsonStringify, minify } = this.plugin.app.waibuMpa
      const { omit } = this.plugin.app.bajo.lib._
      const options = omit(this.params.attr, ['octag', 'class', 'style', 'content'])
      options.class = prefix + ' maplibregl-ctrl-group'
      const id = generateId('alpha')
      const tpl = await minify(await this.component.buildSentence(`
        <c:table size="sm" text="align:center" no-border margin="all-0">
          <c:tr font="size:5">
            <td>{%= zoom %}</td>
            <td>{%= bearing %}°</td>
            <td>{%= pitch %}°</td>
          </c:tr>
          <c:tr style="font-size:smaller">
            <c:td t:content="Zoom" />
            <c:td t:content="Bearing" />
            <c:td t:content="Pitch" />
          </c:tr>
        </c:table>
      `))
      this.block.dataInit.push(`
        this.$watch('$store.map.zoom, $store.map.bearing, $store.map.pitch', this.${prefix}Update.bind(this))
      `)
      this.block.reactive.push(`
        ${prefix}Tpl: _.template('${tpl}')
      `, `
        ${prefix}Update () {
          const el = document.querySelector('#${id}')
          if (!el) return
          el.innerHTML = this.${prefix}Tpl({
            zoom: wmpa.format(this.$store.map.zoom, 'float'),
            bearing: wmpa.format(this.$store.map.bearing, 'float'),
            pitch: wmpa.format(this.$store.map.pitch, 'float')
          })
        }
      `, `
        async ${prefix}Builder () {
          const body = '<c:div id="${id}" padding="x-2 top-1"/>'
          return await wmpa.createComponent(body)
        }
      `)

      this.block.control.push(`
        await wmaps.createControl(_.merge(${jsonStringify(options, true)}, { builder: this.${prefix}Builder, firstCall: this.${prefix}Update }))
      `)

      this.params.html = this.writeBlock()
    }
  }
}

export default controlZbp
