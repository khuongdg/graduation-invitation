'use client';

import React, { useEffect, useState } from 'react';

export default function ChibiImage({ src, alt, width, height, className }) {
  const [processedSrc, setProcessedSrc] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      const queue = [];
      const visited = new Uint8Array(w * h);

      // Add border pixels to start queue for flood fill
      for (let x = 0; x < w; x++) {
        queue.push([x, 0]);
        visited[0 * w + x] = 1;
        queue.push([x, h - 1]);
        visited[(h - 1) * w + x] = 1;
      }
      for (let y = 1; y < h - 1; y++) {
        queue.push([0, y]);
        visited[y * w + 0] = 1;
        queue.push([w - 1, y]);
        visited[y * w + w - 1] = 1;
      }

      // Check if a pixel is white/light-gray (background)
      const isWhiteBackground = (r, g, b) => {
        return r > 235 && g > 235 && b > 235;
      };

      let head = 0;
      while (head < queue.length) {
        const [cx, cy] = queue[head++];
        const idx = (cy * w + cx) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (isWhiteBackground(r, g, b)) {
          // Set alpha to 0 (fully transparent)
          data[idx + 3] = 0;

          // Add 4-directional neighbors
          const dirs = [
            [0, 1], [0, -1], [1, 0], [-1, 0]
          ];
          for (const [dx, dy] of dirs) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nIdx = ny * w + nx;
              if (visited[nIdx] === 0) {
                visited[nIdx] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setProcessedSrc(canvas.toDataURL());
    };
  }, [src]);

  if (!processedSrc) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ opacity: 0 }}
      />
    );
  }

  return (
    <img
      src={processedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}
