import control from './control.js'
const prefix = 'news'

async function controlNewsticker () {
  const WmapsControl = await control.call(this)

  return class WmapsControlNewsticker extends WmapsControl {
    static scripts = [
      ...super.scripts,
      'bajo.virtual:/dayjs/dayjs.min.js',
      'bajo.virtual:/dayjs/plugin/timezone.js',
      'bajo.virtual:/dayjs/plugin/utc.js',
      'waibuExtra.virtual:/acmeticker/acmeticker.min.js'
    ]

    static inlineScript = 'dayjs.extend(dayjs_plugin_timezone); dayjs.extend(dayjs_plugin_utc)'

    static css = [
      ...super.css,
      'waibuMaps.asset:/css/control-news-ticker.css',
      'waibuMaps.asset:/css/atomic.min.css',
      'waibuMaps.asset:/css/acmeticker.css'
    ]

    static inlineCss = `
    :root { --at-gtr: 0 }
    .at-ticker-label { --at-bg-cl: #f00 }
    .at-ticker-box { font-size: larger; padding-right: 10px }
    .at-ticker-box ul { padding-top: 5px }
    .text-content { max-height: calc(100vh - 450px); overflow-y: auto }
    `

    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { camelCase } = this.app.lib._
      const { minify } = this.app.waibuMpa

      this.addBlock('nonReactive', `
        this.posts = []
      `)

      this.addBlock('reactive', [`
        async ${prefix}Click (id) {
          const item = this.posts.find(p => p.id === id)
          const att = item._attachments[0]
          let rsc = ''
          if (att) {
            if (att.mimeType.startsWith('video') && !att.url.endsWith('.olv')) {
              rsc = '<iframe style="height:250px; width:100%" frameborder="0" allowfullscreen scrolling="no" allow="camera; microphone; fullscreen" src="' + att.url + '"></iframe>'
            } else if (att.mimeType.startsWith('image')) {
              rsc = '<img style="height:250px" class="img-fluid" src="' + att.url + '">'
            }
          }
          const html = '<div class="d-flex border-bottom justify-content-center">' +
            rsc +
            '</div><div class="px-3 py-2"><h5>' + item.title + '</h5><div class="text-content">' +
            item.content.replaceAll('\\n', '<br>') +
            '</div></div>'

          smaps.showDetails(html, { title: item.category })
          const el = document.querySelector('.maplibregl-ctrl-newsticker .content')
          if (!el) return
        }
      `, `
        ${prefix}Dt () {
          const el = document.querySelector('.maplibregl-ctrl-newsticker .datetime h5')
          el.textContent = dayjs().tz('Asia/Jakarta').format('HH:mm [WIB]')
        }
      `, `
        async ${prefix}GetPosts () {
          // if (window.${prefix}) window.${prefix}.destroy()
          const el = document.querySelector('.maplibregl-ctrl-newsticker .content')
          el.innerHTML = ''
          this.posts = await wmpa.fetchApi('/cms/post', { headers: { 'X-Attachments': 'true' } }, { limit: 10 })
          if (this.posts.length === 0) return
          this.posts.forEach(post => {
            const li = document.createElement('li')
            const a = document.createElement('a')
            a.href = '#'
            a.classList.add('text-decoration-none')
            a.classList.add('text-truncate')
            a.classList.add('d-inline-block')
            a.style.width = '460px'
            a.textContent = post.title.toUpperCase()
            a.addEventListener('click', () => this.${prefix}Click(post.id))
            li.appendChild(a)
            el.appendChild(li)
          })
          window.${prefix} = new window.AcmeTicker(el, { 
            type: 'vertical',
            direction: 'down',
            speed: 600,
            autoplay: 4000
          })
        }
      `])

      this.addBlock('run', `
        this.${prefix}Dt()
        setInterval(this.${prefix}Dt, 1000)
        await this.${prefix}GetPosts()
        setInterval(this.${prefix}GetPosts, 3 * 60 * 1000)
      `)

      const ui = await minify(await this.component.buildSentence(`
        <c:div class="childmap maplibregl-ctrl-newsticker" x-data>
          <c:div x-show="$store.mapCtrl ? $store.mapCtrl.${camelCase(prefix)} : true">
            <c:div class="wrapper maplibregl-ctrl-group">
              <div class="at-ctnr">
                <div class="at-ticker at-flx at-pos at-h at-bdr at-bg-cl">
                  <div class="at-ticker-label at-bg-cl at-cl at-p at-flx-srnk-0 datetime"><h5></h5></div>
                  <c:div class="at-ticker-box at-h at-ovf at-p at-flx-grw-1" margin="start-2">
                    <ul class="content">
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
