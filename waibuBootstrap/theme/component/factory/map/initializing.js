async function initializing (params = {}) {
  const { groupAttrs } = this.plugin.app.waibuMpa

  const group = groupAttrs(params.attr, ['persist'])
  const initializing = []
  if (group.persist && group.persist.mapLayer) {
    initializing.push(`Alpine.store('mapLayer', {
      basemap: Alpine.$persist('osm-mapnik').as('mapLayerBasemap'),
      overlays: Alpine.$persist([]).as('mapLayerOverlays')
    })`)
  }
  if (group.persist && group.persist.mapInfo) {
    initializing.push(`Alpine.store('mapInfo', {
        center: Alpine.$persist(null).as('mapInfoCenter'),
        zoom: Alpine.$persist(null).as('mapInfoZoom'),
        bearing: Alpine.$persist(null).as('mapInfoBearing'),
        pitch: Alpine.$persist(null).as('mapInfoPitch')
      })`)
  }
  if (group.persist && group.persist.mapSetting) {
    initializing.push(`Alpine.store('mapSetting', {
      degree: Alpine.$persist('DMS').as('mapSettingDegree'),
      measure: Alpine.$persist('nautical').as('mapSettingMeasure'),
      zoomScrollCenter: Alpine.$persist(false).as('mapSettingZoomScrollCenter'),
      noMapRotate: Alpine.$persist(false).as('mapSettingNoMapRotate')
    })`)
  }
  return initializing
}

export default initializing
