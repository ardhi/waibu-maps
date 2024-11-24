/* global _ */

class ControlButtons { // eslint-disable-line no-unused-vars
  constructor (options = {}) {
    this.position = options.position ?? 'top-left'
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
      if (b.imageUrl) {
        const img = document.createElement('img')
        img.src = b.imageUrl
        btn.appendChild(img)
      } else if (b.icon) {
        const icon = document.createElement('i')
        icon.classList.add(b.icon)
        btn.appendChild(icon)
      }
      if (b.popup) {
        const wrapper = document.createElement('button')
        wrapper.setAttribute('id', b.id)
        this.buildOnClick(wrapper, b)
        wrapper.classList.add('dropdown')
        const pos = this.position.split('-')[1] === 'right' ? 'start' : 'end'
        wrapper.classList.add('drop' + pos)
        btn.setAttribute('data-bs-toggle', 'dropdown')
        btn.setAttribute('data-bs-auto-close', 'outside')
        const menu = document.createElement('div')
        menu.classList.add('dropdown-menu')
        wrapper.appendChild(btn)
        wrapper.appendChild(menu)
        this.container.appendChild(wrapper)
      } else if (!_.get(b, 'attrib.dataBsTarget')) {
        if (b.fn) this.buildOnClick(btn, b)
        else if (b.url && b.newTab) btn.setAttribute('onclick', 'window.open(\'' + b.url + '\', \'_blank\')')
        else if (b.url) btn.setAttribute('onclick', 'location.href=\'' + b.url + '\'')
        this.container.appendChild(btn)
      }
    }
  }

  buildOnClick (btn, opts) {
    let [ns, method] = opts.fn.split('.')
    if (!method) {
      method = ns
      ns = 'window'
    }
    const params = opts.fnParams ? `'${opts.fnParams}'` : ''
    btn.setAttribute('onclick', `${ns}['${method}'](${params})`)
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
