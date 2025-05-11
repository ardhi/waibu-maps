import control from './control.js'

const prefix = 'czbp'

async function controlZbp () {
  const WmapsControl = await control.call(this)

  return class WmapsControlZbp extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { generateId } = this.plugin.app.bajo
      const { jsonStringify, minify } = this.plugin.app.waibuMpa
      const { omit } = this.plugin.app.bajo.lib._
      const options = omit(this.params.attr, ['octag', 'class', 'style', 'content'])
      options.class = prefix + ' maplibregl-ctrl-group widget'
      const id = generateId('alpha')
      const tpl = await minify(await this.component.buildSentence(`
        <c:grid-row font="size:5">
          <c:grid-col col="4">{%= zoom %}</c:grid-col>
          <c:grid-col col="4">{%= bearing %}</c:grid-col>
          <c:grid-col col="4">{%= pitch %}</c:grid-col>
        </c:grid-row>
        <c:grid-row style="font-size:smaller">
          <c:grid-col col="4" t:content="Zoom" />
          <c:grid-col style="cursor:pointer" @click="reset" col="4" t:content="Bearing" />
          <c:grid-col style="cursor:pointer" @click="reset" col="4" t:content="Pitch" />
        </c:grid-row>
      `))
      this.addBlock('dataInit', `
        this.$watch('$store.map.zoom, $store.map.bearing, $store.map.pitch', this.${prefix}Update.bind(this))
      `)
      this.addBlock('reactive', [`
        ${prefix}Tpl: _.template('${tpl}')
      `, `
        ${prefix}Update () {
          const el = document.querySelector('#${id}')
          if (!el) return
          el.innerHTML = this.${prefix}Tpl({
            zoom: wmpa.format(this.$store.map.zoom, 'integer'),
            bearing: wmpa.format(this.$store.map.bearing, 'integer'),
            pitch: wmpa.format(this.$store.map.pitch, 'integer')
          })
        }
      `, `
        async ${prefix}Builder () {
          const body = ['<c:div id="${id}" margin="x-2 top-1" text="align:center" ',
            'x-data="{',
            ' reset () {',
            '   wmpa.alpineScopeMethod(\\'getMap.flyTo\\')({ bearing: 0, pitch: 0 }) ',
            ' }',
            '}" />'
          ]
          return await wmpa.createComponent(body)
        }
      `])

      this.addBlock('control', `
        await wmaps.createControl(_.merge(${jsonStringify(options, true)}, { builder: this.${prefix}Builder, firstCall: this.${prefix}Update }))
      `)

      this.params.html = this.writeBlock()
    }
  }
}

export default controlZbp
