/* global _ */

class ControlButtons { // eslint-disable-line no-unused-vars
  constructor (options = {}) {
    this.items = options.items ?? []
  }

  createControl () {
    this.container = document.createElement('div')
    this.container.classList.add('maplibregl-ctrl', 'maplibregl-ctrl-group', 'maplibregl-ctrl-buttons')
    for (const b of this.items) {
      const btn = document.createElement('button')
      btn.setAttribute('type', 'button')
      for (const attr in b.attrib ?? {}) {
        btn.setAttribute(_.kebabCase(attr), b.attrib[attr])
      }
      if (!_.get(b, 'attrib.dataBsTarget')) {
        if (b.fn) {
          let [ns, method] = b.fn.split('.')
          if (!method) {
            method = ns
            ns = 'window'
          }
          const params = b.fnParams ? `'${b.fnParams}'` : ''
          btn.setAttribute('onclick', `${ns}['${method}'](${params})`)
        } else if (b.url && b.newTab) btn.setAttribute('onclick', 'window.open(\'' + b.url + '\', \'_blank\')')
        else if (b.url) btn.setAttribute('onclick', 'location.href=\'' + b.url + '\'')
      }
      if (b.imageUrl) {
        const img = document.createElement('img')
        img.src = b.imageUrl
        btn.appendChild(img)
      } else if (b.icon) {
        const icon = document.createElement('i')
        icon.classList.add(b.icon)
        btn.appendChild(icon)
      }
      this.container.appendChild(btn)
    }
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
