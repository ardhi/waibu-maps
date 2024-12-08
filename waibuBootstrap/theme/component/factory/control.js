import wmapsBase from '../wmaps-base.js'

async function control () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsControl extends WmapsBase {
    constructor (options) {
      super(options)
      this.ctrlPos = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
      this.params.noTag = true
    }

    async build () {
      const { $ } = this.component
      const html = []
      $(`<div>${this.params.html}</div>`).find('.childmap').each(function () {
        html.push($(this).prop('outerHTML'))
      })
      this.readBlock('control')
      // persisting
      if (this.params.attr.persist) {
        this.block.initializing.push(`Alpine.store('mapControl', {
          attrib: Alpine.$persist(true).as('mapControlAttrib'),
          centerPos: Alpine.$persist(true).as('mapControlCenterPos'),
          fullscreen: Alpine.$persist(true).as('mapControlFullscreen'),
          mousePos: Alpine.$persist(true).as('mapControlMousePos'),
          nav: Alpine.$persist(true).as('mapControlNav'),
          scale: Alpine.$persist(true).as('mapControlScale'),
          geolocate: Alpine.$persist(true).as('mapControlGeolocate'),
          ruler: Alpine.$persist(true).as('mapControlRuler'),
        })`)
      }
      this.params.html = this.writeBlock()
      if (html.length > 0) this.params.html += '\n' + html.join('\n')
    }
  }
}

export default control
