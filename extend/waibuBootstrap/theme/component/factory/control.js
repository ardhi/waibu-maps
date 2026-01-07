import wmapsBase from '../wmaps-base.js'

async function control () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsControl extends WmapsBase {
    constructor (options) {
      super(options)
      this.ctrlPos = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
      this.params.noTag = true
    }

    build = async () => {
      const { jsonStringify } = this.app.waibuMpa
      const { $ } = this.component
      const html = []
      $(`<div>${this.params.html}</div>`).find('.childmap').each(function () {
        html.push($(this).prop('outerHTML'))
      })
      this.readBlock()
      // persisting
      if (this.params.attr.persist) {
        this.component.addScriptBlock('alpineInitializing', `
          const controls = ${jsonStringify(WmapsBase.controls, true)}
          const defOffs = ['scale-control', 'geolocate-control', 'czbp']
          const ctrls = {}
          for (const c of controls) {
            ctrls[_.camelCase(c)] = Alpine.$persist(!defOffs.includes(c)).as(_.camelCase('mapCtrl ' + c))
          }
          Alpine.store('mapCtrl', ctrls)
        `)
      }
      this.params.html = this.writeBlock()
      if (html.length > 0) this.params.html += '\n' + html.join('\n')
    }
  }
}

export default control
