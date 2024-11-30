import wmapsBase from '../wmaps-base.js'

async function controlButtonsItem (component) {
  const WmapsBase = await wmapsBase(component)

  return class WmapsControlButtonsItem extends WmapsBase {
    constructor (options) {
      super(options)
      this.params.tag = 'div'
    }
  }
}

export default controlButtonsItem
