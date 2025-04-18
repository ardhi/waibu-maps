// based on: https://docs.mapbox.com/mapbox-gl-js/example/cluster-html/

class DonutCharts {
  create (props, itemCounts, colors) {
    const offsets = []
    const counts = []
    for (const ic of itemCounts) {
      counts.push(props[ic])
    }
    let total = 0
    for (const count of counts) {
      offsets.push(total)
      total += count
    }
    const fontSize = total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16
    const r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18
    const r0 = Math.round(r * 0.6)
    const w = r * 2

    let html = `<div><svg width="${w}" height="${w}" viewbox="0 0 ${w} ${w}"
      text-anchor="middle" style="font: ${fontSize}px sans-serif; display: block">`
    for (let i = 0; i < counts.length; i++) {
      html += this.donutSegment(
        offsets[i] / total,
        (offsets[i] + counts[i]) / total,
        r,
        r0,
        colors[i]
      )
    }
    html += `<circle cx="${r}" cy="${r}" r="${r0}" fill="white" />
      <text dominant-baseline="central" transform="translate(${r}, ${r})">
        ${total.toLocaleString()}
      </text></svg></div>`

    const el = document.createElement('div')
    el.innerHTML = html
    return el.firstChild
  }

  donutSegment (start, end, r, r0, color) {
    if (end - start === 1) end -= 0.00001
    const a0 = 2 * Math.PI * (start - 0.25)
    const a1 = 2 * Math.PI * (end - 0.25)
    const x0 = Math.cos(a0)
    const y0 = Math.sin(a0)
    const x1 = Math.cos(a1)
    const y1 = Math.sin(a1)
    const largeArc = end - start > 0.5 ? 1 : 0

    // draw an SVG path
    return `<path d="M ${r + r0 * x0} ${r + r0 * y0} L ${r + r * x0} ${r + r * y0} A
      ${r} ${r} 0 ${largeArc} 1 ${r + r * x1} ${r + r * y1} L ${r + r0 * x1} ${r + r0 * y1} A
      ${r0} ${r0} 0 ${largeArc} 0 ${r + r0 * x0} ${r + r0 * y0}" fill="${color}" />`
  }
}

const donutChart = new DonutCharts() // eslint-disable-line no-unused-vars
