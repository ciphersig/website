'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';

// Exact grid transcribed from the Wall of Curiosity puzzle image (14 rows x 17 cols)
const GRID_ROWS = [
  'LPQZMANSHXKUNALZH',
  'WERTYUAIOPLKJHNFA',
  'XCVINMDQWERTYUION',
  'KJRGFDWSROOTKITAD',
  'NHVCSXAZAQWEVRTYM',
  'SPLKPJRHNGFDISAMN',
  'VCXCYBERSECURITYZ',
  'SDFGWHJWORMKULPOI',
  'TROJANYTMREWSQASD',
  'GHJKRLZXWCVBNMPOI',
  'YTREEWQAASDFGHJKL',
  'XCVBNMQWRERTYUIOP',
  'SDFGHJKLEZXCVBNMQ',
  'ERTYUIOPLKJHGFDSA',
];

const ROWS = GRID_ROWS.length;
const COLS = GRID_ROWS[0].length;
const GRID = GRID_ROWS.map(row => row.split(''));

// Words and their exact placement in the grid (row, col)
const WORDS = [
  { word: 'TROJAN', color: '#ff6b6b', start: [8, 0], dir: [0, 1] },
  { word: 'SPYWARE', color: '#4ecdc4', start: [4, 4], dir: [1, 0] },
  { word: 'ADWARE', color: '#ffe66d', start: [1, 6], dir: [1, 0] },
  { word: 'ROOTKIT', color: '#a78bfa', start: [3, 8], dir: [0, 1] },
  { word: 'RANSOMWARE', color: '#ff9f43', start: [3, 8], dir: [1, 0] },
  { word: 'VIRUS', color: '#54a0ff', start: [4, 12], dir: [1, 0] },
  { word: 'WORM', color: '#ff6bcb', start: [7, 7], dir: [0, 1] },
  { word: 'CYBERSECURITY', color: '#39ff88', start: [6, 3], dir: [0, 1], core: true },
];

const PLACEMENTS = WORDS.map(w => {
  const cells: [number, number][] = [];
  for (let i = 0; i < w.word.length; i++) {
    cells.push([w.start[0] + w.dir[0] * i, w.start[1] + w.dir[1] * i]);
  }
  return { ...w, cells };
});

// Calibrated dimensions for offer.png (Wall of Curiosity)
const IMG_NATURAL_WIDTH = 5191;
const IMG_NATURAL_HEIGHT = 2920;
const GRID_CENTER_X = 2500.0;
const GRID_CENTER_Y = 1560.0;
const GRID_WIDTH = 1480.0; // Scaled up to fill the paper margins cleanly without overlapping sticky notes
const GRID_HEIGHT = 1420.0;
const GRID_ROTATION = 2.3; // 2.3 degrees parchment paper tilt

// Cyber audio synth blip for cinematic reveal
function playCyberBlip(freq = 880) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch {
    // Audio context may be restricted by browser policy before user interaction
  }
}

interface CyberWordSearchProps {
  isVisible: boolean;
}

