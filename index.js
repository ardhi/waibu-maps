/**
 * Plugin factory
 *
 * @param {string} pkgName - NPM package name
 * @returns {class}
 */
async function factory (pkgName) {
  const me = this

  /**
   * WaibuMaps class
   *
   * @class
   */
  class WaibuMaps extends this.app.baseClass.Base {
    static alias = 'wmaps'
    static dependencies = ['bajo-spatial']

    constructor () {
      super(pkgName, me.app)
      this.config = {
        waibu: {
          prefix: 'wmaps'
        },
        mapOptions: {
          center: [106.8229, -6.1944],
          zoom: 7
        },
        waibuAdmin: {
          modelDisabled: []
        }
      }
    }

    init = async () => {
      if (this.app.sumbaMaps) this.config.waibuAdmin.modelDisabled.push('icon')
    }
  }

  return WaibuMaps
}

export default factory
