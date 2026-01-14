import control from './control.js'
const prefix = 'cgr'

async function controlGroup () {
  const WmapsControl = await control.call(this)

  return class WmapsControlGroup extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { generateId } = this.app.lib.aneka
      const { jsonStringify, minify } = this.app.waibuMpa
      const { isString, trim } = this.app.lib._
      const { $ } = this.component
      const tpl = await this.component.buildSentence(this.loadTemplate('waibuMaps.partial:/menu.html', { escape: true }), {}, { minify: true })
      const id = isString(this.params.attr.id) ? this.params.attr.id : generateId('alpha')
      const opts = {}
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      opts.class = prefix + ' maplibregl-ctrl-group'
      const items = []
      const params = []
      $(`<div>${this.params.html}</div>`).find('button[class^="control-group-"]').each(function () {
        const vars = $(this).find('.var').length
        if (vars > 0) {
          params.push({
            image: $(this).find('.var .image').text() ?? '',
            icon: $(this).find('.var .icon').text() ?? '',
            html: $(this).find('.var .html').prop('innerHTML') ?? '',
            wrapper: $(this).html('{%= cmp %}').prop('outerHTML') ?? ''
          })
        } else {
          const item = trim($(this).removeAttr('octag').prop('outerHTML'))
          items.push(item)
        }
      })
      for (const param of params) {
        for (const type of ['html', 'wrapper']) {
          param[type] = await minify(param[type])
        }
      }
      for (const idx in items) {
        items[idx] = await minify(items[idx])
      }
      this.readBlock()
      this.addBlock('reactive', [`
        ${prefix}MenuTpl: _.template('${tpl}')
      `, `
        async ${prefix}Trigger (evt) {
          const el = evt.target.closest('button')
          if (!el) return
          const menu = el.querySelector('.dropdown-menu')
          if (!menu) return
          if (menu.children.length > 0) return
          const setting = el.getAttribute('setting') ? ('setting="' + el.getAttribute('setting') + '"') : ''
          await wmpa.addComponent('<c:' + el.getAttribute('component') + ' ' + setting + ' />', menu, null, true, { theme: '${this.component.theme.name}', iconset: '${this.component.iconset.name}' })
        }
      `, `
        async ${prefix}Builder (params) {
          const items = []
          for (const param of params) {
            const args = {
              click: '',
              image: param.image,
              icon: param.icon,
              html: param.html
            }
            if (param.wrapper.includes('component=')) {
              args.html = ''
              args.click = '${prefix}Trigger'
            }
            const wfn = _.template(param.wrapper)
            const inner = this.${prefix}MenuTpl(args)
            const outer = wfn({ cmp: inner })
            items.push(wmpa.createComponentFromHtml(outer))
          }
          return items
        }
      `])
      this.addBlock('control', {
        id,
        group: true,
        content: `
          await wmaps.createControl(_.merge(${jsonStringify(opts, true)}, { builder: this.${prefix}Builder, params: ${jsonStringify(params, true)} }))
        `
      })

      this.params.html = this.writeBlock()
    }
  }
}

export default controlGroup
