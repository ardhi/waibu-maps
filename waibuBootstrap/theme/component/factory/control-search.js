import control from './control.js'
const prefix = 'csrc'

async function controlSearch () {
  const WmapsControl = await control.call(this)

  return class WmapsControlSearch extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { generateId } = this.plugin.app.bajo
      const { isString } = this.plugin.app.bajo.lib._
      const { jsonStringify } = this.plugin.app.waibuMpa
      const id = isString(this.params.attr.id) ? this.params.attr.id : generateId('alpha')
      const opts = {}
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      opts.class = prefix + ' maplibregl-ctrl-group'
      this.block.control.push(`
        await wmaps.createControl(_.merge(${jsonStringify(opts, true)}, { builder: this.${prefix}Builder }))
      `)
      this.block.dataInit.push(`
        this.$watch('$store.mapSearch.value', async val => {
          const html = await ${this.params.attr.method}(val, this.$store.mapSearch.feed)
          this.$store.mapSearch.recent = html
          this.$store.mapSearch.busy = false
        })
        this.$watch('$store.mapSearch.recent', async val => {
          wmpa.replaceWithComponentHtml(val, '#${id} .result div', 'div')
        })
        this.$watch('$store.mapSearch.feed', async val => {
          this.$store.mapSearch.recent = ''
        })
        this.$watch('$store.mapSearch.busy', async val => {
          const el = document.querySelector('#${id} .input-group .dropdown-toggle')
          el.disabled = val
        })
      `)
      this.block.mapLoad.push(`
        await this.${prefix}Populate()
      `)
      this.block.reactive.push(`
        async ${prefix}Builder (params) {
          const body = [
            '<c:button dim="height:100" flex="align-items:center justify-content:center" open="${id}">',
            '<c:icon name="search" />',
            '</c:button>'
          ]
          return [await wmpa.createComponent(body)]
        },
        async ${prefix}Populate () {
          const feeds = await ${this.params.attr.feed}()
          if (feeds.length > 0) {
            this.$store.mapSearch.feeds = feeds
            const body = feeds.map(feed => '<c:dropdown-item :class="$store.mapSearch.feed === $el.getAttribute(\\'data-code-feedid\\') ? \\'active\\' : \\'\\'" data-code-feedid="' + feed.code + ':' + feed.feed.id + '" content="' + feed.feed.label + '" @click="$store.mapSearch.feed = \\'' + feed.code + ':' + feed.feed.id + '\\'"/>')
            await wmpa.addComponent(body, '#${id} .input-group .dropdown-menu', 'div')
            if (!this.$store.mapSearch.feed) this.$store.mapSearch.feed = feeds[0].code + ':' + feeds[0].feed.id
            const html = this.$store.mapSearch.recent ?? ''
            wmpa.replaceWithComponentHtml(html, '#${id} .result div', 'div')
          }
        }
      `)
      const ui = await this.component.buildSentence(`
        <div class="childmap maplibregl-ctrl-search">
          <c:modal id="${id}" size="lg" no-header x-data="{
            get feedName () {
              const [code, feedId] = (this.$store.mapSearch.feed ?? '').split(':')
              const item = _.find(this.$store.mapSearch.feeds, f => f.code === code && f.feed.id === feedId)
              return item ? item.feed.label : feedId
            },
            search () {
              this.$store.mapSearch.value = this.$refs.input.value
              this.$store.mapSearch.busy = true
            },
            select (id) {
              this.$store.mapSearch.select = id
              const instance = wbs.getInstance('Modal', '${id}')
              instance.hide()
            }
          }">
            <c:form-input x-ref="input" type="search" dim="width:max" @keyup.enter="search()" :disabled="$store.mapSearch.busy">
              <c:form-input-addon prepend>
                <c:icon name="search" x-show="!$store.mapSearch.busy"/>
                <c:spinner size="sm" x-show="$store.mapSearch.busy" text="color:primary" />
              </c:form-input-addon>
              <c:form-input-addon prepend>
                <c:dropdown>
                </c:dropdown>
              </c:form-input-addon>
            </c:form-input>
            <c:div margin="top-2"><c:t>Search in:</c:t> <c:span font="weight:bold" x-html="feedName" /></c:div>
            <c:div margin="top-3" class="result"><div></div></c:div>
          </c:modal>
        </div>
      `)
      this.block.initializing.push(`
        Alpine.store('mapSearch', {
          feed: Alpine.$persist(null).as('mapSearchFeed'),
          recent: Alpine.$persist('').as('mapSearchRecent'),
          feeds: [],
          select: null,
          value: null,
          busy: false
        })
      `)

      this.params.html = [this.writeBlock(), ui].join('\n')
    }
  }
}

export default controlSearch
