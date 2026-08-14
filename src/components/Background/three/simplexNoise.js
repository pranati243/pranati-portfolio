/**
 * Compact 2D simplex noise (Stefan Gustavson's algorithm), embedded so the
 * seabed needs no external noise dependency.
 */
const GRAD = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

export default class SimplexNoise {
  constructor(seed = 1337) {
    this.perm = new Uint8Array(512);
    const p = new Uint8Array(256);

    for (let i = 0; i < 256; i += 1) p[i] = i;

    // Deterministic shuffle so the seabed looks identical on every reload.
    let n = seed;
    const random = () => {
      n = (n * 1664525 + 1013904223) % 4294967296;
      return n / 4294967296;
    };

    for (let i = 255; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }

    for (let i = 0; i < 512; i += 1) this.perm[i] = p[i & 255];
  }

  noise(xin, yin) {
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;

    const x0 = xin - (i - t);
    const y0 = yin - (j - t);

    const [i1, j1] = x0 > y0 ? [1, 0] : [0, 1];

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    const ii = i & 255;
    const jj = j & 255;

    const corner = (x, y, gi) => {
      let tt = 0.5 - x * x - y * y;
      if (tt < 0) return 0;
      tt *= tt;
      const g = GRAD[gi % 8];
      return tt * tt * (g[0] * x + g[1] * y);
    };

    const n0 = corner(x0, y0, this.perm[ii + this.perm[jj]]);
    const n1 = corner(x1, y1, this.perm[ii + i1 + this.perm[jj + j1]]);
    const n2 = corner(x2, y2, this.perm[ii + 1 + this.perm[jj + 1]]);

    return 70 * (n0 + n1 + n2);
  }
}
