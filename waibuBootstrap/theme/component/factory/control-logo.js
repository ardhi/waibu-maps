import control from './control.js'
import path from 'path'
const prefix = 'clogo'

async function controlLogo () {
  const WmapsControl = await control.call(this)

  return class WmapsControlLogo extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
      this.params.attr.menu = this.params.attr.menu ?? 'homes'
    }

    build = async () => {
      const { fs, fastGlob } = this.plugin.app.bajo.lib
      const { routePath } = this.plugin.app.waibu
      const { jsonStringify, groupAttrs, attribsStringify } = this.plugin.app.waibuMpa
      const opts = { class: prefix }
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      const group = groupAttrs(this.params.attr, ['img'])
      const img = group.img ?? {}
      img.opacity = parseFloat(img.opacity) || 0.3
      let logo = 'waibu'
      let logoAlt
      const files = await fastGlob(`${this.plugin.app.main.dir.pkg}/logo.*`)
      if (files.length > 0) {
        const dir = path.dirname(files[0])
        const ext = path.extname(files[0])
        logoAlt = fs.existsSync(`${dir}/logo-alt${ext}`)
        logo = 'main'
      }
      img.src = routePath(`waibuMpa:/logo/${logo}`)
      if (logoAlt) img.srcHover = routePath(`waibuMpa:/logo/${logo}?type=alt`)
      let animate = `@mouseenter="$el.style.opacity = 1" @mouseleave="$el.style.opacity = ${img.opacity}" `
      if (this.params.attr.noAnimate) {
        animate = ''
      } else {
        img.style = img.style ?? {}
        img.style.opacity = img.opacity
      }
      this.addBlock('reactive', `
        async ${prefix}Builder () {
          const body = ['<c:a href="#" @click="wbs.appLauncher(\\'fullscreen darkmode language\\', \\'${this.params.attr.menu}\\')">']
          body.push('<c:img ${attribsStringify(img)} ${animate} />')
          body.push('</c:a>')
          return await wmpa.createComponent(body)
        }
      `)

      this.addBlock('control', `
        await wmaps.createControl(_.merge(${jsonStringify(opts, true)}, { builder: this.${prefix}Builder }))
      `)

      this.params.html = this.writeBlock()
    }
  }
}

export default controlLogo
