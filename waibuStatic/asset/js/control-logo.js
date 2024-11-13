class ControlLogo { // eslint-disable-line no-unused-vars
  constructor (options = {}) {
    this.url = options.url || ''
    this.logo = options.logo || ''
    this.desc = options.text || ''
  }

  createControl () {
    this.container = document.createElement(this.url === '' ? 'div' : 'a')
    this.container.classList.add('maplibregl-ctrl', 'maplibregl-ctrl-logo')
    this.image = document.createElement('img')
    this.image.src = this.logo
    this.text = document.createElement('div')
    this.text.innerHTML = this.desc
    this.text.style.display = 'none'
    this.container.appendChild(this.image)
    this.container.appendChild(this.text)
    if (this.url !== '') {
      this.container.setAttribute('href', this.url)
      this.container.setAttribute('target', '_blank')
    }
  }

  onAdd (map) {
    this.map = map
    this.createControl()
    this.container.addEventListener('mouseenter', this.onMouseEnter.bind(this))
    this.container.addEventListener('mouseleave', this.onMouseLeave.bind(this))
    this.onMouseLeave()
    return this.container
  }

  onRemove () {
    this.container.removeEventListener('mouseenter', this.onMouseEnter.bind(this))
    this.container.removeEventListener('mouseleave', this.onMouseLeave.bind(this))
    this.container.parentNode.removeChild(this.container)
    this.map = undefined
  }

  onMouseEnter (evt) {
    this.image.style.opacity = 0.8
    this.text.style.display = 'block'
  }

  onMouseLeave (evt) {
    this.text.style.display = 'none'
    this.image.style.opacity = 0.3
  }
}
