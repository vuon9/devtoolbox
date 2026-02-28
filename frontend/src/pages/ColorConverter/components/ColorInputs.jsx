import React from 'react';
import ColorInputRow from './ColorInputRow';
import { formatHex, formatRgb, formatHsl, formatHsv, formatCmyk } from '../colorUtils';

export default function ColorInputs({ state, onColorInput, onCopy }) {
  const hexDisplay = formatHex(state.hex);
  const rgbDisplay = formatRgb(state.rgb.r, state.rgb.g, state.rgb.b);
  const hslDisplay = formatHsl(state.hsl.h, state.hsl.s, state.hsl.l);
  const hsvDisplay = formatHsv(state.hsv.h, state.hsv.s, state.hsv.v);
  const cmykDisplay = formatCmyk(state.cmyk.c, state.cmyk.m, state.cmyk.y, state.cmyk.k);

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
      }}
    >
      <ColorInputRow
        label="HEX"
        value={hexDisplay}
        onChange={(value) => onColorInput('hex', value)}
        copyValue={hexDisplay}
        onCopy={onCopy}
        placeholder="#3DD6F5"
      />

      <ColorInputRow
        label="RGB"
        value={rgbDisplay}
        onChange={(value) => onColorInput('rgb', value)}
        copyValue={rgbDisplay}
        onCopy={onCopy}
        placeholder="rgb(61,214,245)"
      />

      <ColorInputRow
        label="HSL"
        value={hslDisplay}
        onChange={(value) => onColorInput('hsl', value)}
        copyValue={hslDisplay}
        onCopy={onCopy}
        placeholder="hsl(191,90%,60%)"
      />

      <ColorInputRow
        label="HSV"
        value={hsvDisplay}
        onChange={(value) => onColorInput('hsv', value)}
        copyValue={hsvDisplay}
        onCopy={onCopy}
        placeholder="hsv(191,75%,96%)"
      />

      <ColorInputRow
        label="CMYK"
        value={cmykDisplay}
        onChange={(value) => onColorInput('cmyk', value)}
        copyValue={cmykDisplay}
        onCopy={onCopy}
        placeholder="cmyk(75,13,0,4)"
      />
    </div>
  );
}
