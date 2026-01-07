class ControlCenterPosition { // eslint-disable-line no-unused-vars
  createControl () {
    this.container = document.createElement('div')
    this.container.classList.add('maplibregl-ctrl')
    this.container.classList.add('maplibregl-ctrl-centerpos')
    this.icon = document.createElement('div')
  }

  onAdd (map) {
    this.map = map
    this.createControl()
    return this.container
  }

  onRemove () {
    this.container.parentNode.removeChild(this.container)
    this.map = undefined
  }
}
