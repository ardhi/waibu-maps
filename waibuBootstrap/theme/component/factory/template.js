import wmapsBase from '../wmaps-base.js'

async function template (component) {
  const WmapsBase = await wmapsBase(component)

  return class WmapsTemplate extends WmapsBase {
  }
}

export default template
