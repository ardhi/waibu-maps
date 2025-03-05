import wmapsBase from '../wmaps-base.js'

async function script () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsScript extends WmapsBase {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const type = WmapsBase.blockTypes.includes(this.params.attr.type) ? this.params.attr.type : 'run'
      this.block[type].push(this.params.html)
      this.params.html = this.writeBlock()
    }
  }
}

export default script
