import control from './control.js'
const prefix = 'cgr'

async function controlGroup () {
  const WmapsControl = await control.call(this)

  return class WmapsControlGroup extends WmapsControl {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      const { generateId } = this.plugin.app.bajo
      const { importPkg } = this.plugin.app.bajo
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { isString, isEmpty, trim } = this.plugin.app.bajo.lib._
      const minifier = await importPkg('waibuMpa:html-minifier-terser')
      const { $ } = this.component
      const id = isString(this.params.attr.id) ? this.params.attr.id : generateId('alpha')
      const opts = {}
      opts.position = this.ctrlPos.includes(this.params.attr.position) ? this.params.attr.position : 'top-left'
      opts.class = prefix + ' maplibregl-ctrl-group'
      const items = []
      const params = {}
      $(`<div>${this.params.html}</div>`).find('button[class^="control-group-"]').each(function () {
        if ($(this).find('.var')) {
          const key = this.attribs.class.split(' ')[1]
          params[key] = params[key] ?? { id: [], icon: [], html: [], cmp: [], tpl: null, wrapper: [] }
          params[key].cmp.push($(this).find('.var .cmp').text())
          params[key].icon.push($(this).find('.var .icon').text())
          params[key].html.push($(this).find('.var .html').prop('innerHTML'))
          params[key].tpl = $(this).find('.var .tpl').prop('innerHTML')
          params[key].id.push($(this).prop('id'))
          params[key].wrapper.push($(this).html('{%= cmp %}').prop('outerHTML'))
        } else {
          const item = trim($(this).removeAttr('octag').prop('outerHTML'))
          items.push(item)
        }
      })
      for (const idx in params) {
        params[idx].tpl = await minifier.minify(params[idx].tpl, {
          collapseWhitespace: true
        })
        for (const type of ['html', 'wrapper']) {
          for (const i in params[idx][type]) {
            if (isEmpty(params[idx][type][i])) continue
            params[idx][type][i] = await minifier.minify(params[idx][type][i], {
              collapseWhitespace: true
            })
          }
        }
      }
      for (const idx in items) {
        items[idx] = await minifier.minify(items[idx], {
          collapseWhitespace: true
        })
      }
      // if (_.isFunction(this[items[idx]])) items[idx] = await this[items[idx]]()

      this.block.reactive.push(`
        async ${prefix}Trigger (evt) {
          const el = evt.target.closest('button')
          if (!el) return
          const menu = el.querySelector('.dropdown-menu')
          if (!menu) return
          if (menu.children.length > 0) return
          await wmpa.addComponent('<c:' + el.getAttribute('component') + '/>', menu)
        }
      `, `
        async ${prefix}Builder (params) {
          const items = []
          for (const type in params) {
            const fn = _.template(params[type].tpl)
            for (const idx in params[type].html) {
              let wrapper = params[type].wrapper[idx]
              const id = params[type].id[idx]
              const cmp = params[type].cmp[idx]
              const args = {
                click: '',
                icon: params[type].icon[idx],
                html: params[type].html[idx]
              }
              if (!_.isEmpty(cmp)) {
                args.html = ''
                args.click = '${prefix}Trigger'
              }
              const wfn = _.template(wrapper)
              const inner = fn(args)
              const outer = wfn({ cmp: inner })
              items.push(wmpa.createComponentFromHtml(outer))
            }
          }
          return items
        }
      `)
      this.block.control.push({
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
