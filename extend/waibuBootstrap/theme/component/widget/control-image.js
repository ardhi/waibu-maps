import control from './control.js'
const prefix = 'cimg'

async function controlImage () {
  const WmapsControl = await control.call(this)

  return class WmapsControlImage extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { routePath } = this.app.waibu
      const { jsonStringify, groupAttrs, stringifyAttribs } = this.app.waibuMpa
      const { isString, isEmpty } = this.app.lib._
      const opts = {}
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      const group = groupAttrs(this.params.attr, ['img'])
      const img = group.img ?? {}
      opts.class = prefix + (isEmpty(img.class) ? '' : (' ' + img.class.join(' ')))
      const url = isString(this.params.attr.url) ? routePath(this.params.attr.url) : null
      let animate = '@mouseenter="$el.style.opacity = 1" @mouseleave="$el.style.opacity = 0.3" '
      if (this.params.attr.noAnimate) animate = ''
      this.addBlock('reactive', `
        async ${prefix}Builder () {
          const body = ['<c:${url ? `a url="${url}"` : 'div'}><c:img ${stringifyAttribs(img)} ']
          body.push('${animate}')
          body.push('/></c:${url ? 'a' : 'div'}>')
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

export default controlImage
