import wmapsBase from '../wmaps-base.js'

async function template () {
  const WmapsBase = await wmapsBase.call(this)

  return class WmapsTemplate extends WmapsBase {
  }
}

export default template
