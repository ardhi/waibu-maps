import control from './control.js'

async function controlLoader () {
  const WmapsControl = await control.call(this)

  return class WmapsControlLoader extends WmapsControl {
    static css = [
      ...super.css,
      'waibuMaps.asset:/css/control-loader.css'
    ]

    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { groupAttrs, attribsStringify } = this.plugin.app.waibuMpa
      const group = groupAttrs(this.params.attr, ['progress'])
      const attr = group.progress ?? {}
      attr.value = '100'
      attr.strip = 'animated'
      if (!attr.height) attr.height = 3
      if (!attr.background) attr.background = 'color:danger'
      this.params.html = await this.component.buildSentence(`<c:div class="childmap maplibregl-ctrl-loader">
        <c:progress ${attribsStringify(attr)} x-show="$store.wmpa.loading"/>
      </c:div>`)
    }
  }
}

export default controlLoader
