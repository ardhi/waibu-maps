import wmapsBase from '../wmaps-base.js'
const prefix = 'cgrb'

async function controlGroupButton () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsControlGroupButton extends WmapsBase {
    constructor (options) {
      super(options)
      this.component.normalizeAttr(this.params, { tag: 'button', cls: `control-group-button ${prefix}`, autoId: true })
    }
  }
}

export default controlGroupButton
