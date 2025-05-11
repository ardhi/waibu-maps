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
      const { $ } = this.component
      const html = []
      $(`<div>${this.params.html}</div>`).find('.childmap').each(function () {
        html.push($(this).prop('outerHTML'))
      })
      this.readBlock()
      // persisting
      if (this.params.attr.persist) {
        this.component.addScriptBlock('alpineInitializing', `
          Alpine.store('mapControl', {
            attrib: Alpine.$persist(true).as('mapControlAttrib'),
            centerPos: Alpine.$persist(true).as('mapControlCenterPos'),
            fullscreen: Alpine.$persist(false).as('mapControlFullscreen'),
            mousePos: Alpine.$persist(false).as('mapControlMousePos'),
            nav: Alpine.$persist(true).as('mapControlNav'),
            // globe: Alpine.$persist(true).as('mapControlGlobe'),
            scale: Alpine.$persist(false).as('mapControlScale'),
            geolocate: Alpine.$persist(false).as('mapControlGeolocate'),
            ruler: Alpine.$persist(true).as('mapControlRuler'),
            search: Alpine.$persist(true).as('mapControlSearch')
          })
        `)
      }
      this.params.html = this.writeBlock()
      if (html.length > 0) this.params.html += '\n' + html.join('\n')
    }
  }
}

export default control
