async function factory (pkgName) {
  const me = this

  return class WaibuMaps extends this.lib.BajoPlugin {
    constructor () {
      super(pkgName, me.app)
      this.alias = 'wmaps'
      this.dependencies = ['bajo-spatial']
      this.config = {
        waibu: {
          prefix: 'wmaps'
        },
        mapOptions: {
          center: [106.8229, -6.1944],
          zoom: 7
        }
      }
    }
  }
}

export default factory
