export const opts = {
  boolTrue: ['antialias', 'hash', 'maplibreLogo'],
  boolFalse: ['noBoxZoom', 'noDoubleClickZoom', 'noDoubleClickZoom', 'noDragPan', 'noDragRotate',
    'noInteractive', 'noKeyboard', 'noPitchWithRotate', 'noRenderWorldCopies', 'noScrollZoom',
    'noTouchPitch', 'noTouchZoomRotate', 'noTrackResize', 'noValidateStyle'],
  number: ['zoom', 'bearing', 'bearingSnap', 'clickTolerance', 'fadeDuration', 'maxPitch',
    'maxZoom', 'minPitch', 'minZoom', 'pitch'],
  array: ['center', 'bounds', 'maxBounds'],
  string: ['basemap', 'attribution']
}

async function options (params = {}) {
  const { camelCase, isString } = this.app.lib._
  const { attrToArray } = this.plugin.app.waibuMpa
  const { routePath } = this.plugin.app.waibu
  const mapOpts = this.plugin.app.waibuMaps.getConfig().mapOptions
  mapOpts.container = params.attr.id
  const { $ } = this.component
  for (const key in params.attr) {
    const val = params.attr[key]
    if (val === true) {
      if (opts.boolTrue.includes(key)) mapOpts[key] = true
      if (opts.boolFalse.includes(key)) mapOpts[camelCase(key.slice(2))] = false
    } else {
      if (opts.number.includes(key)) mapOpts[key] = Number(val)
      else if (opts.array.includes(key)) mapOpts[key] = attrToArray(val).map(v => Number(v))
      else if (opts.string.includes(key)) mapOpts[key] = val
    }
  }
  if (params.attr.noBasemap) {
    delete mapOpts.style
  } else {
    if (isString(params.attr.basemap)) mapOpts.style = params.attr.basemap
    else mapOpts.style = 'waibuMaps:/default-style.json'
    mapOpts.style = routePath(mapOpts.style)
  }
  mapOpts.attributionControl = true
  $(`<div>${params.html}</div>`).find('script[block="control"]:contains(\'AttributionControl\')').each(function () {
    mapOpts.attributionControl = false
  })
  return mapOpts
}

export default options
