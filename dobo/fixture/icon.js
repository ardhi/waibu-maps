import path from 'path'

async function icon () {
  const { map, camelCase } = this.lib._
  if (!this.app.waibuStatic) return []
  const icons = await this.app.waibuStatic.listResources(`${this.name}.asset:/icon`)
  return map(icons, icon => {
    const base = path.basename(icon.href)
    const dir = path.dirname(icon.href)
    const name = camelCase(`${path.basename(dir)} ${base}`)
    return {
      id: icon.href,
      name
    }
  })
}

export default icon
