import control from './control.js'

async function controlLoader () {
  const WmapsControl = await control.call(this)

  return class WmapsControlLoader extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { groupAttrs, stringifyAttribs } = this.app.waibuMpa
      const group = groupAttrs(this.params.attr, ['progress'])
      const attr = group.progress ?? {}
      attr.value = '100'
      attr.strip = 'animated'
      if (!attr.height) attr.height = 3
      if (!attr.background) attr.background = 'color:danger'
      this.params.html = await this.component.buildSentence(`<c:div class="childmap maplibregl-ctrl-loader">
        <c:progress ${stringifyAttribs(attr)} x-show="$store.wmpa.loading"/>
      </c:div>`)
    }
  }
}

export default controlLoader
