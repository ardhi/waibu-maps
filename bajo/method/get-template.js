function getTemplate (html, $, type = 'popup') {
  const { trim } = this.app.bajo.lib._
  const tpl = $(`<div>${html}</div>`).find(`wmaps-template[type="${type}"]`).prop('innerHTML')
  return trim(tpl ?? '')
}

export default getTemplate
