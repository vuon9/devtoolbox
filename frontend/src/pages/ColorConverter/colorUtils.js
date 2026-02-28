// Color utility functions
export const hexToRgb = (hex) => {
  const result =
    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex) ||
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
  if (!result) return null;

  const r = parseInt(result[1].length === 1 ? result[1] + result[1] : result[1], 16);
  const g = parseInt(result[2].length === 1 ? result[2] + result[2] : result[2], 16);
  const b = parseInt(result[3].length === 1 ? result[3] + result[3] : result[3], 16);
  const a = result[4]
    ? parseInt(result[4].length === 1 ? result[4] + result[4] : result[4], 16) / 255
    : 1;

  return { r, g, b, a };
};

export const rgbToHex = (r, g, b, a = 1) => {
  const toHex = (n) => Math.round(n).toString(16).padStart(2, '0');
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (a < 1) {
    return `${hex}${toHex(a * 255)}`;
  }
  return hex;
};

export const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

export const hslToRgb = (h, s, l) => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

export const rgbToHsv = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    v = max;

  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
};

export const hsvToRgb = (h, s, v) => {
  h /= 360;
  s /= 100;
  v /= 100;

  let r, g, b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

export const rgbToCmyk = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const k = 1 - Math.max(r, g, b);
  const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
  const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
  const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
};

export const cmykToRgb = (c, m, y, k) => {
  c /= 100;
  m /= 100;
  y /= 100;
  k /= 100;

  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
  };
};

// Format display values
export const formatHex = (hex) => hex.toUpperCase();
export const formatRgb = (r, g, b) => `rgb(${r},${g},${b})`;
export const formatHsl = (h, s, l) => `hsl(${h},${s}%,${l}%)`;
export const formatHsv = (h, s, v) => `hsv(${h},${s}%,${v}%)`;
export const formatCmyk = (c, m, y, k) => `cmyk(${c},${m},${y},${k})`;

// Parse input values
export const parseHex = (value) => {
  const match = value.match(/^#?([a-f\d]{6})$/i);
  if (match) {
    const hex = '#' + match[1];
    const rgb = hexToRgb(hex);
    if (rgb) return { r: rgb.r, g: rgb.g, b: rgb.b, a: 1 };
  }
  return null;
};

export const parseRgb = (value) => {
  const match = value.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
      return { r, g, b, a: 1 };
    }
  }
  return null;
};

export const parseHsl = (value) => {
  const match = value.match(/^hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/i);
  if (match) {
    const h = parseInt(match[1], 10);
    const s = parseInt(match[2], 10);
    const l = parseInt(match[3], 10);
    if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
      const rgb = hslToRgb(h, s, l);
      return { ...rgb, a: 1 };
    }
  }
  return null;
};

export const parseHsv = (value) => {
  const match = value.match(/^hsv\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/i);
  if (match) {
    const h = parseInt(match[1], 10);
    const s = parseInt(match[2], 10);
    const v = parseInt(match[3], 10);
    if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && v >= 0 && v <= 100) {
      const rgb = hsvToRgb(h, s, v);
      return { ...rgb, a: 1 };
    }
  }
  return null;
};

