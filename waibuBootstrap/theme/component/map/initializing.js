async function initializing (params = {}) {
  const { groupAttrs } = this.plugin.app.waibuMpa

  const group = groupAttrs(params.attr, ['persist', 'control'])
  const initializing = []
  if (group.persist.mapLayer) {
    initializing.push(`Alpine.store('mapLayer', {
      basemap: Alpine.$persist('osm-mapnik').as('mapLayerBasemap'),
      overlays: Alpine.$persist([]).as('mapLayerOverlays')
    })`)
  }
  if (group.persist.mapInfo) {
    initializing.push(`Alpine.store('mapInfo', {
        center: Alpine.$persist(null).as('mapInfoCenter'),
        zoom: Alpine.$persist(null).as('mapInfoZoom'),
        bearing: Alpine.$persist(null).as('mapInfoBearing'),
        pitch: Alpine.$persist(null).as('mapInfoPitch')
      })`)
  }
  if (group.persist.mapSetting) {
    initializing.push(`Alpine.store('mapSetting', {
      degree: Alpine.$persist('DMS').as('mapSettingDegree'),
      measure: Alpine.$persist('nautical').as('mapSettingMeasure'),
      zoomScrollCenter: Alpine.$persist(false).as('mapSettingZoomScrollCenter'),
      noMapRotate: Alpine.$persist(false).as('mapSettingNoMapRotate')
    })`)
  }
  if (group.persist.mapControl) {
    initializing.push(`Alpine.store('mapControl', {
      attrib: Alpine.$persist(true).as('mapControlAttrib'),
      centerPos: Alpine.$persist(true).as('mapControlCenterPos'),
      fullscreen: Alpine.$persist(true).as('mapControlFullscreen'),
      mousePos: Alpine.$persist(true).as('mapControlMousePos'),
      nav: Alpine.$persist(true).as('mapControlNav'),
      scale: Alpine.$persist(true).as('mapControlScale'),
      geolocate: Alpine.$persist(true).as('mapControlGeolocate'),
      ruler: Alpine.$persist(true).as('mapControlRuler'),
    })`)
  }
  return initializing
}

export default initializing
