export const opts = {
  boolTrue: ['antialias', 'hash', 'maplibreLogo'],
  boolFalse: ['noBoxZoom', 'noDoubleClickZoom', 'noDoubleClickZoom', 'noDragPan', 'noDragRotate',
    'noInteractive', 'noKeyboard', 'noPitchWithRotate', 'noRenderWorldCopies', 'noScrollZoom',
    'noTouchPitch', 'noTouchZoomRotate', 'noTrackResize', 'noValidateStyle'],
  number: ['zoom', 'bearing', 'bearingSnap', 'clickTolerance', 'fadeDuration', 'maxPitch',
    'maxZoom', 'minPitch', 'minZoom', 'pitch'],
  array: ['center', 'bounds', 'maxBounds'],
  string: [],
  transform: {
    // mapStyle: 'style'
  }
}

export function cmpMapOptions (params, mapOpts) {
  const { camelCase } = this.plugin.app.bajo.lib._
  const { routePath } = this.plugin.app.waibu
  const { attrToArray } = this.plugin.app.waibuMpa

  mapOpts.container = params.attr.id
  for (const key in params.attr) {
    const val = params.attr[key]
    if (val === true) {
      if (opts.boolTrue.includes(key)) mapOpts[key] = true
      if (opts.boolFalse.includes(key)) mapOpts[camelCase(key.slice(2))] = false
    } else {
      if (key === 'mapStyle') mapOpts.style = routePath(val)
      else if (opts.number.includes(key)) mapOpts[key] = Number(val)
      else if (opts.array.includes(key)) mapOpts[key] = attrToArray(val).map(v => Number(v))
      else if (opts.string.includes(key)) mapOpts[key] = val
      else if (opts.transform[key]) mapOpts[opts.transform[key]] = val
    }
  }
}