export const parseCmyk = (value) => {
  const match = value.match(/^cmyk\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (match) {
    const c = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const y = parseInt(match[3], 10);
    const k = parseInt(match[4], 10);
    if (c >= 0 && c <= 100 && m >= 0 && m <= 100 && y >= 0 && y <= 100 && k >= 0 && k <= 100) {
      const rgb = cmykToRgb(c, m, y, k);
      return { ...rgb, a: 1 };
    }
  }
  return null;
};

// Generate code snippets for various languages
export const generateCodeSnippets = (r, g, b, a, hsl, hsv) => {
  const rf = (r / 255).toFixed(3);
  const gf = (g / 255).toFixed(3);
  const bf = (b / 255).toFixed(3);
  const af = a.toFixed(2);
  const hue = hsl.h;
  const sat = hsv.s;
  const bright = hsv.v;

  return {
    css: [
      { name: 'RGB', code: `rgb(${r} ${g} ${b})` },
      { name: 'RGBA', code: `rgb(${r} ${g} ${b} / ${Math.round(a * 100)}%)` },
      { name: 'HSL', code: `hsl(${hue}deg ${hsl.s}% ${hsl.l}%)` },
      { name: 'HSLA', code: `hsl(${hue}deg ${hsl.s}% ${hsl.l}% / ${Math.round(a * 100)}%)` },
      { name: 'Hex', code: rgbToHex(r, g, b, a) },
      { name: 'CSS Variable', code: `--color-primary: ${rgbToHex(r, g, b, a)};` },
    ],
    swift: [
      {
        name: 'NSColor RGB',
        code: `NSColor(
    calibratedRed: ${rf},
    green: ${gf},
    blue: ${bf},
    alpha: ${af}
)`,
      },
      {
        name: 'NSColor HSB',
        code: `NSColor(
    calibratedHue: ${hue / 360},
    saturation: ${(sat / 100).toFixed(3)},
    brightness: ${(bright / 100).toFixed(3)},
    alpha: ${af}
)`,
      },
      {
        name: 'UIColor RGB',
        code: `UIColor(
    red: ${rf},
    green: ${gf},
    blue: ${bf},
    alpha: ${af}
)`,
      },
      {
        name: 'UIColor HSB',
        code: `UIColor(
    hue: ${hue / 360},
    saturation: ${(sat / 100).toFixed(3)},
    brightness: ${(bright / 100).toFixed(3)},
    alpha: ${af}
)`,
      },
    ],
    dotnet: [
      { name: 'FromRgb', code: `Color.FromRgb(${r}, ${g}, ${b})` },
      { name: 'FromArgb', code: `Color.FromArgb(${Math.round(a * 255)}, ${r}, ${g}, ${b})` },
      { name: 'FromHex', code: `Color.FromHex("${rgbToHex(r, g, b).replace('#', '')}")` },
    ],
    java: [
      { name: 'Color RGB', code: `new Color(${r}, ${g}, ${b})` },
      { name: 'Color RGBA', code: `new Color(${r}, ${g}, ${b}, ${Math.round(a * 255)})` },
      {
        name: 'Color HSB',
        code: `Color.getHSBColor(${hue / 360}f, ${(sat / 100).toFixed(3)}f, ${(bright / 100).toFixed(3)}f)`,
      },
    ],
    android: [
      { name: 'Color.rgb', code: `Color.rgb(${r}, ${g}, ${b})` },
      { name: 'Color.argb', code: `Color.argb(${Math.round(a * 255)}, ${r}, ${g}, ${b})` },
      { name: 'Color.parseColor', code: `Color.parseColor("${rgbToHex(r, g, b)}")` },
      { name: 'Resource', code: `<color name="custom_color">${rgbToHex(r, g, b)}</color>` },
      {
        name: 'Resource with Alpha',
        code: `<color name="custom_color">${rgbToHex(r, g, b, a)}</color>`,
      },
    ],
    opengl: [
      { name: 'glColor3f', code: `glColor3f(${rf}f, ${gf}f, ${bf}f)` },
      { name: 'glColor4f', code: `glColor4f(${rf}f, ${gf}f, ${bf}f, ${af}f)` },
      { name: 'glColor3ub', code: `glColor3ub(${r}, ${g}, ${b})` },
      { name: 'glColor4ub', code: `glColor4ub(${r}, ${g}, ${b}, ${Math.round(a * 255)})` },
    ],
    objc: [
      {
        name: 'UIColor RGB',
        code: `[UIColor colorWithRed:${rf} green:${gf} blue:${bf} alpha:${af}]`,
      },
      {
        name: 'UIColor HSB',
        code: `[UIColor colorWithHue:${(hue / 360).toFixed(3)} saturation:${(sat / 100).toFixed(3)} brightness:${(bright / 100).toFixed(3)} alpha:${af}]`,
      },
      {
        name: 'NSColor RGB',
        code: `[[NSColor colorWithCalibratedRed:${rf} green:${gf} blue:${bf} alpha:${af}]`,
      },
    ],
    flutter: [
      { name: 'Color from RGB', code: `Color.fromRGBO(${r}, ${g}, ${b}, ${af})` },
      { name: 'Color from ARGB', code: `Color.fromARGB(${Math.round(a * 255)}, ${r}, ${g}, ${b})` },
      { name: 'Color hex', code: `Color(0xFF${rgbToHex(r, g, b).replace('#', '').toUpperCase()})` },
      {
        name: 'Color hex with alpha',
        code: `Color(0x${Math.round(a * 255)
          .toString(16)
          .padStart(2, '0')
          .toUpperCase()}${rgbToHex(r, g, b).replace('#', '').toUpperCase()})`,
      },
    ],
    unity: [
      { name: 'Color', code: `new Color(${rf}f, ${gf}f, ${bf}f, ${af}f)` },
      { name: 'Color32', code: `new Color32(${r}, ${g}, ${b}, ${Math.round(a * 255)})` },
      {
        name: 'Hex String',
        code: `ColorUtility.TryParseHtmlString("${rgbToHex(r, g, b)}", out Color color)`,
      },
    ],
    reactnative: [
      {
        name: 'StyleSheet',
        code: `const styles = StyleSheet.create({
    container: {
        backgroundColor: '${rgbToHex(r, g, b)}',
    },
});`,
      },
      { name: 'Inline', code: `{ backgroundColor: '${rgbToHex(r, g, b)}' }` },
      { name: 'RGBA', code: `{ backgroundColor: 'rgba(${r}, ${g}, ${b}, ${af})' }` },
    ],
    svg: [
      { name: 'Fill', code: `fill="${rgbToHex(r, g, b)}"` },
      { name: 'Stroke', code: `stroke="${rgbToHex(r, g, b)}"` },
      { name: 'Fill with Opacity', code: `fill="${rgbToHex(r, g, b)}" fill-opacity="${af}"` },
    ],
  };
};
