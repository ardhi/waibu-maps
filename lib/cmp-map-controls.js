const items = ['navigation', 'fullscreen', 'geolocate', 'scale', 'attribution']

function cmpMapControls (params) {
  const { isEmpty, trim } = this.plugin.app.bajo.lib._
  const initScripts = []
  for (const item of items) {
    const script = this.$(`<div>${params.html}</div>`).find(`script[control-${item}]`).prop('innerHTML')
    if (!isEmpty(script)) initScripts.push(script)
  }
  return initScripts.map(item => trim(item))
}

export default cmpMapControls
