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
      const { generateId } = this.app.lib.aneka
      const { isString } = this.app.lib._
      const { jsonStringify } = this.app.waibuMpa
      const id = isString(this.params.attr.id) ? this.params.attr.id : generateId('alpha')
      const opts = {}
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      opts.class = prefix + ' maplibregl-ctrl-group'
      this.addBlock('control', `
        await wmaps.createControl(_.merge(${jsonStringify(opts, true)}, { builder: this.${prefix}Builder }))
      `)
      this.addBlock('dataInit', `
        this.$watch('$store.mapSearch.value', async val => {
          await this.${prefix}FetchList(val)
        })
        this.$watch('$store.mapSearch.page', async val => {
          if (val > 0) await this.${prefix}FetchList(this.$store.mapSearch.value, val)
        })
        this.$watch('$store.mapSearch.recent', async val => {
          val = val ?? ''
          if (val === 'flying' && this.$store.mapSearch.feed === 'latLng:latLng') {
            wbs.closeModal('${id}')
            this.$store.mapSearch.recent = ''
          }
          wmpa.replaceWithComponentHtml(val, { selector: '#${id} .result div', wrapper: 'div' })
        })
        this.$watch('$store.mapSearch.feed', async val => {
          this.$store.mapSearch.recent = ''
          this.$store.mapSearch.page = null
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
        async ${prefix}FetchList (val, page) {
          if (_.isEmpty(val)) return wbs.notify('enterPhrase', { type: 'danger' })
          page = page || this.$store.mapSearch.page || 1
          let result = await ${this.params.attr.method}(val, this.$store.mapSearch.feed, { page })
          if (_.isString(result)) {
            this.$store.mapSearch.recent = result
            this.$store.mapSearch.busy = false
            return
          }

          let pagination = ''
          const { response, transformer, fields } = result
          if (response.data.length === 0) {
            this.$store.mapSearch.recent = await smaps.searchNotFound()
            this.$store.mapSearch.busy = false
            return
          }
          if (transformer) response.data = await transformer(response)
          const body = ['<c:div><c:table hover responsive><c:thead><c:tr>']
          for (const key of fields) {
            body.push('<c:th t:content="field.' + key + '" text="nowrap" />')
          }
          body.push('</c:tr></c:thead><c:tbody divider>')
          for (const row of response.data) {
            body.push('<c:tr style="cursor:pointer" @click="select(\\'' + row._selector + '\\')">')
            for (const key of fields) {
              body.push('<c:td text="nowrap">' + (row[key] || '') + '</c:td>')
            }
            body.push('</c:tr>')
          }
          body.push('</c:tbody></c:table>')
          if (response.pages > 1) {
            body.push('<c:div flex=justify-content:center margin=top-3><c:pagination>')
            const max = response.pages < 10 ? response.pages : 10
            for (let idx = 0; idx < max; idx++) {
              const pageNo = idx + 1
              body.push('<c:pagination-item @click=goto(' + pageNo + ') ' + (pageNo === response.page ? 'active' : '') + '>' + (idx + 1) + '</c:pagination-item>')
            }
            body.push('</c:pagination></c:div>')
          }
          body.push('</c:div>')
          result = await wmpa.fetchRender(body)
          this.$store.mapSearch.recent = result
          this.$store.mapSearch.busy = false
        }
      `, `
        async ${prefix}Populate () {
          const selector = '#${id} .input-group .dropdown-menu'
          if (document.querySelector(selector).children.length > 0) return
          const feeds = await ${this.params.attr.feed}() ?? []
          feeds.unshift({ code: 'latLng', name: 'gotoLatLng', feed: { id: 'latLng', cmpLabel: 'latLng' } })
          this.$store.mapSearch.feeds = feeds
          const body = feeds.map(feed => '<c:dropdown-item :class="$store.mapSearch.feed === $el.getAttribute(\\'data-code-feedid\\') ? \\'active\\' : \\'\\'" data-code-feedid="' + feed.code + ':' + feed.feed.id + '" t:content="' + feed.feed.cmpLabel + '" @click="$store.mapSearch.feed = \\'' + feed.code + ':' + feed.feed.id + '\\'"/>')
          const options = { selector, wrapper: 'div', checkChild: true }
          await wmpa.addComponent(body, options)
          if (!this.$store.mapSearch.feed) this.$store.mapSearch.feed = feeds[0].code + ':' + feeds[0].feed.id
          const html = this.$store.mapSearch.recent ?? ''
          wmpa.replaceWithComponentHtml(html, { selector: '#${id} .result div', wrapper: 'div' })
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
              return item ? item.feed.cmpLabel : code
            },
            search () {
              this.$store.mapSearch.value = this.$refs.input.value
            },
            goto (page) {
              this.$store.mapSearch.page = page
            },
            clearHistory () {
              this.$store.mapSearch.recent = ''
              Alpine.store('mapSearch').page = null
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
              Alpine.store('mapSearch').page = null
            },
            select (id) {
              this.$store.mapSearch.select = id
              const instance = wbs.getInstance('Modal', '${id}')
              instance.hide()
            }
          }" x-init="$watch('$store.mapSearch.feed', resetValue)">
            <c:form-input x-ref="input" type="search" dim="width:max" @keyup.enter="search()" :disabled="$store.mapSearch.busy" :value="$store.mapSearch.value">
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
          page: null,
          feeds: [],
          select: null,
          value: Alpine.$persist(null).as('mapSearchValue'),
          busy: false
        })
      `)

      this.params.html = [this.writeBlock(), ui].join('\n')
    }
  }
}

export default controlSearch
