import wmapsBase from '../wmaps-base.js'

import { scriptTypes } from './map.js'

async function script () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsScript extends WmapsBase {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    async build () {
      this.params.attr.type = scriptTypes.includes(this.params.attr.type) ? this.params.attr.type : 'run'
      this.params.html = `<script type="${this.params.attr.type}">
        ${this.params.html}
      </script>`
    }
  }
}

export default script
