/* global maplibregl */

function defaultLabelFormat ({ lng, lat }) {
  return `Lng: ${lng}, Lat: ${lat}`
}

class ControlMousePosition { // eslint-disable-line no-unused-vars
  constructor (options) {
    this.digits = options.digits || 5
    this.trackCenter = options.trackCenter || false
    this.labelFormat = options.labelFormat || defaultLabelFormat
    this.coord = new maplibregl.LngLat(0, 0)
  }

  createControl () {
    this.container = document.createElement('div')
    this.container.classList.add('maplibregl-ctrl', 'maplibregl-ctrl-mouse-position')
    this.panel = document.createElement('div')
    if (this.trackCenter) this.onMouseMove()
    else this.panel.innerHTML = this.labelFormat({ lng: '', lat: '', lngLat: null, map: this.map })
    this.container.appendChild(this.panel)
  }

  onMouseMove (evt) {
    if (this.trackCenter) this.coord = this.map.getCenter().wrap()
    else this.coord = evt.lngLat.wrap()
    const lng = (this.coord.lng < 0 ? '-' : '') + Math.abs(this.coord.lng).toFixed(this.digits)
    const lat = (this.coord.lat < 0 ? '-' : '') + Math.abs(this.coord.lat).toFixed(this.digits)
    this.panel.innerHTML = this.labelFormat({ lng, lat, lngLat: this.coord, map: this.map })
  }

  onAdd (map) {
    this.map = map
    this.createControl()
    if (this.trackCenter) this.map.on('move', this.onMouseMove.bind(this))
    else this.map.on('mousemove', this.onMouseMove.bind(this))
    return this.container
  }

  onRemove () {
    if (this.trackCenter) this.map.off('move', this.onMouseMove.bind(this))
    else this.map.off('mousemove', this.onMouseMove.bind(this))
    this.container.parentNode.removeChild(this.container)
    this.map = undefined
  }
}
