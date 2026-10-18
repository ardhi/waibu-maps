async function newstickerDetails () {
  const { importModule } = this.app.bajo
  const smapsBase = await importModule('sumbaMaps:/extend/waibuBootstrap/theme/component/smaps-base.js')
  const SmapsBase = await smapsBase.call(this)

  return class WmapsNewstickerDetails extends SmapsBase {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { without, flatten, isEmpty } = this.app.lib._
      const tpl = this.loadTemplate('waibuMaps.partial:/newsticker.html')
      const args = {
        groups: [{
          name: 'General',
          show: true,
          items: ['name', 'loCode', 'lat', 'lng']
        }, {
          name: 'Person in Charge',
          items: ['picName', 'picRole', 'picPhone', 'picEmail']
        }, {
          name: 'Address',
          items: ['address1', 'address2', 'city', 'zipCode', 'provinceState', 'country', 'phone', 'website']
        }, {
          name: 'World Port Index',
          items: ['wpiIndex', 'wpiRegion', 'wpiPub', 'chart']
        }]
      }
      const props = flatten(args.groups.map(item => item.items))
      const items = without(model.properties.map(item => item.name), ...props)
      if (!isEmpty(items)) args.groups.push({ name: 'Attributes', items })
      const html = await this.component.buildSentence(tpl, args)
      this.params.html = html
    }
  }
}

export default newstickerDetails
