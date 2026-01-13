import wmapsBase from '../wmaps-base.js'

async function controlButtonsItem () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsControlButtonsItem extends WmapsBase {
    constructor (options) {
      super(options)
      this.params.tag = 'div'
    }
  }
}

export default controlButtonsItem
