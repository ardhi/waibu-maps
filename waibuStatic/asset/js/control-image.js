/* global _ */

class ControlImage { // eslint-disable-line no-unused-vars
  constructor (options = {}) {
    this.options = options
    this.options.attrib = this.options.attrib ?? {}
  }

  createControl () {
    this.container = document.createElement(this.options.url === '' ? 'div' : 'a')
    this.container.classList.add('maplibregl-ctrl', 'maplibregl-ctrl-image')
    this.image = document.createElement('img')
    this.image.src = this.options.imageUrl
    this.image.style.cssText = this.options.imageStyle
    if (this.options.imageWidth) this.image.setAttribute('width', this.options.imageWidth)
    if (this.options.imageHeight) this.image.setAttribute('height', this.options.imageHeight)
    this.text = document.createElement('div')
    this.text.innerHTML = this.options.desc ?? ''
    this.text.style.display = 'none'
    this.container.appendChild(this.image)
    this.container.appendChild(this.text)
    for (const attr in this.options.attrib) {
      this.container.setAttribute(_.kebabCase(attr), this.options.attrib[attr])
    }
    if (this.options.fn) {
      let [ns, method] = this.options.fn.split('.')
      if (!method) {
        method = ns
        ns = 'window'
      }
      const params = this.options.fnParams ? `'${this.options.fnParams}'` : ''
      this.container.setAttribute('onclick', `${ns}['${method}'](${params})`)
    } else if (this.options.url && this.options.newTab) this.container.setAttribute('onclick', 'window.open(\'' + this.options.url + '\', \'_blank\')')
    else if (this.options.url) this.container.setAttribute('onclick', 'location.href=\'' + this.options.url + '\'')
    else this.container.setAttribute('href', '#')
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
