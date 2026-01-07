export const glyphUrl = 'waibuMaps.asset:/font/noto_sans_regular.pbf?s={fontstack}&r={range}'

const wmaps = {
  url: '/default-style.json',
  method: 'GET',
  handler: async function (req, reply) {
    const { routePath } = this.app.waibu
    const glyphs = routePath(glyphUrl, { uriEncoded: false })
    return await reply.view('waibuMaps.template:/default-style.json', { glyphs })
  }
}

export default wmaps
