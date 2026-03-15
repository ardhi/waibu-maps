import control from './control.js'
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
      const { routePath } = this.app.waibu
      const { jsonStringify, groupAttrs, stringifyAttribs } = this.app.waibuMpa
      const opts = { class: prefix }
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      const group = groupAttrs(this.params.attr, ['img'])
      const img = group.img ?? {}
      img.opacity = parseFloat(img.opacity) || 0.3
      img.src = routePath('waibuMpa:/logo/main')
      let animate = `@mouseenter="$el.style.opacity = 1" @mouseleave="$el.style.opacity = ${img.opacity}" `
      if (this.params.attr.noAnimate) {
        animate = ''
      } else {
        img.style = img.style ?? {}
        img.style.opacity = img.opacity
      }
      this.addBlock('reactive', `
        async ${prefix}Builder () {
          const body = ['<c:a href="#" @click="wbs.appLauncher(\\'darkmode language\\', \\'${this.params.attr.menu}\\', { theme: \\'${this.component.theme.name}\\', iconset: \\'${this.component.iconset.name}\\' })">']
          body.push('<c:img ${stringifyAttribs(img)} ${animate} />')
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
