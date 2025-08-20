import wmapsBase from '../wmaps-base.js'

async function script () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsScript extends WmapsBase {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const type = this.params.attr.type ?? 'run'
      this.addBlock(type, this.params.html)
      this.params.html = this.writeBlock()
    }
  }
}

export default script
