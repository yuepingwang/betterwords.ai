// Grid-quantized diamond sparkle tiles for the composer background.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
// Periodic (seamlessly tiling) 2D Perlin noise: gradient lattice wraps at
// `period`, so sampling x,y in [0, period) tiles perfectly. Returns ~[-1, 1].
function makePerlin(rand, period) {
  const grads = []
  for (let i = 0; i < period * period; i++) {
    const a = rand() * Math.PI * 2
    grads.push([Math.cos(a), Math.sin(a)])
  }
  const g = (ix, iy) => grads[((iy % period + period) % period) * period + ((ix % period + period) % period)]
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10)
  return function (x, y) {
    const x0 = Math.floor(x), y0 = Math.floor(y)
    const fx = x - x0, fy = y - y0
    const dot = (ix, iy) => {
      const [gx, gy] = g(ix, iy)
      return gx * (x - ix) + gy * (y - iy)
    }
    const u = fade(fx), v = fade(fy)
    const top = dot(x0, y0) + u * (dot(x0 + 1, y0) - dot(x0, y0))
    const bot = dot(x0, y0 + 1) + u * (dot(x0 + 1, y0 + 1) - dot(x0, y0 + 1))
    return top + v * (bot - top)
  }
}
function tile({ seed, cells, pitch, r, occupancy, period }) {
  const rand = mulberry32(seed)
  const perlin = makePerlin(rand, period)
  const size = cells * pitch
  let paths = ''
  for (let gy = 0; gy < cells; gy++) {
    for (let gx = 0; gx < cells; gx++) {
      if (rand() > occupancy) continue
      const cx = gx * pitch + pitch / 2
      const cy = Math.round((gy * pitch + pitch / 2 - r) * 100) / 100
      // opacity from the perlin field (bright/dim clusters) with the contrast
      // stretched hard, so bright diamonds run brilliant and dim ones faint
      const n = perlin((gx / cells) * period, (gy / cells) * period)
      let v = 0.5 + (n * 0.71) * 2.0 + (rand() - 0.5) * 0.18
      v = Math.min(1, Math.max(0, v))
      const o = Math.round((0.06 + v * 0.92) * 100) / 100
      paths += `%3Cpath d='M${cx} ${cy}l${r} ${r}-${r} ${r}-${r}-${r}z' fill-opacity='${o}'/%3E`
    }
  }
  const svg = `%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'%3E%3Cg fill='%23fff'%3E${paths}%3C/g%3E%3C/svg%3E`
  return { size, uri: `data:image/svg+xml,${svg}` }
}
const a = tile({ seed: 11, cells: 36, pitch: 3, r: 2.2, occupancy: 0.03, period: 4 })
const b = tile({ seed: 47, cells: 40, pitch: 4, r: 2.2, occupancy: 0.02, period: 4 })
console.log('/* layer A —', a.size + 'px */')
console.log(a.uri)
console.log('/* layer B —', b.size + 'px */')
console.log(b.uri)
