import { glyphUrl } from './default-style.js'

const wmaps = {
  url: '/wmaps.js',
  method: 'GET',
  handler: async function (req, reply) {
    const { routePath } = this.app.waibu
    const glyphs = routePath(glyphUrl)
    return reply.view('waibuMaps.template:/wmaps.js', { glyphs })
  }
}

export default wmaps
