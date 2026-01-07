import path from 'path'

async function icon () {
  const { map } = this.app.lib._
  if (!this.app.waibuStatic) return []
  const icons = await this.app.waibuStatic.listResources(`${this.ns}.asset:/icon`)
  return map(icons, icon => {
    const base = path.basename(icon.href)
    const dir = path.dirname(icon.href)
    const id = `icon:/${path.basename(dir)}/${base}`
    return {
      id,
      url: icon.href
    }
  })
}

export default icon
