import control from './control.js'
const prefix = 'newsticker'

async function controlNewsticker () {
  const WmapsControl = await control.call(this)

  return class WmapsControlNewsticker extends WmapsControl {
    static scripts = [
      ...super.scripts,
      'waibuExtra.virtual:/acmeticker/acmeticker.min.js',
      'waibuMaps.asset:/js/control-news-ticker.js'
    ]

    static css = [
      ...super.css,
      'waibuMaps.asset:/css/control-news-ticker.css',
      'waibuMaps.asset:/css/atomic.min.css',
      'waibuMaps.asset:/css/acmeticker.css'
    ]

    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { camelCase } = this.app.lib._
      const { minify } = this.app.waibuMpa
      const { getModel } = this.app.dobo

      const model = getModel('CmsPost')
      const posts = await model.findRecord({ query: { status: 'PUBLISHED' }, limit: 10 }, { noMagic: true })
      console.log(posts)

      this.addBlock('reactive', [`
        async ${prefix}Click (id) {
          const item = await wmpa.fetchApi('/cms/post/' + id)
          const imgUrl = '/dobo/attachment/cms-post/' + id + '/file/_first?notfound=true'
          const html = '<div class="d-flex border-bottom justify-content-center">' +
            '<img style="max-height:200px" class="img-fluid" src="/db/attachment/cms-post/' + id + '/file/_first?notfound=true">' +
            '</div><div class="px-3 py-2"><h5>' + item.title + '</h5>' +
            item.content.replaceAll('\\n', '<br>') +
            '</div>'

          smaps.showDetails(html)
          const el = document.querySelector('.maplibregl-ctrl-newsticker .content')
          if (!el) return
        }
      `])

      const content = posts.map(post => `<li><a href="#" @click="${prefix}Click(${post.id})">${post.title}</a></li>`).join('\n')

      const ui = await minify(await this.component.buildSentence(`
        <c:div class="childmap maplibregl-ctrl-newsticker" x-data>
          <c:div x-show="$store.mapCtrl ? $store.mapCtrl.${camelCase(prefix)} : true">
            <c:div class="wrapper maplibregl-ctrl-group">
              <div class="at-ctnr">
                <div class="at-ticker at-flx at-pos at-h at-bdr at-bg-cl">
                  <div class="at-ticker-label at-bg-cl at-cl at-p at-flx-srnk-0">Headlines</div>
                  <c:div class="at-ticker-box at-h at-ovf at-p at-flx-grw-1" margin="start-2">
                    <ul class="content">
                      ${content}
                    </ul>
                  </c:div>
                </div>
              </div>
            </c:div>
          </c:div>
        </c:div>
      `))
      this.params.html = [this.writeBlock(), ui].join('\n')
    }
  }
}

export default controlNewsticker