export function CyberWordSearch({ isVisible }: CyberWordSearchProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetOffsetRef = useRef({ x: 0, y: 0 });

  const [gridRect, setGridRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    cellWidth: number;
    cellHeight: number;
  } | null>(null);

  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState<[number, number] | null>(null);
  const [currentPath, setCurrentPath] = useState<[number, number][]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [isRevealing, setIsRevealing] = useState(false);
  const revealTimeoutRef = useRef<NodeJS.Timeout[]>([]);

  // Cell highlight map: key 'r_c' -> color
  const [cellColors, setCellColors] = useState<Map<string, string>>(new Map());

  // Compute exact grid position on screen matching object-fit: cover of the offer.png image
  const updateGridPosition = useCallback(() => {
    if (typeof window === 'undefined') return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    const containerAR = W / H;
    const imgAR = IMG_NATURAL_WIDTH / IMG_NATURAL_HEIGHT; // 1.77774

    let imgDisplayWidth: number;
    let imgDisplayHeight: number;
    let imgOffsetX: number;
    let imgOffsetY: number;

    if (containerAR > imgAR) {
      // Ultrawide / extra-wide screen: scales to width, centers vertically
      imgDisplayWidth = W;
      imgDisplayHeight = W / imgAR;
      imgOffsetX = 0;
      imgOffsetY = (H - imgDisplayHeight) / 2;
    } else {
      // Standard 16:9, laptop, or portrait: scales to height, centers horizontally
      imgDisplayHeight = H;
      imgDisplayWidth = H * imgAR;
      imgOffsetX = (W - imgDisplayWidth) / 2;
      imgOffsetY = 0;
    }

    const scale = imgDisplayWidth / IMG_NATURAL_WIDTH;

    const width = Math.round(GRID_WIDTH * scale);
    const height = Math.round(GRID_HEIGHT * scale);
    const centerX = imgOffsetX + GRID_CENTER_X * scale;
    const centerY = imgOffsetY + GRID_CENTER_Y * scale;
    const left = Math.round(centerX - width / 2);
    const top = Math.round(centerY - height / 2);
    const cellWidth = width / COLS;
    const cellHeight = height / ROWS;

    setGridRect({
      left,
      top,
      width,
      height,
      cellWidth,
      cellHeight,
    });
  }, []);

  useEffect(() => {
    updateGridPosition();
    window.addEventListener('resize', updateGridPosition);
    window.addEventListener('orientationchange', updateGridPosition);
    return () => {
      window.removeEventListener('resize', updateGridPosition);
      window.removeEventListener('orientationchange', updateGridPosition);
    };
  }, [updateGridPosition]);

  // Cursor Parallax: Moves the crossword in sync with the background image
  const applyParallax = () => {
    rafRef.current = null;
    const el = containerRef.current;
    if (!el) return;
    const { x, y } = targetOffsetRef.current;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.03)`;
  };

  useEffect(() => {
    if (!isVisible) {
      targetOffsetRef.current = { x: 0, y: 0 };
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (containerRef.current) {
        containerRef.current.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
      }
      return;
    }

    const isMobile =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 767px)').matches;

    if (isMobile) {
      targetOffsetRef.current = { x: 0, y: 0 };
      if (containerRef.current) {
        containerRef.current.style.transform = 'translate3d(0px, 0px, 0) scale(1.03)';
      }
      return;
    }

    const MAX_PX = 14;

    const onMove = (e: MouseEvent) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const nx = W ? e.clientX / W : 0.5;
      const ny = H ? e.clientY / H : 0.5;

      const dx = (nx - 0.5) * 2;
      const dy = (ny - 0.5) * 2;

      const x = Math.max(-MAX_PX, Math.min(MAX_PX, -dx * MAX_PX));
      const y = Math.max(-MAX_PX, Math.min(MAX_PX, -dy * MAX_PX));

      targetOffsetRef.current = { x, y };
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(applyParallax);
      }
    };

    const onLeave = () => {
      targetOffsetRef.current = { x: 0, y: 0 };
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          if (containerRef.current) {
            containerRef.current.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
          }
        });
      }
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isVisible]);

  // Cinematic Reveal & Reset Toggle Function
  const toggleCinematicReveal = useCallback(() => {
    // Clear any previous ongoing reveal timeouts
    revealTimeoutRef.current.forEach(t => clearTimeout(t));
    revealTimeoutRef.current = [];

    // If already revealed or partially solved, reset the puzzle back to original state
    if (foundWords.size > 0 || isRevealing) {
      setFoundWords(new Set());
      setCellColors(new Map());
      setIsRevealing(false);
      playCyberBlip(440);
      return;
    }

    // Otherwise, start cinematic reveal
    setFoundWords(new Set());
    setCellColors(new Map());
    setIsRevealing(true);

    const baseFrequencies = [520, 600, 680, 750, 850, 960, 1100, 1320];

    PLACEMENTS.forEach((placement, index) => {
      const timeout = setTimeout(() => {
        playCyberBlip(baseFrequencies[index] || 880);

        setFoundWords(prev => new Set([...prev, placement.word]));
        setCellColors(prev => {
          const next = new Map(prev);
          placement.cells.forEach(([r, c]) => {
            next.set(`${r}_${c}`, placement.color);
          });
          return next;
        });

        if (index === PLACEMENTS.length - 1) {
          setIsRevealing(false);
        }
      }, 250 * (index + 1));

      revealTimeoutRef.current.push(timeout);
    });
  }, [foundWords.size, isRevealing]);

  // Listen for the custom reveal/reset event triggered from the button after speaker
  useEffect(() => {
    const handleRevealEvent = () => {
      if (isVisible) {
        toggleCinematicReveal();
      }
    };

    window.addEventListener('cyber-reveal-crossword', handleRevealEvent);
    return () => {
      window.removeEventListener('cyber-reveal-crossword', handleRevealEvent);
    };
  }, [isVisible, toggleCinematicReveal]);

  const cellFromPoint = useCallback((x: number, y: number): [number, number] | null => {
    if (typeof document === 'undefined') return null;
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const target = el.closest('[data-grid-cell]');
    if (target) {
      const r = target.getAttribute('data-r');
      const c = target.getAttribute('data-c');
      if (r !== null && c !== null) {
        return [parseInt(r, 10), parseInt(c, 10)];
      }
    }
    return null;
  }, []);

  const computePath = (sr: number, sc: number, er: number, ec: number): [number, number][] | null => {
    const dr = Math.sign(er - sr);
    const dc = Math.sign(ec - sc);
    const straight = sr === er || sc === ec || Math.abs(er - sr) === Math.abs(ec - sc);
    if (!straight) return null;
    const len = Math.max(Math.abs(er - sr), Math.abs(ec - sc)) + 1;
    const path: [number, number][] = [];
    for (let i = 0; i < len; i++) {
      path.push([sr + dr * i, sc + dc * i]);
    }
    return path;
  };

  const tryMatch = (path: [number, number][]) => {
    const forward = path.map(([r, c]) => GRID[r][c]).join('');
    const backward = forward.split('').reverse().join('');
    for (const p of PLACEMENTS) {
      if (foundWords.has(p.word)) continue;
      if (p.word === forward || p.word === backward) {
        return p;
      }
    }
    return null;
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    const cell = cellFromPoint(clientX, clientY);
    if (!cell) return;
    setSelecting(true);
    setStartCell(cell);
    setCurrentPath([cell]);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!selecting || !startCell) return;
    const cell = cellFromPoint(clientX, clientY);
    if (!cell) return;
    const path = computePath(startCell[0], startCell[1], cell[0], cell[1]);
    if (path) {
      setCurrentPath(path);
    }
  };

  const handlePointerUp = () => {
    if (!selecting) return;
    setSelecting(false);

    if (currentPath.length > 1) {
      const match = tryMatch(currentPath);
      if (match) {
        playCyberBlip(1000);
        setFoundWords(prev => new Set([...prev, match.word]));
        setCellColors(prev => {
          const next = new Map(prev);
          match.cells.forEach(([r, c]) => {
            next.set(`${r}_${c}`, match.color);
          });
          return next;
        });
      }
    }

    setCurrentPath([]);
    setStartCell(null);
  };

  useEffect(() => {
    if (!isVisible) return;

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const onMouseUp = () => {
      handlePointerUp();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      handlePointerUp();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isVisible, selecting, startCell, currentPath]);

  const isCellInPath = (r: number, c: number) =>
    currentPath.some(([pr, pc]) => pr === r && pc === c);

  const remainingCount = WORDS.length - foundWords.size;

  return (
    <div
      className={`fixed inset-0 pointer-events-none select-none transition-opacity duration-200 ${
        isVisible ? 'opacity-100 z-30' : 'opacity-0 z-0'
      }`}
    >
      {/* Parallax Tracking Wrapper */}
      <div
        ref={containerRef}
        className="absolute inset-0 will-change-transform"
        style={{
          transformOrigin: 'center center',
          transform: 'translate3d(0px, 0px, 0) scale(1.03)',
        }}
      >
        {gridRect && (
          <>
            {/* Word Search Grid Container with Transparent Borders */}
            <div
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: gridRect.left,
                top: gridRect.top,
                width: gridRect.width,
                height: gridRect.height,
                display: 'grid',
                gridTemplateColumns: `repeat(${COLS}, ${gridRect.cellWidth}px)`,
                gridTemplateRows: `repeat(${ROWS}, ${gridRect.cellHeight}px)`,
                transform: `rotate(${GRID_ROTATION}deg)`,
                transformOrigin: 'center center',
                touchAction: 'none',
              }}
              onMouseDown={e => {
                e.preventDefault();
                handlePointerDown(e.clientX, e.clientY);
              }}
              onTouchStart={e => {
                if (e.touches.length > 0) {
                  handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
            >
              {GRID.map((row, r) =>
                row.map((letter, c) => {
                  const key = `${r}_${c}`;
                  const isFound = cellColors.has(key);
                  const foundColor = cellColors.get(key);
                  const isSelecting = isCellInPath(r, c);

                  return (
                    <div
                      key={key}
                      data-grid-cell="true"
                      data-r={r}
                      data-c={c}
                      className="relative flex items-center justify-center font-mono font-extrabold select-none transition-colors duration-150"
                      style={{
                        width: `${gridRect.cellWidth}px`,
                        height: `${gridRect.cellHeight}px`,
                        fontSize: `${Math.max(11, Math.round(gridRect.cellHeight * 0.53))}px`,
                        color: '#000000',
                        border: '1px solid transparent',
                        backgroundColor: isFound
                          ? foundColor
                          : isSelecting
                          ? 'rgba(57, 255, 136, 0.45)'
                          : 'transparent',
                        borderRadius: isFound ? '4px' : isSelecting ? '4px' : '0px',
                        boxShadow: isFound
                          ? `0 0 10px ${foundColor}`
                          : isSelecting
                          ? '0 0 8px rgba(57, 255, 136, 0.6)'
                          : 'none',
                      }}
                    >
                      {letter}
                    </div>
                  );
                })
              )}
            </div>

            {/* Threat Counter Badge directly below the paper */}
            <div
              className="absolute flex items-center gap-2 pointer-events-auto"
              style={{
                left: gridRect.left + gridRect.width / 2,
                top: gridRect.top + gridRect.height + 16,
                transform: `translateX(-50%) rotate(${GRID_ROTATION}deg)`,
              }}
            >
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/50 bg-black/85 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <span className="font-mono text-xs text-emerald-400 font-bold tracking-wider">
                  THREATS REMAINING:
                </span>
                <span className="font-mono text-sm text-white font-extrabold">
                  {remainingCount} / {WORDS.length}
                </span>
                {remainingCount === 0 && (
                  <span className="ml-1 text-[11px] font-mono text-emerald-400 uppercase tracking-widest animate-pulse">
                    ✓ ALL SECURED
                  </span>
                )}
                {isRevealing && (
                  <span className="ml-1 text-[10px] font-mono text-cyan-400 uppercase tracking-wider animate-bounce">
                    DECRYPTING...
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
