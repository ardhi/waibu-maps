import control from './control.js'
const prefix = 'csrc'

async function controlSearch () {
  const WmapsControl = await control.call(this)

  return class WmapsControlSearch extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { generateId } = this.plugin.app.bajo
      const { isString } = this.plugin.app.bajo.lib._
      const { jsonStringify } = this.plugin.app.waibuMpa
      const id = isString(this.params.attr.id) ? this.params.attr.id : generateId('alpha')
      const opts = {}
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      opts.class = prefix + ' maplibregl-ctrl-group'
      this.addBlock('control', `
        await wmaps.createControl(_.merge(${jsonStringify(opts, true)}, { builder: this.${prefix}Builder }))
      `)
      this.addBlock('dataInit', `
        this.$watch('$store.mapSearch.value', async val => {
          if (_.isEmpty(val)) return wbs.notify('enterPhrase', { type: 'danger' })
          const html = await ${this.params.attr.method}(val, this.$store.mapSearch.feed)
          this.$store.mapSearch.recent = html ?? ''
          this.$store.mapSearch.busy = false
        })
        this.$watch('$store.mapSearch.recent', async val => {
          val = val ?? ''
          if (val === 'flying' && this.$store.mapSearch.feed === 'latLng:latLng') {
            wbs.closeModal('${id}')
            this.$store.mapSearch.recent = ''
          }
          wmpa.replaceWithComponentHtml(val, '#${id} .result div', 'div')
        })
        this.$watch('$store.mapSearch.feed', async val => {
          this.$store.mapSearch.recent = ''
        })
        this.$watch('$store.mapSearch.busy', async val => {
          const el = document.querySelector('#${id} .input-group .dropdown-toggle')
          el.disabled = !!val
        })
      `)
      this.addBlock('mapStyle', `
        await this.${prefix}Populate()
      `)
      this.addBlock('reactive', [`
        async ${prefix}Builder (params) {
          const body = [
            '<c:button dim="height:100" flex="align-items:center justify-content:center" open="${id}">',
            '<c:icon name="search" />',
            '</c:button>'
          ]
          return [await wmpa.createComponent(body)]
        }
      `, `
        async ${prefix}Populate () {
          const feeds = await ${this.params.attr.feed}() ?? []
          feeds.unshift({ code: 'latLng', name: 'gotoLatLng', feed: { id: 'latLng', label: 'latLng' } })
          this.$store.mapSearch.feeds = feeds
          const body = feeds.map(feed => '<c:dropdown-item :class="$store.mapSearch.feed === $el.getAttribute(\\'data-code-feedid\\') ? \\'active\\' : \\'\\'" data-code-feedid="' + feed.code + ':' + feed.feed.id + '" t:content="' + feed.feed.label + '" @click="$store.mapSearch.feed = \\'' + feed.code + ':' + feed.feed.id + '\\'"/>')
          await wmpa.addComponent(body, '#${id} .input-group .dropdown-menu', 'div')
          if (!this.$store.mapSearch.feed) this.$store.mapSearch.feed = feeds[0].code + ':' + feeds[0].feed.id
          const html = this.$store.mapSearch.recent ?? ''
          wmpa.replaceWithComponentHtml(html, '#${id} .result div', 'div')
        }
      `])
      const ui = await this.component.buildSentence(`
        <div class="childmap maplibregl-ctrl-search">
          <c:modal id="${id}" size="lg" no-header no-center x-data="{
            get feedCode () {
              const [code, feedId] = (this.$store.mapSearch.feed ?? '').split(':')
              return code
            },
            get feedName () {
              const [code, feedId] = (this.$store.mapSearch.feed ?? '').split(':')
              const item = _.find(this.$store.mapSearch.feeds, f => f.code === code && f.feed.id === feedId)
              return item ? item.feed.label : feedId
            },
            search () {
              this.$store.mapSearch.value = this.$refs.input.value
            },
            clearHistory () {
              wmpa.replaceWithComponentHtml('', '#${id} .result div', 'div')
            },
            abort () {
              const endpoint = this.$store.mapSearch.busy
              const status = _.get(wmpa, 'fetchingApi.' + endpoint + '.status')
              const controller = _.get(wmpa, 'fetchingApi.' + endpoint + '.abortCtrl')
              if (!endpoint || status !== 'fetching') return
              controller.abort()
            },
            resetValue () {
              const el = document.querySelector('#${id} input[type=search]')
              el.value = ''
            },
            select (id) {
              this.$store.mapSearch.select = id
              const instance = wbs.getInstance('Modal', '${id}')
              instance.hide()
            }
          }" x-init="$watch('$store.mapSearch.feed', resetValue)">
            <c:form-input x-ref="input" type="search" dim="width:max" @keyup.enter="search()" :disabled="$store.mapSearch.busy">
              <c:form-input-addon prepend>
                <c:dropdown>
                </c:dropdown>
              </c:form-input-addon>
              <c:form-input-addon prepend>
                <c:span x-show="feedCode === 'latLng'"><c:icon name="arrowEnd"/></c:span>
                <c:span x-show="feedCode !== 'latLng' && !$store.mapSearch.busy"><c:icon name="search"/></c:span>
                <c:spinner size="sm" x-show="feedCode !== 'latLng' && $store.mapSearch.busy" text="color:primary" />
              </c:form-input-addon>
              <c:form-input-addon append>
                <c:btn @click="abort" x-show="$store.mapSearch.busy" t:content="Abort" />
              </c:form-input-addon>
            </c:form-input>
            <c:div margin="top-2" flex="justify-content:between">
              <div>
                <template x-if="feedCode !== 'latLng'"><span><c:t>searchIn</c:t>: <strong><span x-html="feedName" /></strong></span></template>
                <template x-if="feedCode === 'latLng'"><span><c:t>goto</c:t>: <strong><span><c:t>latLng</c:t></span></strong></span></template>
              </div>
              <c:btn x-show="feedCode !== 'latLng'" size="sm" color="link" t:content="clearHistory" @click="clearHistory()" />
            </c:div>
            <c:div margin="top-3" class="result"><div></div></c:div>
          </c:modal>
        </div>
      `)
      this.addBlock('dataInit', `
        this.$watch('$store.mapSearch.select', async val => {
          if (_.isEmpty(val)) return
          const [source, feedId] = (this.$store.mapSearch.feed ?? '').split(':')
          const feed = _.find(this.$store.mapSearch.feeds, item => {
            return item.code === source && item.feed.id === feedId
          })
          this.$store.mapSearch.select = null
          const scope = wmpa.alpineScope()
          const fn = scope[feed.feed.prefix + 'FindTarget']
          if (fn) await fn.call(scope, val, feedId)
        })
      `)
      this.component.addScriptBlock('alpineInitializing', `
        Alpine.store('mapSearch', {
          feed: Alpine.$persist('latLng:latLng').as('mapSearchFeed'),
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
