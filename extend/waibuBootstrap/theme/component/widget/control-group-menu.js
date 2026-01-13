import wmapsBase from '../wmaps-base.js'
const prefix = 'cgrm'

async function controlGroupMenu () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsControlGroupMenu extends WmapsBase {
    constructor (options) {
      super(options)
      this.component.normalizeAttr(this.params, { tag: 'button', cls: `control-group-menu ${prefix}`, autoId: true })
      this.params.attr.class.push('dropdown', 'dropstart')
    }

    build = async () => {
      const { $ } = this.component
      const { fastGlob } = this.app.lib
      const { isString } = this.app.lib._
      const { routePath } = this.app.waibu
      let icon
      let image = ''
      const items = []
      $(`<div>${this.params.html}</div>`).children().each(function () {
        if (this.name === 'i') icon = $(this).prop('class')
        else items.push($(this).prop('outerHTML'))
      })
      if (isString(this.params.attr.image)) {
        if (this.params.attr.image === 'logo') {
          let logo = 'waibu'
          const files = await fastGlob(`${this.app.main.dir.pkg}/extend/bajo/logo.*`)
          if (files.length > 0) logo = 'main'
          image = routePath(`waibuMpa:/logo/${logo}`)
        } else image = routePath(this.params.attr.image)
      }
      this.params.html = `
        <div class="var">
          <div class="icon">${icon}</div>
          <div class="image">${image}</div>
          <div class="html">${items.join('\n')}</div>
        </div>
      `
    }
  }
}

export default controlGroupMenu
