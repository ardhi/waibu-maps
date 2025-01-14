import control from './control.js'

const prefix = 'cmp'

async function controlMousePos () {
  const WmapsControl = await control.call(this)

  return class WmapsControlMousePos extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { generateId } = this.plugin.app.bajo
      const { jsonStringify, minify } = this.plugin.app.waibuMpa
      const { has, omit } = this.plugin.app.bajo.lib._
      const options = omit(this.params.attr, ['octag', 'class', 'style', 'content'])
      options.class = prefix + ' maplibregl-ctrl-group widget'
      const id = generateId('alpha')
      const tpl = await minify(await this.component.buildSentence(`
        <c:grid-row>
          <c:grid-col col="6">{%= lng %}</c:grid-col>
          <c:grid-col col="6">{%= lat %}</c:grid-col>
        </c:grid-row>
        <c:grid-row style="font-size:smaller">
          <c:grid-col col="6" t:content="Longitude" />
          <c:grid-col col="6" t:content="Latitude" />
        </c:grid-row>
      `))
      this.block.dataInit.push(`
        this.$watch('$store.map.center', val => {
          if (!this.${prefix}TrackCenter) return
          this.${prefix}Pos = [...val]
        })
        this.$watch('${prefix}Pos', this.${prefix}Update.bind(this))
      `)
      this.block.reactive.push(`
        ${prefix}Tpl: _.template('${tpl}')
      `, `
        ${prefix}Pos: [0, 0]
      `, `
        ${prefix}TrackCenter: ${has(this.params.attr, 'trackCenter') ? 'true' : 'false'}
      `, `
        ${prefix}Update () {
          const el = document.querySelector('#${id}')
          if (!el) return
          const [lng, lat] = this.${prefix}Pos
          el.innerHTML = this.${prefix}Tpl({
            lng: wmpa.format(lng, 'float', { longitude: true }),
            lat: wmpa.format(lat, 'float', { latitude: true })
          })
        }
      `, `
        async ${prefix}Builder () {
          const body = '<c:div id="${id}" margin="x-2 top-1" text="align:center nowrap"/>'
          return await wmpa.createComponent(body)
        }
      `)
      this.block.run.push(`
        map.on('mousemove', evt => {
          if (this.${prefix}TrackCenter) return
          const coord = evt.lngLat.wrap()
          this.${prefix}Pos = [coord.lng, coord.lat]
        })
        if (this.${prefix}TrackCenter && this.$store.map.center) this.${prefix}Pos = [...this.$store.map.center]
      `)

      this.block.control.push(`
        await wmaps.createControl(_.merge(${jsonStringify(options, true)}, { builder: this.${prefix}Builder, firstCall: this.${prefix}Update }))
      `)

      this.params.html = this.writeBlock()
    }
  }
}

export default controlMousePos
