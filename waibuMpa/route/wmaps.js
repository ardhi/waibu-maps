import { glyphUrl } from './default-style.js'

const wmaps = {
  url: '/wmaps.js',
  method: 'GET',
  handler: async function (req, reply) {
    const { get } = this.lib._
    const { routePath } = this.app.waibu
    const glyphs = routePath(glyphUrl, { uriEncoded: false })
    const assetPrefix = get(this, 'app.waibuStatic.config.waibu.prefix')
    const iconPrefix = `/${assetPrefix}/${this.config.waibu.prefix}/icon`
    return await reply.view('waibuMaps.template:/wmaps.js', { glyphs, iconPrefix })
  }
}

export default wmaps
