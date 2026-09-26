'use client';

import { useRef, useEffect, useCallback } from 'react';

interface PixelRippleProps {
  color?: string;
  backgroundColor?: string | 'transparent';
  fontSize?: number;
  duration?: number;
  trailLength?: number;
}

interface Ripple {
  originCol: number;
  originRow: number;
  startTime: number;
  strength: number;
}

interface CellState {
  activatedAt: number;
  strength: number;
}

const SEQUENCE_FORWARD = ['-', '>', 'o'];
const SEQUENCE_FULL = ['-', '>', 'o', '>', '-'];
const SCRAMBLE_CHARS = ['@', '*', '#', '~', '+', '=', '!', '&', '%', '^'];

function randomScramble(): string {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

function manhattanDistance(r1: number, c1: number, r2: number, c2: number): number {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

export function PixelRipple({
  color = '#ffffff',
  backgroundColor = '#0a0a0a',
  fontSize = 14,
  duration = 800,
  trailLength = 8,
}: PixelRippleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const ripplesRef = useRef<Ripple[]>([]);
  const cellStatesRef = useRef<Map<string, CellState>>(new Map());
  const mouseTrailRef = useRef<{ col: number; row: number; time: number }[]>([]);
  const gridRef = useRef<{ rows: number; cols: number; cellW: number; cellH: number }>({
    rows: 0, cols: 0, cellW: 0, cellH: 0,
  });

  const getGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { rows: 0, cols: 0, cellW: 0, cellH: 0 };
    const cellW = fontSize * 0.6;
    const cellH = fontSize * 1.2;
    const cols = Math.ceil(canvas.width / cellW);
    const rows = Math.ceil(canvas.height / cellH);
    return { rows, cols, cellW, cellH };
  }, [fontSize]);

  const handleClick = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dpr = window.devicePixelRatio || 1;
    const { cellW, cellH } = gridRef.current;
    const col = Math.floor((x * dpr) / cellW);
    const row = Math.floor((y * dpr) / cellH);
    const now = performance.now();

    const existing = ripplesRef.current.find(r => {
      const dist = manhattanDistance(r.originRow, r.originCol, row, col);
      return dist < 5;
    });

    if (existing) {
      existing.strength = Math.min(existing.strength + 1, 4);
      existing.startTime = now;
    } else {
      ripplesRef.current.push({
        originCol: col,
        originRow: row,
        startTime: now,
        strength: 1,
      });
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dpr = window.devicePixelRatio || 1;
    const { cellW, cellH } = gridRef.current;
    const col = Math.floor((x * dpr) / cellW);
    const row = Math.floor((y * dpr) / cellH);

    const trail = mouseTrailRef.current;
    const last = trail[trail.length - 1];
    if (!last || last.col !== col || last.row !== row) {
      trail.push({ col, row, time: performance.now() });
      if (trail.length > trailLength * 3) {
        trail.splice(0, trail.length - trailLength * 3);
      }
    }
  }, [trailLength]);

  const handleMouseLeave = useCallback(() => {
    // trail fades naturally
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      gridRef.current = getGrid();
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const expandSpeed = 0.015; // distance units per ms

    const render = (now: number) => {
      const { rows, cols, cellW, cellH } = gridRef.current;
      const cellStates = cellStatesRef.current;

      // Clear
      if (backgroundColor === 'transparent') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Update cell states from ripples
      const activeRipples: Ripple[] = [];
      for (const ripple of ripplesRef.current) {
        const elapsed = now - ripple.startTime;
        const maxDist = Math.max(rows, cols) * 2;
        const currentRadius = elapsed * expandSpeed * ripple.strength;

        if (currentRadius > maxDist + 10) continue;
        activeRipples.push(ripple);

        const ringWidth = 1 + ripple.strength;
        const innerRadius = Math.max(0, currentRadius - ringWidth);
        const outerRadius = currentRadius;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const dist = manhattanDistance(r, c, ripple.originRow, ripple.originCol);
            if (dist >= innerRadius && dist <= outerRadius) {
              const key = `${r},${c}`;
              const existing = cellStates.get(key);
              if (!existing || now - existing.activatedAt > duration * 0.3) {
                cellStates.set(key, { activatedAt: now, strength: ripple.strength });
              }
            }
          }
        }
      }
      ripplesRef.current = activeRipples;

      // Update cell states from mouse trail
      const trail = mouseTrailRef.current;
      const trailFadeDuration = trailLength * 60;
      for (let i = trail.length - 1; i >= 0; i--) {
        const t = trail[i];
        const age = now - t.time;
        if (age > trailFadeDuration) {
          trail.splice(i, 1);
          continue;
        }
        const key = `${t.row},${t.col}`;
        const existing = cellStates.get(key);
        if (!existing || now - existing.activatedAt > duration * 0.5) {
          cellStates.set(key, { activatedAt: now, strength: 1 });
        }
        // neighbors
        const neighbors = [
          [t.row - 1, t.col], [t.row + 1, t.col],
          [t.row, t.col - 1], [t.row, t.col + 1],
        ];
        for (const [nr, nc] of neighbors) {
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const nKey = `${nr},${nc}`;
            const nExisting = cellStates.get(nKey);
            if (!nExisting || now - nExisting.activatedAt > duration * 0.7) {
              cellStates.set(nKey, { activatedAt: now + 30, strength: 0.5 });
            }
          }
        }
      }

      // Render cells
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const keysToDelete: string[] = [];

      for (const [key, cell] of cellStates) {
        const elapsed = now - cell.activatedAt;
        const progress = elapsed / duration;

        if (progress > 1) {
          keysToDelete.push(key);
          continue;
        }

        const [rStr, cStr] = key.split(',');
        const r = parseInt(rStr);
        const c = parseInt(cStr);

        // Determine character based on sequence position
        const seqLen = SEQUENCE_FULL.length;
        const seqProgress = progress * seqLen;
        const seqIndex = Math.min(Math.floor(seqProgress), seqLen - 1);

        // Scramble: randomly swap character with a scramble char
        const scrambleChance = 0.3 * (1 - progress);
        let char: string;
        if (Math.random() < scrambleChance) {
          char = randomScramble();
        } else {
          char = SEQUENCE_FULL[seqIndex];
        }

        // Opacity: fade in then fade out
        let opacity: number;
        if (progress < 0.3) {
          opacity = progress / 0.3;
        } else if (progress > 0.7) {
          opacity = (1 - progress) / 0.3;
        } else {
          opacity = 1;
        }
        opacity = Math.max(0, Math.min(1, opacity)) * Math.min(cell.strength, 1.5) / 1.5;

        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        ctx.fillText(char, c * cellW + cellW / 2, r * cellH + cellH / 2);
      }

      ctx.globalAlpha = 1;

      for (const key of keysToDelete) {
        cellStates.delete(key);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [color, backgroundColor, fontSize, duration, trailLength, getGrid, handleClick, handleMouseMove, handleMouseLeave]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        cursor: 'crosshair',
      }}
    />
  );
}
