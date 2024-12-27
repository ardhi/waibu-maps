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

    createMenuTpl () {
      return `
        <c:div dim="height:100" flex="align-items:center justify-content:center" data-bs-toggle="dropdown" data-bs-auto-close="outside">
          <c:icon oname="{%= icon %}" @click="{%= click %}" />
        </c:div>
        <c:div class="dropdown-menu">
          {%= html %}
        </c:div>
      `
    }

    async build () {
      const { $ } = this.component
      let icon
      const items = []
      $(`<div>${this.params.html}</div>`).children().each(function () {
        if (this.name === 'i') icon = $(this).prop('class')
        else items.push($(this).prop('outerHTML'))
      })
      const menuTpl = await this.component.buildSentence(this.createMenuTpl(icon, items))
      this.params.html = `
        <div class="var">
          <div class="tpl">${menuTpl}</div>
          <div class="icon">${icon}</div>
          <div class="cmp">${this.params.attr.component ?? ''}</div>
          <div class="html">${items.join('\n')}</div>
        </div>
      `
    }
  }
}

export default controlGroupMenu
