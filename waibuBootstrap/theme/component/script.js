import { scripts, css } from './map.js'
const types = ['init', 'run']

const script = {
  scripts,
  css,
  handler: async function (params = {}) {
    params.noTag = true
    params.attr.type = types.includes(params.attr.type) ? params.attr.type : 'run'
    params.html = `<script type="${params.attr.type}">
      ${params.html}
    </script>`
  }
}

export default script
