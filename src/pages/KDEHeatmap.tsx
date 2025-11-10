import React, { useMemo } from "react";
import { Image as KonvaImage } from "react-konva";

type Point = { x: number; y: number };

interface KDEHeatmapProps {
  points: Point[];                 // positions in display coords (0..DisplayMapDimension)
  width: number;
  height: number;
  bandwidth?: number;              // in pixels (default ~ 32)
  gridSize?: number;               // internal grid resolution (default 128)
  opacity?: number;                // 0..1
  maxIntensity?: number;           // optional clamp
  visible?: boolean;
}

/**
 * Builds a heatmap canvas from points via Gaussian KDE.
 * Returns an offscreen canvas used as the <KonvaImage image={...} /> source.
 */
export const KDEHeatmap: React.FC<KDEHeatmapProps> = ({
  points,
  width,
  height,
  bandwidth = 32,
  gridSize = 128,
  opacity = 0.85,
  maxIntensity,
  visible = true,
}) => {
  const canvas = useMemo(() => {
    if (!points?.length) return null;

    // Internal grid we’ll compute density on, then scale up to full size
    const gw = gridSize;
    const gh = Math.round((gridSize * height) / width); // preserve aspect
    const density = new Float32Array(gw * gh);

    // Convert bandwidth from pixels to grid units
    const bwGridX = (bandwidth * gw) / width;
    const bwGridY = (bandwidth * gh) / height;

    // Limit kernel radius to ~3 sigma
    const rx = Math.max(1, Math.ceil(3 * bwGridX));
    const ry = Math.max(1, Math.ceil(3 * bwGridY));

    // Precompute Gaussian normalizers
    const twoSigmaSqX = 2 * bwGridX * bwGridX;
    const twoSigmaSqY = 2 * bwGridY * bwGridY;

    // Add each point’s contribution to the grid
    for (const p of points) {
      // Map to grid space
      const gx = (p.x / width) * gw;
      const gy = (p.y / height) * gh;

      const x0 = Math.max(0, Math.floor(gx - rx));
      const x1 = Math.min(gw - 1, Math.ceil(gx + rx));
      const y0 = Math.max(0, Math.floor(gy - ry));
      const y1 = Math.min(gh - 1, Math.ceil(gy + ry));

      for (let gyi = y0; gyi <= y1; gyi++) {
        const dy = gyi - gy;
        const dy2 = (dy * dy) / twoSigmaSqY;
        for (let gxi = x0; gxi <= x1; gxi++) {
          const dx = gxi - gx;
          const dx2 = (dx * dx) / twoSigmaSqX;
          const weight = Math.exp(-(dx2 + dy2)); // separable Gaussian
          density[gyi * gw + gxi] += weight;
        }
      }
    }

    // Normalize [0,1]
    let max = 0;
    for (let i = 0; i < density.length; i++) {
      if (density[i] > max) max = density[i];
    }
    const clampMax = maxIntensity && maxIntensity > 0 ? maxIntensity : max || 1;

    // Create a small canvas for the grid, then scale to full
    const small = document.createElement("canvas");
    small.width = gw;
    small.height = gh;
    const sctx = small.getContext("2d", { willReadFrequently: true });
    if (!sctx) return null;

    const img = sctx.createImageData(gw, gh);

    // Simple perceptual-ish colormap (blue → cyan → lime → yellow → red)
    const colorRamp = (t: number) => {
      // t in [0,1]
      // 0: transparent, 1: red
      const stops = [
        { t: 0.00, r: 0,   g: 0,   b: 0,   a: 0   },  // transparent
        { t: 0.20, r: 0,   g: 32,  b: 128, a: 255 },  // deep blue
        { t: 0.40, r: 0,   g: 160, b: 255, a: 255 },  // cyan
        { t: 0.60, r: 0,   g: 224, b: 64,  a: 255 },  // lime-y
        { t: 0.80, r: 255, g: 224, b: 0,   a: 255 },  // yellow
        { t: 1.00, r: 255, g: 0,   b: 0,   a: 255 },  // red
      ];
      // find segment
      for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i], b = stops[i + 1];
        if (t <= b.t) {
          const u = (t - a.t) / (b.t - a.t);
          return {
            r: Math.round(a.r + (b.r - a.r) * u),
            g: Math.round(a.g + (b.g - a.g) * u),
            b: Math.round(a.b + (b.b - a.b) * u),
            a: Math.round((a.a + (b.a - a.a) * u) * opacity),
          };
        }
      }
      const last = stops[stops.length - 1];
      return { r: last.r, g: last.g, b: last.b, a: Math.round(last.a * opacity) };
    };

    for (let i = 0; i < density.length; i++) {
      const v = Math.min(1, density[i] / clampMax);
      const { r, g, b, a } = colorRamp(v);
      const j = i * 4;
      img.data[j + 0] = r;
      img.data[j + 1] = g;
      img.data[j + 2] = b;
      img.data[j + 3] = a;
    }
    sctx.putImageData(img, 0, 0);

    // Scale up to target size on a final canvas (Konva reads from this)
    const full = document.createElement("canvas");
    full.width = width;
    full.height = height;
    const fctx = full.getContext("2d");
    if (!fctx) return null;

    // Slight smoothing
    fctx.imageSmoothingEnabled = true;
    fctx.imageSmoothingQuality = "high";
    fctx.drawImage(small, 0, 0, width, height);

    return full;
  }, [points, width, height, bandwidth, gridSize, opacity, maxIntensity]);

  if (!visible || !canvas)
    return null;
  return <KonvaImage image={canvas} width={width} height={height} listening={false}/>;
};