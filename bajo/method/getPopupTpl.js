function getPopupTpl (html, $) {
  const { trim } = this.app.bajo.lib._
  const tpl = $(`<div>${html}</div>`).find('wmaps-popup-template').prop('innerHTML')
  return trim(tpl ?? '')
}

export default getPopupTpl
