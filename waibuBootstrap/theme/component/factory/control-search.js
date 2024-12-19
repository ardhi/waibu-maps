import control from './control.js'
const storeKey = 'mapControl.search'
const prefix = 'ctrlsearch'

async function controlSearch () {
  const WmapsControl = await control.call(this)

  return class WmapsControlSearch extends WmapsControl {
    static scripts = [
      ...super.scripts,
      'waibuMaps.asset:/js/control-buttons.js'
    ]

    static css = [
      ...super.css,
      'waibuMaps.asset:/css/control-buttons.css'
    ]

    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { generateId } = this.plugin.app.bajo
      const { isString } = this.plugin.app.bajo.lib._
      const pos = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-right'
      const id = isString(this.params.attr.id) ? this.params.attr.id : generateId('alpha')
      const icon = this.component.iconset.resolve('search')
      this.block.dataInit.push(`
        this.$watch('$store.mapControl.searchValue', async val => {
          const cmp = await ${this.params.attr.method}(val, this.$store.mapControl.searchFeed)
          await wmpa.replaceWithComponent(cmp, '#${id} .result div')
          this.$store.mapControl.searchBusy = false
        })
        this.$watch('$store.mapControl.searchBusy', async val => {
          const el = document.querySelector('#${id} .input-group .dropdown-toggle')
          el.disabled = val
        })
      `)
      this.block.mapLoad.push(`
        await this.${prefix}Populate()
      `)
      this.block.reactive.push(`
        async ${prefix}Populate () {
          const feeds = await ${this.params.attr.feed}()
          if (feeds.length > 0) {
            const body = feeds.map(feed => '<c:dropdown-item :class="$store.mapControl.searchFeed === $el.getAttribute(\\'data-code-feedid\\') ? \\'active\\' : \\'\\'" data-code-feedid="' + feed.code + ':' + feed.feed.id + '" content="' + feed.feed.label + '" @click="$store.mapControl.searchFeed = \\'' + feed.code + ':' + feed.feed.id + '\\'"/>')
            await wmpa.addComponent(body, '#${id} .input-group .dropdown-menu', 'div')
            if (!Alpine.store('mapControl').searchFeed) Alpine.store('mapControl').searchFeed = feeds[0].code + ':' + feeds[0].feed.id
          }
        }
      `)
      this.block.control.push(`
          var ctl = new ControlButtons({
            cls: 'maplibregl-ctrl-search',
            items: [{
              icon: '${icon}',
              attrib: {
                dataBsTarget: '#${id}',
                dataBsToggle: 'modal',
                ariaControls: '${id}'
              }
            }],
            position: '${pos}'
          })
          map.addControl(ctl${pos ? `, '${pos}'` : ''})
          ctl.setScope(this)
          if (Alpine.store('mapControl')) {
            el = document.querySelector('#' + map._container.id + ' .maplibregl-ctrl-search')
            el.setAttribute('x-data', '')
            el.setAttribute('x-show', '$store.${storeKey}')
          }
      `)
      const ui = await this.component.buildSentence(`
        <div class="childmap maplibregl-ctrl-search">
          <c:modal id="${id}" size="lg" no-header x-data="{
            search () {
              this.$store.mapControl.searchValue = this.$refs.input.value
              this.$store.mapControl.searchBusy = true
            },
            select (id) {
              this.$store.mapControl.searchSelect = id
              const instance = wbs.getInstance('Modal', '${id}')
              instance.hide()
            }
          }">
            <c:form-input x-ref="input" type="search" dim="width:max" @keyup.enter="search()" :disabled="$store.mapControl.searchBusy">
              <c:form-input-addon prepend>
                <c:icon name="search" x-show="!$store.mapControl.searchBusy"/>
                <c:spinner size="sm" x-show="$store.mapControl.searchBusy" text="color:primary" />
              </c:form-input-addon>
              <c:form-input-addon prepend>
                <c:dropdown>
                </c:dropdown>
              </c:form-input-addon>
            </c:form-input>
            <c:div margin="top-3" class="result"><div></div></c:div>
          </c:modal>
        </div>
      `)
      this.params.html = [this.writeBlock(), ui].join('\n')
    }
  }
}

export default controlSearch
