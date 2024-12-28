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

    async build () {
      const { $ } = this.component
      let icon
      const items = []
      $(`<div>${this.params.html}</div>`).children().each(function () {
        if (this.name === 'i') icon = $(this).prop('class')
        else items.push($(this).prop('outerHTML'))
      })
      this.params.html = `
        <div class="var">
          <div class="icon">${icon}</div>
          <div class="html">${items.join('\n')}</div>
        </div>
      `
    }
  }
}

export default controlGroupMenu
