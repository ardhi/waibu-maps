import { scripts, css, scriptTypes } from './map.js'

const script = {
  scripts,
  css,
  handler: async function (params = {}) {
    params.noTag = true
    params.attr.type = scriptTypes.includes(params.attr.type) ? params.attr.type : 'run'
    params.html = `<script type="${params.attr.type}">
      ${params.html}
    </script>`
  }
}

export default script
