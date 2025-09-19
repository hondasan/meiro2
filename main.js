(() => {
  'use strict';

  /**
   * @typedef {Object} Vec2
   * @property {number} x
   * @property {number} y
   */

  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  const dom = {
    overlays: {
      title: document.getElementById('title-screen'),
      result: document.getElementById('result-screen'),
    },
    touchLayer: document.getElementById('touch-layer'),
    hudLevel: document.getElementById('hud-level'),
    hudScore: document.getElementById('hud-score'),
    statusAttack: document.querySelector('#status-attack .value'),
    statusInvincible: document.querySelector('#status-invincible .value'),
    statusTrap: document.querySelector('#status-trap .value'),
    statusField: document.querySelector('#status-field .value'),
    statusDash: document.querySelector('#status-dash .value'),
    statusSmoke: document.querySelector('#status-smoke .value'),
    resultScore: document.getElementById('result-score'),
    resultLevel: document.getElementById('result-level'),
    resultTime: document.getElementById('result-time'),
    initialInput: document.getElementById('initial-input'),
    resultForm: document.getElementById('result-form'),
    rankingPanel: document.getElementById('ranking-panel'),
    rankingList: document.getElementById('ranking-list'),
    resetRanking: document.getElementById('reset-ranking'),
    closeRanking: document.getElementById('close-ranking'),
    settingsPanel: document.getElementById('settings-panel'),
    closeSettings: document.getElementById('close-settings'),
    sightRange: document.getElementById('sight-range'),
    padSize: document.getElementById('pad-size'),
    swipeSensitivity: document.getElementById('swipe-sensitivity'),
    vibrationToggle: document.getElementById('vibration-toggle'),
    screenshakeToggle: document.getElementById('screenshake-toggle'),
    fogToggle: document.getElementById('fog-toggle'),
    toggleSound: document.getElementById('toggle-sound'),
    openSettings: document.getElementById('open-settings'),
    openRanking: document.getElementById('open-ranking'),
    startButton: document.getElementById('start-button'),
    retryButton: document.getElementById('retry-button'),
    backTitle: document.getElementById('back-title'),
    pauseButton: document.getElementById('pause-button'),
    howtoBtn: document.getElementById('show-howto'),
    howto: document.getElementById('howto'),
    virtualPad: document.getElementById('virtual-pad'),
    padButtons: Array.from(document.querySelectorAll('#virtual-pad .pad-btn')),
    padToggle: document.getElementById('pad-toggle'),
    dashButton: document.getElementById('dash-button'),
    smokeButton: document.getElementById('smoke-button'),
    loading: document.getElementById('loading-indicator'),
    pauseOverlay: document.getElementById('pause-overlay'),
    tutorial: document.getElementById('tutorial-pop'),
    tutorialClose: document.getElementById('tutorial-close'),
  };

  const Config = (() => {
    const BASE_TILE = 32;
    return {
      VERSION: '1.0.0',
      CANVAS_MIN_HEIGHT: 520,
      TILE_BASE: BASE_TILE,
      TILE_MIN: 18,
      MAX_FRAME_PATHFIND: 3,
      VIEW_RADIUS_DEFAULT: Number(dom.sightRange.value),
      INPUT: {
        swipeSensitivity: Number(dom.swipeSensitivity.value),
        padSize: Number(dom.padSize.value),
      },
      MAZE: {
        braidMin: 0.25,
        braidMax: 0.45,
        minJunctionRatio: 0.12,
        roomCount: 2,
        roomSize: { min: 3, max: 5 },
        widenThreshold: 10,
        widenChance: 0.4,
        alternativeMaxTries: 40,
      },
      AUDIO: {
        masterVolume: 0.4,
      },
      LEVEL: {
        baseSize: { w: 15, h: 15 },
        sizeStep: 2,
        baseEnemies: 2,
        maxEnemies: 12,
        baseEnemySpeed: 1.2,
        speedStep: 0.12,
        baseTraps: 3,
        baseItems: 2,
        itemDropDecay: 0.9,
      },
      PLAYER: {
        baseSpeed: 3.6,
        slowFactor: 0.45,
        freezeDuration: 0.5,
        reverseDuration: 4,
        dashCooldown: 3,
        dashDuration: 0.35,
        dashMultiplier: 2,
        smokeDuration: 2,
      },
      ITEM: {
        attackDuration: 6,
        invincibleDuration: 5,
        smokeChance: 0.2,
      },
      TRAP: {
        slowDuration: 3.5,
        snareDuration: 0.45,
        reverseDuration: 4,
        fogDuration: 6,
        fogRadiusBase: 5,
        fogRadiusLevelStep: 0.5,
        noiseDuration: 4,
        noisePullStrength: 0.65,
      },
      ENEMIES: {
        SPRINT: { id: 'sprinter', label: 'スプリンター', color: '#ff6b6b', outline: 4, speedFactor: 1.3, view: 5, pathTimer: 28 },
        STRATEGY: { id: 'strategist', label: 'ストラテジスト', color: '#f9c74f', outline: 2, speedFactor: 1.0, view: 9, pathTimer: 20 },
        WANDER: { id: 'wanderer', label: 'ワンダラー', color: '#4cc9f0', outline: 3, speedFactor: 0.9, view: 6, pathTimer: 45 },
        PATROL: { id: 'patroller', label: 'パトローラー', color: '#b5179e', outline: 2, speedFactor: 1.05, view: 7, pathTimer: 35 },
      },
      ENEMY_BEHAVIOR: {
        chaseGrace: 2,
        pathIntervalMin: 0.22,
        pathIntervalMax: 0.42,
        leashDistance: 80,
        closeDistanceSlow: 2,
        closeSpeedFactor: 0.8,
        densityZone: 6,
        densityLimit: 2,
        densityCooldown: 5,
      },
      SCORE: {
        base: 1000,
        timePenalty: 15,
      },
    };
  })();

  const Utils = {
    rngSeed: Date.now() % 2147483647,
    /**
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    randRange(min, max) {
      return Math.random() * (max - min) + min;
    },
    /**
     * @param {number} max
     * @returns {number}
     */
    randInt(max) {
      return Math.floor(Math.random() * max);
    },
    /**
     * @param {any[]} array
     */
    shuffle(array) {
      for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    },
    lerp(a, b, t) {
      return a + (b - a) * t;
    },
    now() {
      return performance.now() / 1000;
    },
    formatTime(sec) {
      return sec.toFixed(1);
    },
    easeOutQuad(t) {
      return t * (2 - t);
    },
  };

  const Audio = (() => {
    let ctxAudio;
    let masterGain;
    let muted = false;
    /**
     * @param {number} freq
     * @param {number} duration
     */
    function playBeep(freq, duration) {
      if (muted) return;
      try {
        if (!ctxAudio) {
          ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
          masterGain = ctxAudio.createGain();
          masterGain.gain.value = Config.AUDIO.masterVolume;
          masterGain.connect(ctxAudio.destination);
        }
        const osc = ctxAudio.createOscillator();
        const gain = ctxAudio.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, ctxAudio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.4, ctxAudio.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctxAudio.currentTime + duration);
        osc.connect(gain).connect(masterGain);
        osc.start();
        osc.stop(ctxAudio.currentTime + duration + 0.05);
      } catch (err) {
        // ignore
      }
    }

    return {
      play(type) {
        switch (type) {
          case 'start':
            playBeep(440, 0.25);
            break;
          case 'item':
            playBeep(660, 0.2);
            break;
          case 'trap':
            playBeep(220, 0.3);
            break;
          case 'goal':
            playBeep(880, 0.4);
            break;
          case 'hit':
            playBeep(120, 0.2);
            break;
        }
      },
      toggleMute() {
        muted = !muted;
        if (ctxAudio && masterGain) {
          masterGain.gain.value = muted ? 0 : Config.AUDIO.masterVolume;
        }
        return muted;
      },
      isMuted() {
        return muted;
      },
    };
  })();

  const ConfigStore = (() => {
    const data = {
      viewRadius: Config.VIEW_RADIUS_DEFAULT,
      padSize: Config.INPUT.padSize,
      swipeSensitivity: Config.INPUT.swipeSensitivity,
      vibration: dom.vibrationToggle.checked,
      screenshake: dom.screenshakeToggle.checked,
      fog: dom.fogToggle.checked,
    };
    return {
      get(key) {
        return data[key];
      },
      set(key, value) {
        data[key] = value;
      },
    };
  })();

  const Input = (() => {
    /** @type {Set<string>} */
    const keys = new Set();
    let swipeStart = null;
    let gamepadDir = null;
    let swipeDir = null;
    let swipeSteps = 0;
    let dashRequested = false;
    let smokeRequested = false;
    let padState = 'full';
    let longPressTimer = null;
    let dragData = null;

    function updatePadSize() {
      const size = ConfigStore.get('padSize');
      dom.padButtons.forEach((btn) => {
        btn.style.width = `${size}px`;
        btn.style.height = `${size}px`;
      });
    }

    function setPadState(state) {
      padState = state;
      dom.virtualPad.dataset.state = state;
      dom.padToggle.dataset.state = state;
      const hidden = state === 'hidden';
      dom.virtualPad.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    }

    function cyclePadState() {
      const order = ['full', 'compact', 'hidden'];
      const idx = order.indexOf(padState);
      const next = order[(idx + 1) % order.length];
      setPadState(next);
    }

    function handlePadPress(dir) {
      gamepadDir = dir;
    }

    function clearPadPress() {
      gamepadDir = null;
    }

    dom.padButtons.forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        handlePadPress(btn.dataset.dir);
      });
      btn.addEventListener('pointerup', clearPadPress);
      btn.addEventListener('pointercancel', clearPadPress);
      btn.addEventListener('pointerleave', clearPadPress);
      btn.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    });

    function requestDash() {
      dashRequested = true;
    }

    function requestSmoke() {
      smokeRequested = true;
    }

    dom.dashButton.addEventListener('click', (e) => {
      e.preventDefault();
      requestDash();
    });
    dom.smokeButton.addEventListener('click', (e) => {
      e.preventDefault();
      requestSmoke();
    });

    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
      }
      if (key === ' ') {
        e.preventDefault();
        requestDash();
      } else if (key === 'e') {
        requestSmoke();
      }
      keys.add(key);
    });
    window.addEventListener('keyup', (e) => {
      keys.delete(e.key.toLowerCase());
    });

    function triggerSwipe(dir) {
      swipeDir = dir;
      swipeSteps = 1;
    }

    dom.touchLayer.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
      swipeStart = { x: e.clientX, y: e.clientY, id: e.pointerId };
      dom.touchLayer.setPointerCapture(e.pointerId);
    });
    dom.touchLayer.addEventListener('pointerup', (e) => {
      if (!swipeStart || swipeStart.id !== e.pointerId) return;
      const dx = e.clientX - swipeStart.x;
      const dy = e.clientY - swipeStart.y;
      const sens = ConfigStore.get('swipeSensitivity');
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > sens) {
        triggerSwipe(dx > 0 ? 'right' : 'left');
      } else if (Math.abs(dy) > sens) {
        triggerSwipe(dy > 0 ? 'down' : 'up');
      }
      dom.touchLayer.releasePointerCapture(e.pointerId);
      swipeStart = null;
    });
    dom.touchLayer.addEventListener('pointercancel', (e) => {
      if (swipeStart && swipeStart.id === e.pointerId) {
        dom.touchLayer.releasePointerCapture(e.pointerId);
      }
      swipeStart = null;
    });

    dom.padToggle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      dom.padToggle.setPointerCapture(e.pointerId);
      longPressTimer = window.setTimeout(() => {
        const rect = dom.padToggle.getBoundingClientRect();
        dragData = {
          id: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          left: rect.left,
          top: rect.top,
        };
        dom.padToggle.classList.add('dragging');
      }, 300);
    });

    function endDrag(pointerId, asClick) {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (dragData && dragData.id === pointerId) {
        dragData = null;
        dom.padToggle.classList.remove('dragging');
      } else if (asClick) {
        cyclePadState();
      }
    }

    dom.padToggle.addEventListener('pointermove', (e) => {
      if (!dragData || dragData.id !== e.pointerId) return;
      const dx = e.clientX - dragData.startX;
      const dy = e.clientY - dragData.startY;
      const maxLeft = window.innerWidth - dom.padToggle.offsetWidth - 8;
      const maxTop = window.innerHeight - dom.padToggle.offsetHeight - 8;
      const newLeft = Math.max(8, Math.min(maxLeft, dragData.left + dx));
      const newTop = Math.max(8, Math.min(maxTop, dragData.top + dy));
      dom.padToggle.style.left = `${newLeft}px`;
      dom.padToggle.style.top = `${newTop}px`;
      dom.padToggle.style.right = 'auto';
      dom.padToggle.style.bottom = 'auto';
    });

    dom.padToggle.addEventListener('pointerup', (e) => {
      dom.padToggle.releasePointerCapture(e.pointerId);
      const wasDragging = Boolean(dragData && dragData.id === e.pointerId);
      endDrag(e.pointerId, !wasDragging);
    });
    dom.padToggle.addEventListener('pointercancel', (e) => {
      dom.padToggle.releasePointerCapture(e.pointerId);
      endDrag(e.pointerId, false);
    });

    function resolveDirection(dir) {
      switch (dir) {
        case 'up':
          return { x: 0, y: -1 };
        case 'down':
          return { x: 0, y: 1 };
        case 'left':
          return { x: -1, y: 0 };
        case 'right':
          return { x: 1, y: 0 };
        default:
          return { x: 0, y: 0 };
      }
    }

    function getDirection(reverse) {
      let horizontal = 0;
      let vertical = 0;
      if (keys.has('arrowup') || keys.has('w')) vertical -= 1;
      if (keys.has('arrowdown') || keys.has('s')) vertical += 1;
      if (keys.has('arrowleft') || keys.has('a')) horizontal -= 1;
      if (keys.has('arrowright') || keys.has('d')) horizontal += 1;
      if (gamepadDir) {
        const { x, y } = resolveDirection(gamepadDir);
        horizontal += x;
        vertical += y;
      }
      if (swipeSteps > 0 && swipeDir) {
        const { x, y } = resolveDirection(swipeDir);
        horizontal += x;
        vertical += y;
      }
      horizontal = Math.max(-1, Math.min(1, horizontal));
      vertical = Math.max(-1, Math.min(1, vertical));
      if (reverse) {
        horizontal *= -1;
        vertical *= -1;
      }
      return { x: horizontal, y: vertical };
    }

    function notifyStep() {
      if (swipeSteps > 0) {
        swipeSteps -= 1;
        if (swipeSteps <= 0) {
          swipeDir = null;
        }
      }
    }

    function consumeDash() {
      const result = dashRequested;
      dashRequested = false;
      return result;
    }

    function consumeSmoke() {
      const result = smokeRequested;
      smokeRequested = false;
      return result;
    }

    updatePadSize();
    setPadState('full');

    return {
      getDirection,
      updatePadSize,
      setPadLabels(reverse) {
        dom.padButtons.forEach((btn) => {
          const dir = btn.dataset.dir;
          if (!reverse) {
            btn.textContent = dir === 'up' ? '▲' : dir === 'down' ? '▼' : dir === 'left' ? '◀' : '▶';
          } else {
            const mapping = { up: '▼', down: '▲', left: '▶', right: '◀' };
            btn.textContent = mapping[dir];
          }
        });
      },
      notifyStep,
      consumeDash,
      consumeSmoke,
      setPadState,
      getPadState: () => padState,
    };
  })();

  const Maze = (() => {
    const DIRS = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];

    let lastMetadata = { rooms: [], widened: [], junctions: [] };

    function baseGenerate(width, height) {
      const w = width % 2 === 0 ? width + 1 : width;
      const h = height % 2 === 0 ? height + 1 : height;
      const maze = Array.from({ length: h }, () => Array(w).fill(1));
      const stack = [];
      const startX = 1;
      const startY = 1;
      maze[startY][startX] = 0;
      stack.push({ x: startX, y: startY });
      const stepDirs = DIRS.map((d) => ({ x: d.x * 2, y: d.y * 2 }));

      while (stack.length) {
        const current = stack[stack.length - 1];
        const candidates = stepDirs
          .map((d) => ({ x: current.x + d.x, y: current.y + d.y, midX: current.x + d.x / 2, midY: current.y + d.y / 2 }))
          .filter(
            (cell) =>
              cell.x > 0 &&
              cell.y > 0 &&
              cell.x < w - 1 &&
              cell.y < h - 1 &&
              maze[cell.y][cell.x] === 1
          );
        if (!candidates.length) {
          stack.pop();
          continue;
        }
        const next = candidates[Utils.randInt(candidates.length)];
        maze[next.midY][next.midX] = 0;
        maze[next.y][next.x] = 0;
        stack.push({ x: next.x, y: next.y });
      }
      maze[h - 2][w - 2] = 0;
      return maze;
    }

    function inBounds(grid, x, y) {
      return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length;
    }

    function countOpenNeighbors(grid, x, y) {
      return DIRS.reduce((acc, d) => (grid[y + d.y] && grid[y + d.y][x + d.x] === 0 ? acc + 1 : acc), 0);
    }

    function getOpenNeighbors(grid, x, y) {
      return DIRS.filter((d) => inBounds(grid, x + d.x, y + d.y) && grid[y + d.y][x + d.x] === 0).map((d) => ({
        x: x + d.x,
        y: y + d.y,
      }));
    }

    function carveRoom(grid, x, y, width, height, rooms) {
      const tiles = [];
      for (let ry = y; ry < y + height; ry += 1) {
        for (let rx = x; rx < x + width; rx += 1) {
          if (ry <= 0 || ry >= grid.length - 1 || rx <= 0 || rx >= grid[0].length - 1) continue;
          grid[ry][rx] = 0;
          tiles.push({ x: rx, y: ry });
        }
      }
      if (!tiles.length) return null;
      const center = tiles[Math.floor(tiles.length / 2)];
      const room = { tiles, center };
      rooms.push(room);
      return room;
    }

    function connectRoom(grid, room) {
      if (!room) return;
      const perimeter = [];
      room.tiles.forEach((tile) => {
        DIRS.forEach((d) => {
          const nx = tile.x + d.x;
          const ny = tile.y + d.y;
          if (!inBounds(grid, nx, ny)) return;
          if (grid[ny][nx] === 1) {
            perimeter.push({ x: tile.x, y: tile.y, dir: d });
          }
        });
      });
      Utils.shuffle(perimeter);
      const doors = Math.max(2, Math.min(4, Math.floor(perimeter.length / 6) + 1));
      let created = 0;
      for (const cell of perimeter) {
        if (created >= doors) break;
        let cx = cell.x;
        let cy = cell.y;
        let depth = 0;
        while (depth < 6) {
          cx += cell.dir.x;
          cy += cell.dir.y;
          if (!inBounds(grid, cx, cy)) break;
          if (grid[cy][cx] === 0) {
            created += 1;
            break;
          }
          grid[cy][cx] = 0;
          depth += 1;
        }
      }
    }

    function addRooms(grid, start, goal, rooms) {
      const attempts = Math.max(Config.MAZE.roomCount, 2) * 3;
      let created = 0;
      for (let i = 0; i < attempts && created < Config.MAZE.roomCount; i += 1) {
        const rw = Utils.randInt(Config.MAZE.roomSize.max - Config.MAZE.roomSize.min + 1) + Config.MAZE.roomSize.min;
        const rh = Utils.randInt(Config.MAZE.roomSize.max - Config.MAZE.roomSize.min + 1) + Config.MAZE.roomSize.min;
        const rx = Utils.randInt(grid[0].length - rw - 2) + 1;
        const ry = Utils.randInt(grid.length - rh - 2) + 1;
        if (
          (rx <= start.x && start.x <= rx + rw && ry <= start.y && start.y <= ry + rh) ||
          (rx <= goal.x && goal.x <= rx + rw && ry <= goal.y && goal.y <= ry + rh)
        ) {
          continue;
        }
        let blocked = false;
        for (let y = ry - 1; y < ry + rh + 1 && !blocked; y += 1) {
          for (let x = rx - 1; x < rx + rw + 1; x += 1) {
            if (!inBounds(grid, x, y)) {
              blocked = true;
              break;
            }
            if (grid[y][x] === 0) {
              blocked = true;
              break;
            }
          }
        }
        if (blocked) continue;
        const room = carveRoom(grid, rx, ry, rw, rh, rooms);
        if (room) {
          connectRoom(grid, room);
          created += 1;
        }
      }
    }

    function getDeadEnds(grid) {
      const ends = [];
      for (let y = 1; y < grid.length - 1; y += 1) {
        for (let x = 1; x < grid[0].length - 1; x += 1) {
          if (grid[y][x] === 0 && countOpenNeighbors(grid, x, y) === 1) {
            ends.push({ x, y });
          }
        }
      }
      return ends;
    }

    function braid(grid) {
      const deadEnds = getDeadEnds(grid);
      if (!deadEnds.length) return;
      const ratio = Utils.randRange(Config.MAZE.braidMin, Config.MAZE.braidMax);
      const target = Math.floor(deadEnds.length * ratio);
      Utils.shuffle(deadEnds);
      for (let i = 0; i < target; i += 1) {
        const cell = deadEnds[i];
        const candidates = DIRS.filter((d) => {
          const wallX = cell.x + d.x;
          const wallY = cell.y + d.y;
          const beyondX = cell.x + d.x * 2;
          const beyondY = cell.y + d.y * 2;
          return (
            inBounds(grid, wallX, wallY) &&
            inBounds(grid, beyondX, beyondY) &&
            grid[wallY][wallX] === 1 &&
            grid[beyondY][beyondX] === 0
          );
        });
        if (!candidates.length) continue;
        const pick = candidates[Utils.randInt(candidates.length)];
        grid[cell.y + pick.y][cell.x + pick.x] = 0;
      }
    }

    function ensureJunctionDensity(grid) {
      const flat = [];
      for (let y = 1; y < grid.length - 1; y += 1) {
        for (let x = 1; x < grid[0].length - 1; x += 1) {
          if (grid[y][x] === 0) flat.push({ x, y });
        }
      }
      const targetRatio = Config.MAZE.minJunctionRatio;
      let junctions = flat.filter((cell) => countOpenNeighbors(grid, cell.x, cell.y) >= 3).length;
      let attempts = 0;
      while (flat.length && junctions / flat.length < targetRatio && attempts < flat.length * 4) {
        attempts += 1;
        const cell = flat[Utils.randInt(flat.length)];
        const dirs = DIRS.filter((d) => {
          const wallX = cell.x + d.x;
          const wallY = cell.y + d.y;
          const beyondX = cell.x + d.x * 2;
          const beyondY = cell.y + d.y * 2;
          return (
            inBounds(grid, wallX, wallY) &&
            inBounds(grid, beyondX, beyondY) &&
            grid[wallY][wallX] === 1 &&
            grid[beyondY][beyondX] === 0
          );
        });
        if (!dirs.length) continue;
        const pick = dirs[Utils.randInt(dirs.length)];
        grid[cell.y + pick.y][cell.x + pick.x] = 0;
        junctions = flat.filter((c) => countOpenNeighbors(grid, c.x, c.y) >= 3).length;
      }
    }

    function widenCorridors(grid, widened) {
      const visited = new Set();
      const key = (x, y) => `${x},${y}`;
      for (let y = 1; y < grid.length - 1; y += 1) {
        for (let x = 1; x < grid[0].length - 1; x += 1) {
          if (grid[y][x] !== 0) continue;
          if (visited.has(key(x, y))) continue;
          const neighbors = getOpenNeighbors(grid, x, y);
          if (neighbors.length !== 2) continue;
          const dirA = { x: neighbors[0].x - x, y: neighbors[0].y - y };
          const dirB = { x: neighbors[1].x - x, y: neighbors[1].y - y };
          if (!(dirA.x === -dirB.x && dirA.y === -dirB.y)) continue;
          const dir = { x: Math.sign(dirA.x), y: Math.sign(dirA.y) };
          const segment = [];
          const explore = (sx, sy, dx, dy) => {
            let cx = sx;
            let cy = sy;
            while (true) {
              const cellKey = key(cx, cy);
              if (!visited.has(cellKey)) {
                visited.add(cellKey);
                segment.push({ x: cx, y: cy });
              }
              const nextX = cx + dx;
              const nextY = cy + dy;
              if (!inBounds(grid, nextX, nextY)) break;
              if (grid[nextY][nextX] !== 0) break;
              const nextNeighbors = getOpenNeighbors(grid, nextX, nextY);
              if (nextNeighbors.length !== 2) {
                cx = nextX;
                cy = nextY;
                visited.add(key(cx, cy));
                segment.push({ x: cx, y: cy });
                break;
              }
              cx = nextX;
              cy = nextY;
              if (visited.has(key(cx, cy))) break;
            }
          };
          explore(x, y, dir.x, dir.y);
          explore(x, y, -dir.x, -dir.y);
          const unique = Array.from(new Map(segment.map((c) => [key(c.x, c.y), c])).values());
          if (unique.length < Config.MAZE.widenThreshold) continue;
          if (Math.random() > Config.MAZE.widenChance) continue;
          const perpendicular = dir.x !== 0 ? [{ x: 0, y: 1 }, { x: 0, y: -1 }] : [{ x: 1, y: 0 }, { x: -1, y: 0 }];
          const widenDir = perpendicular[Utils.randInt(perpendicular.length)];
          unique.forEach((cell) => {
            const nx = cell.x + widenDir.x;
            const ny = cell.y + widenDir.y;
            if (!inBounds(grid, nx, ny) || grid[ny][nx] === 0) return;
            grid[ny][nx] = 0;
            widened.push({ x: nx, y: ny });
          });
        }
      }
    }

    function shortestPath(grid, start, goal, forbidEdges = null) {
      const queue = [{ x: start.x, y: start.y, prev: null }];
      const visited = new Set([`${start.x},${start.y}`]);
      while (queue.length) {
        const node = queue.shift();
        if (node.x === goal.x && node.y === goal.y) {
          const path = [];
          let cur = node;
          while (cur) {
            path.unshift({ x: cur.x, y: cur.y });
            cur = cur.prev;
          }
          return path;
        }
        for (const dir of DIRS) {
          const nx = node.x + dir.x;
          const ny = node.y + dir.y;
          if (!inBounds(grid, nx, ny)) continue;
          if (grid[ny][nx] !== 0 && !(nx === goal.x && ny === goal.y)) continue;
          const edgeKey = `${Math.min(node.x, nx)},${Math.min(node.y, ny)}-${Math.max(node.x, nx)},${Math.max(node.y, ny)}`;
          if (forbidEdges && forbidEdges.has(edgeKey)) continue;
          const key = `${nx},${ny}`;
          if (visited.has(key)) continue;
          visited.add(key);
          queue.push({ x: nx, y: ny, prev: node });
        }
      }
      return [];
    }

    function ensureAlternative(grid, start, goal) {
      const primary = shortestPath(grid, start, goal);
      if (!primary.length) return;
      const edges = new Set();
      for (let i = 0; i < primary.length - 1; i += 1) {
        const a = primary[i];
        const b = primary[i + 1];
        const key = `${Math.min(a.x, b.x)},${Math.min(a.y, b.y)}-${Math.max(a.x, b.x)},${Math.max(a.y, b.y)}`;
        edges.add(key);
      }
      const pathSet = new Set(primary.map((p) => `${p.x},${p.y}`));
      const alt = shortestPath(grid, start, goal, edges);
      if (alt.length) return;
      const inner = primary.slice(1, -1);
      let tries = 0;
      while (tries < Config.MAZE.alternativeMaxTries && !shortestPath(grid, start, goal, edges).length) {
        tries += 1;
        if (!inner.length) break;
        const cell = inner[Utils.randInt(inner.length)];
        const dirs = Utils.shuffle([...DIRS]);
        let carved = false;
        for (const dir of dirs) {
          const wallX = cell.x + dir.x;
          const wallY = cell.y + dir.y;
          const targetX = cell.x + dir.x * 2;
          const targetY = cell.y + dir.y * 2;
          if (!inBounds(grid, targetX, targetY)) continue;
          if (grid[wallY][wallX] === 1 && grid[targetY][targetX] === 0 && !pathSet.has(`${targetX},${targetY}`)) {
            grid[wallY][wallX] = 0;
            carved = true;
            break;
          }
        }
        if (!carved) {
          const dir = DIRS[Utils.randInt(DIRS.length)];
          const wallX = cell.x + dir.x;
          const wallY = cell.y + dir.y;
          const targetX = cell.x + dir.x * 2;
          const targetY = cell.y + dir.y * 2;
          if (inBounds(grid, targetX, targetY) && grid[wallY][wallX] === 1) {
            grid[wallY][wallX] = 0;
            grid[targetY][targetX] = 0;
          }
        }
      }
    }

    function computeMetadata(grid, rooms, widened) {
      const junctions = [];
      for (let y = 1; y < grid.length - 1; y += 1) {
        for (let x = 1; x < grid[0].length - 1; x += 1) {
          if (grid[y][x] === 0 && countOpenNeighbors(grid, x, y) >= 3) {
            junctions.push({ x, y });
          }
        }
      }
      lastMetadata = {
        rooms,
        widened,
        junctions,
      };
    }

    function generate(width, height) {
      const base = baseGenerate(width, height);
      const start = { x: 1, y: 1 };
      const goal = { x: base[0].length - 2, y: base.length - 2 };
      const rooms = [];
      const widened = [];
      addRooms(base, start, goal, rooms);
      braid(base);
      ensureJunctionDensity(base);
      widenCorridors(base, widened);
      ensureAlternative(base, start, goal);
      computeMetadata(base, rooms, widened);
      return { grid: base, metadata: lastMetadata };
    }

    return {
      generate,
      getMetadata() {
        return lastMetadata;
      },
    };
  })();

  const Pathfinding = (() => {
    /**
     * @param {number[][]} grid
     * @param {Vec2} start
     * @param {Vec2} end
     * @returns {Vec2[]}
     */
    function bfs(grid, start, end) {
      const h = grid.length;
      const w = grid[0].length;
      const visited = Array.from({ length: h }, () => Array(w).fill(false));
      const queue = [{ x: start.x, y: start.y, path: [] }];
      visited[start.y][start.x] = true;
      const dirs = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
      ];
      while (queue.length) {
        const current = queue.shift();
        if (current.x === end.x && current.y === end.y) {
          return current.path;
        }
        for (const d of dirs) {
          const nx = current.x + d.x;
          const ny = current.y + d.y;
          if (nx >= 0 && ny >= 0 && nx < w && ny < h && !visited[ny][nx] && grid[ny][nx] === 0) {
            visited[ny][nx] = true;
            queue.push({ x: nx, y: ny, path: current.path.concat({ x: nx, y: ny }) });
          }
        }
      }
      return [];
    }

    /**
     * @param {number[][]} grid
     * @param {Vec2} start
     * @param {Vec2} end
     * @returns {Vec2[]}
     */
    function aStar(grid, start, end) {
      const h = grid.length;
      const w = grid[0].length;
      const open = [{ x: start.x, y: start.y }];
      const cameFrom = new Map();
      const gScore = Array.from({ length: h }, () => Array(w).fill(Infinity));
      const fScore = Array.from({ length: h }, () => Array(w).fill(Infinity));
      gScore[start.y][start.x] = 0;
      const heuristic = (x, y) => Math.abs(x - end.x) + Math.abs(y - end.y);
      fScore[start.y][start.x] = heuristic(start.x, start.y);
      const dirs = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
      ];

      while (open.length) {
        open.sort((a, b) => fScore[a.y][a.x] - fScore[b.y][b.x]);
        const current = open.shift();
        if (!current) break;
        if (current.x === end.x && current.y === end.y) {
          const path = [];
          let key = `${current.x},${current.y}`;
          while (cameFrom.has(key)) {
            const node = key.split(',');
            path.unshift({ x: Number(node[0]), y: Number(node[1]) });
            const prev = cameFrom.get(key);
            if (!prev) break;
            key = `${prev.x},${prev.y}`;
          }
          return path;
        }

        for (const d of dirs) {
          const nx = current.x + d.x;
          const ny = current.y + d.y;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          if (grid[ny][nx] !== 0 && !(nx === end.x && ny === end.y)) continue;
          const tentative = gScore[current.y][current.x] + 1;
          if (tentative < gScore[ny][nx]) {
            cameFrom.set(`${nx},${ny}`, { x: current.x, y: current.y });
            gScore[ny][nx] = tentative;
            fScore[ny][nx] = tentative + heuristic(nx, ny);
            if (!open.some((node) => node.x === nx && node.y === ny)) {
              open.push({ x: nx, y: ny });
            }
          }
        }
      }
      return [];
    }

    return {
      bfs,
      aStar,
    };
  })();

  const FogOfWar = (() => {
    /**
     * @param {number[][]} grid
     * @param {Vec2} pos
     * @param {number} radius
     * @returns {boolean[][]}
     */
    function compute(grid, pos, radius) {
      const h = grid.length;
      const w = grid[0].length;
      const visible = Array.from({ length: h }, () => Array(w).fill(false));
      const queue = [{ x: pos.x, y: pos.y, dist: 0 }];
      visible[pos.y][pos.x] = true;
      const dirs = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
      ];
      while (queue.length) {
        const current = queue.shift();
        for (const d of dirs) {
          const nx = current.x + d.x;
          const ny = current.y + d.y;
          const nd = current.dist + 1;
          if (nx >= 0 && ny >= 0 && nx < w && ny < h && nd <= radius && !visible[ny][nx]) {
            if (grid[ny][nx] === 0) {
              visible[ny][nx] = true;
              queue.push({ x: nx, y: ny, dist: nd });
            } else {
              visible[ny][nx] = true;
            }
          }
        }
      }
      return visible;
    }

    return {
      compute,
    };
  })();

  const Renderer = (() => {
    let tileSize = Config.TILE_BASE;
    let screenShake = 0;
    const particles = [];
    let displayWidth = 0;
    let displayHeight = 0;

    function resize(width, height) {
      displayWidth = Math.max(1, Math.floor(width));
      displayHeight = Math.max(1, Math.floor(height));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(displayWidth * dpr);
      canvas.height = Math.floor(displayHeight * dpr);
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function updateTileSize(grid) {
      tileSize = Math.max(
        4,
        Math.floor(Math.min(displayWidth / grid[0].length, displayHeight / grid.length))
      );
    }

    function addParticle(tileX, tileY, color) {
      particles.push({ tileX, tileY, life: 0.4, color });
    }

    function updateParticles(delta) {
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.life -= delta;
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }
    }

    function drawParticles() {
      particles.forEach((p) => {
        const px = p.tileX * tileSize + tileSize / 2;
        const py = p.tileY * tileSize + tileSize / 2 - (1 - p.life / 0.4) * tileSize * 0.3;
        ctx.globalAlpha = Math.max(p.life / 0.4, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, tileSize * 0.3 * (p.life / 0.4), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    function draw(game) {
      const grid = game.grid;
      updateTileSize(grid);
      const shakeX = ConfigStore.get('screenshake') ? Math.sin(performance.now() / 50) * screenShake : 0;
      const shakeY = ConfigStore.get('screenshake') ? Math.cos(performance.now() / 60) * screenShake : 0;
      ctx.save();
      ctx.translate(shakeX, shakeY);
      ctx.fillStyle = '#050a10';
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      for (let y = 0; y < grid.length; y += 1) {
        for (let x = 0; x < grid[0].length; x += 1) {
          const tile = grid[y][x];
          const px = x * tileSize;
          const py = y * tileSize;
          if (tile === 1) {
            ctx.fillStyle = '#142031';
            ctx.fillRect(px, py, tileSize, tileSize);
          } else {
            ctx.fillStyle = '#1b2d44';
            ctx.fillRect(px, py, tileSize, tileSize);
          }
        }
      }

      const fogVisible = (game.fogActive && ConfigStore.get('fog')) || game.debug.fogForce;

      // optional grid
      if (game.debug.grid) {
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= grid[0].length; x += 1) {
          const px = x * tileSize;
          ctx.beginPath();
          ctx.moveTo(px, 0);
          ctx.lineTo(px, grid.length * tileSize);
          ctx.stroke();
        }
        for (let y = 0; y <= grid.length; y += 1) {
          const py = y * tileSize;
          ctx.beginPath();
          ctx.moveTo(0, py);
          ctx.lineTo(grid[0].length * tileSize, py);
          ctx.stroke();
        }
      }

      // draw traps
      const trapColors = {
        slow: '#00f5d4',
        snare: '#ffbe0b',
        reverse: '#f94144',
        fog: '#adb5ff',
        noise: '#ff9e00',
      };
      const trapLabels = {
        slow: '減',
        snare: '拘',
        reverse: '逆',
        fog: '霧',
        noise: '音',
      };
      game.traps.forEach((trap) => {
        if (fogVisible && !game.visible[trap.y][trap.x]) return;
        const px = trap.x * tileSize + tileSize / 2;
        const py = trap.y * tileSize + tileSize / 2;
        ctx.save();
        ctx.strokeStyle = trapColors[trap.type] || '#f94144';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const pulse = 1 + Math.sin(performance.now() / 180 + trap.x + trap.y) * 0.2;
        ctx.arc(px, py, tileSize * 0.32 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = `${tileSize * 0.42}px "M PLUS 1p"`;
        ctx.fillStyle = trapColors[trap.type] || '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(trapLabels[trap.type] || '罠', px, py);
        ctx.restore();
      });

      // draw items
      game.items.forEach((item) => {
        if (fogVisible && !game.visible[item.y][item.x]) return;
        const px = item.x * tileSize + tileSize / 2;
        const py = item.y * tileSize + tileSize / 2;
        const colorMap = { attack: '#9ef01a', invincible: '#ffd60a', smoke: '#adb5ff' };
        const labelMap = { attack: '剣', invincible: '盾', smoke: '煙' };
        ctx.fillStyle = colorMap[item.type] || '#ffd60a';
        ctx.font = `${tileSize * 0.6}px "M PLUS 1p"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelMap[item.type] || '？', px, py);
      });

      // draw goal
      const goal = game.goal;
      ctx.strokeStyle = '#74c69d';
      ctx.lineWidth = 4;
      ctx.strokeRect(goal.x * tileSize + 4, goal.y * tileSize + 4, tileSize - 8, tileSize - 8);
      ctx.font = `${tileSize * 0.5}px sans-serif`;
      ctx.fillStyle = '#74c69d';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ゴ', goal.x * tileSize + tileSize / 2, goal.y * tileSize + tileSize / 2);

      // draw enemies
      game.enemies.forEach((enemy) => {
        if (fogVisible && !game.visible[enemy.tileY][enemy.tileX]) return;
        const ex = enemy.x * tileSize;
        const ey = enemy.y * tileSize;
        ctx.save();
        ctx.translate(ex, ey);
        ctx.fillStyle = enemy.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = enemy.outline;
        ctx.font = `${tileSize * 0.9}px "M PLUS 1p"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText('敵', 0, 0);
        ctx.fillText('敵', 0, 0);
        ctx.lineWidth = 2;
        ctx.beginPath();
        switch (enemy.type) {
          case 'SPRINT':
            ctx.moveTo(0, -tileSize * 0.6);
            ctx.lineTo(tileSize * 0.4, tileSize * 0.6);
            ctx.lineTo(-tileSize * 0.4, tileSize * 0.6);
            ctx.closePath();
            break;
          case 'STRATEGY':
            ctx.rect(-tileSize * 0.5, -tileSize * 0.5, tileSize, tileSize);
            break;
          case 'WANDER':
            ctx.arc(0, 0, tileSize * 0.55, 0, Math.PI * 2);
            break;
          case 'PATROL':
            ctx.moveTo(-tileSize * 0.5, -tileSize * 0.2);
            ctx.lineTo(tileSize * 0.5, -tileSize * 0.2);
            ctx.lineTo(tileSize * 0.2, tileSize * 0.6);
            ctx.lineTo(-tileSize * 0.2, tileSize * 0.6);
            ctx.closePath();
            break;
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.stroke();
        ctx.restore();
      });

      // draw player
      const pxPlayer = game.player.x * tileSize;
      const pyPlayer = game.player.y * tileSize;
      ctx.fillStyle = '#fffb8f';
      ctx.font = `${tileSize}px "M PLUS 1p"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 6;
      ctx.strokeText('私', pxPlayer, pyPlayer);
      ctx.fillText('私', pxPlayer, pyPlayer);

      if (fogVisible) {
        ctx.fillStyle = 'rgba(5,8,12,0.8)';
        ctx.beginPath();
        ctx.rect(0, 0, displayWidth, displayHeight);
        ctx.fill();
        ctx.globalCompositeOperation = 'destination-out';
        for (let y = 0; y < game.visible.length; y += 1) {
          for (let x = 0; x < game.visible[0].length; x += 1) {
            if (!game.visible[y][x]) continue;
            ctx.beginPath();
            ctx.rect(x * tileSize, y * tileSize, tileSize, tileSize);
            ctx.fill();
          }
        }
        ctx.globalCompositeOperation = 'source-over';
      }

      if (game.noise && game.noise.timer > 0) {
        const radius = tileSize * (1.2 + Math.sin(performance.now() / 120) * 0.3);
        ctx.strokeStyle = 'rgba(255, 158, 0, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc((game.noise.x + 0.5) * tileSize, (game.noise.y + 0.5) * tileSize, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      drawParticles();

      ctx.restore();
      screenShake = Math.max(0, screenShake - 0.5);
    }

    return {
      resize,
      draw,
      addParticle,
      setShake(power) {
        screenShake = Math.max(screenShake, power);
      },
      updateParticles,
      getTileSize() {
        return tileSize;
      },
    };
  })();

  const Items = (() => {
    const items = [];

    function spawn(grid, count, start, goal, level, metadata) {
      items.length = 0;
      const h = grid.length;
      const w = grid[0].length;
      const candidates = [];
      for (let y = 1; y < h - 1; y += 1) {
        for (let x = 1; x < w - 1; x += 1) {
          if (grid[y][x] === 0 && !(x === start.x && y === start.y) && !(x === goal.x && y === goal.y)) {
            candidates.push({ x, y });
          }
        }
      }
      if (!candidates.length) return;
      Utils.shuffle(candidates);
      const minItems = Math.max(1, Math.floor(level / 2));
      const total = Math.min(candidates.length, Math.max(count, minItems));
      const typesQueue = [];
      typesQueue.push('attack');
      if (total > 1) typesQueue.push('invincible');
      while (typesQueue.length < total) {
        if (Math.random() < Config.ITEM.smokeChance) {
          typesQueue.push('smoke');
        } else {
          typesQueue.push(Math.random() < 0.5 ? 'attack' : 'invincible');
        }
      }

      const startRange = candidates.filter((cell) => {
        const d = Math.abs(cell.x - start.x) + Math.abs(cell.y - start.y);
        return d >= 3 && d <= 8;
      });
      if (startRange.length) {
        const pick = startRange[0];
        items.push({ ...pick, type: 'attack' });
        const key = `${pick.x},${pick.y}`;
        for (let i = candidates.length - 1; i >= 0; i -= 1) {
          if (`${candidates[i].x},${candidates[i].y}` === key) {
            candidates.splice(i, 1);
            break;
          }
        }
        typesQueue.shift();
      }

      while (items.length < total && candidates.length) {
        const cell = candidates.shift();
        const type = typesQueue.shift() || 'attack';
        items.push({ ...cell, type });
      }

      if (metadata && metadata.rooms) {
        metadata.rooms.forEach((room) => {
          if (items.length >= total) return;
          const tiles = room.tiles ? [...room.tiles] : [];
          Utils.shuffle(tiles);
          const freeTile = tiles.find((tile) => !items.some((item) => item.x === tile.x && item.y === tile.y));
          if (freeTile) {
            items.push({ ...freeTile, type: 'invincible' });
          }
        });
      }
      items.splice(total);
    }

    function take(x, y) {
      const idx = items.findIndex((item) => item.x === x && item.y === y);
      if (idx >= 0) {
        return items.splice(idx, 1)[0];
      }
      return null;
    }

    return {
      items,
      spawn,
      take,
    };
  })();

  const Traps = (() => {
    const traps = [];
    const definitions = [
      { type: 'slow', minLevel: 1, weight: 3 },
      { type: 'snare', minLevel: 1, weight: 2 },
      { type: 'reverse', minLevel: 2, weight: 2 },
      { type: 'fog', minLevel: 3, weight: 2 },
      { type: 'noise', minLevel: 5, weight: 1 },
    ];

    function spawn(grid, count, start, goal, level, blocked = []) {
      traps.length = 0;
      const h = grid.length;
      const w = grid[0].length;
      const candidates = [];
      const blockedKey = new Set(blocked.map((b) => `${b.x},${b.y}`));
      for (let y = 1; y < h - 1; y += 1) {
        for (let x = 1; x < w - 1; x += 1) {
          if (grid[y][x] === 0 && !(x === start.x && y === start.y) && !(x === goal.x && y === goal.y)) {
            if ((x + y) % 3 === 0) continue;
            if (blockedKey.has(`${x},${y}`)) continue;
            candidates.push({ x, y });
          }
        }
      }
      Utils.shuffle(candidates);
      const pool = [];
      definitions
        .filter((def) => level >= def.minLevel)
        .forEach((def) => {
          const weight = def.weight + Math.max(0, Math.floor((level - def.minLevel) / 3));
          for (let i = 0; i < weight; i += 1) {
            pool.push(def.type);
          }
        });
      for (let i = 0; i < count && i < candidates.length && pool.length; i += 1) {
        const type = pool[Utils.randInt(pool.length)];
        traps.push({ ...candidates[i], type });
      }
    }

    function find(x, y) {
      return traps.find((trap) => trap.x === x && trap.y === y);
    }

    function consume(x, y) {
      const index = traps.findIndex((trap) => trap.x === x && trap.y === y);
      if (index >= 0) {
        return traps.splice(index, 1)[0];
      }
      return null;
    }

    return {
      traps,
      spawn,
      find,
      consume,
    };
  })();

  const Player = (() => {
    const state = {
      x: 0,
      y: 0,
      tileX: 0,
      tileY: 0,
      attackTimer: 0,
      invincibleTimer: 0,
      trapTimer: 0,
      trapType: null,
      freezeTimer: 0,
      speed: Config.PLAYER.baseSpeed,
      dashTimer: 0,
      dashCooldown: 0,
      smokeTimer: 0,
      smokeCharges: 0,
      lastMoveDir: { x: 0, y: 0 },
    };

    function reset(pos) {
      state.tileX = pos.x;
      state.tileY = pos.y;
      state.x = pos.x + 0.5;
      state.y = pos.y + 0.5;
      state.attackTimer = 0;
      state.invincibleTimer = 0;
      state.trapTimer = 0;
      state.trapType = null;
      state.freezeTimer = 0;
      state.speed = Config.PLAYER.baseSpeed;
      state.dashTimer = 0;
      state.dashCooldown = 0;
      state.smokeTimer = 0;
      state.smokeCharges = 0;
      state.lastMoveDir = { x: 0, y: 0 };
    }

    function update(delta, grid) {
      if (state.freezeTimer > 0) {
        state.freezeTimer -= delta;
        return;
      }
      const reverse = state.trapType === 'reverse';
      const dir = Input.getDirection(reverse);
      const centerX = state.tileX + 0.5;
      const centerY = state.tileY + 0.5;
      let moveX = Math.sign(dir.x || 0);
      let moveY = Math.sign(dir.y || 0);
      if (moveX !== 0 && Math.abs(state.y - centerY) > 0.35 && moveY !== 0) {
        moveX = 0;
      }
      if (moveX !== 0 && Math.abs(state.y - centerY) > 0.35) {
        moveX = 0;
        if (moveY !== 0) {
          state.y = Utils.lerp(state.y, centerY, 0.45);
        }
      }
      if (moveY !== 0 && Math.abs(state.x - centerX) > 0.35) {
        moveY = 0;
        if (moveX !== 0) {
          state.x = Utils.lerp(state.x, centerX, 0.45);
        }
      }
      if (moveX !== 0 && moveY !== 0) {
        moveX = Math.abs(dir.x) >= Math.abs(dir.y) ? Math.sign(dir.x) : 0;
        moveY = moveX === 0 ? Math.sign(dir.y) : 0;
      }
      const length = Math.hypot(moveX, moveY) || 1;
      moveX /= length;
      moveY /= length;
      let speed = state.speed;
      if (state.trapType === 'slow') speed *= Config.PLAYER.slowFactor;
      if (state.dashTimer > 0) speed *= Config.PLAYER.dashMultiplier;
      const newX = state.x + moveX * delta * speed;
      const newY = state.y + moveY * delta * speed;

      const tryMove = (nx, ny) => {
        const tx = Math.floor(nx);
        const ty = Math.floor(ny);
        if (grid[ty] && grid[ty][tx] === 0) {
          state.x = nx;
          state.y = ny;
          if (tx !== state.tileX || ty !== state.tileY) {
            state.tileX = tx;
            state.tileY = ty;
            Input.notifyStep();
          }
        }
      };

      const prevTileX = state.tileX;
      const prevTileY = state.tileY;
      tryMove(newX, state.y);
      tryMove(state.x, newY);
      if (state.tileX !== prevTileX || state.tileY !== prevTileY) {
        state.lastMoveDir = { x: moveX, y: moveY };
      }

      if (state.attackTimer > 0) state.attackTimer -= delta;
      if (state.invincibleTimer > 0) state.invincibleTimer -= delta;
      if (state.trapTimer > 0) {
        if (state.trapType !== 'fog' && state.trapType !== 'noise') {
          state.trapTimer -= delta;
        }
        if (state.trapTimer <= 0.0001) {
          state.trapTimer = 0;
          state.trapType = null;
          Input.setPadLabels(false);
        }
      }
      if (state.dashTimer > 0) {
        state.dashTimer = Math.max(0, state.dashTimer - delta);
      }
      if (state.dashCooldown > 0) {
        state.dashCooldown = Math.max(0, state.dashCooldown - delta);
      }
      if (state.smokeTimer > 0) {
        state.smokeTimer = Math.max(0, state.smokeTimer - delta);
      }
    }

    return {
      state,
      reset,
      update,
      tryDash() {
        if (state.dashCooldown > 0 || state.freezeTimer > 0) return false;
        state.dashTimer = Config.PLAYER.dashDuration;
        state.dashCooldown = Config.PLAYER.dashCooldown;
        return true;
      },
      addSmokeCharge() {
        state.smokeCharges += 1;
      },
      useSmoke() {
        if (state.smokeCharges <= 0 || state.smokeTimer > 0) return false;
        state.smokeCharges -= 1;
        state.smokeTimer = Config.PLAYER.smokeDuration;
        return true;
      },
    };
  })();

  const EnemyManager = (() => {
    const enemies = [];
    let difficultyLevel = 1;
    let mazeMeta = { rooms: [], widened: [], junctions: [] };
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];

    function countOpenNeighbors(grid, x, y) {
      return dirs.reduce((sum, d) => (grid[y + d.y] && grid[y + d.y][x + d.x] === 0 ? sum + 1 : sum), 0);
    }

    function isNarrowCorridor(grid, x, y) {
      const neighbors = dirs
        .filter((d) => grid[y + d.y] && grid[y + d.y][x + d.x] === 0)
        .map((d) => ({ x: d.x, y: d.y }));
      if (neighbors.length !== 2) return false;
      const [a, b] = neighbors;
      return a.x === -b.x && a.y === -b.y;
    }

    function createPatrolTargets(grid, start) {
      const targets = [];
      dirs.forEach((dir) => {
        let cx = start.x;
        let cy = start.y;
        while (grid[cy + dir.y] && grid[cy + dir.y][cx + dir.x] === 0) {
          cx += dir.x;
          cy += dir.y;
        }
        if (!(cx === start.x && cy === start.y)) {
          targets.push({ x: cx, y: cy });
        }
      });
      return targets.length ? targets : [{ x: start.x, y: start.y }];
    }

    function createEnemy(type, start, grid) {
      const base = Config.ENEMIES[type];
      const enemy = {
        type,
        color: base.color,
        outline: base.outline,
        speedFactor: base.speedFactor,
        view: base.view,
        pathCooldown: Utils.randRange(Config.ENEMY_BEHAVIOR.pathIntervalMin, Config.ENEMY_BEHAVIOR.pathIntervalMax),
        x: start.x + 0.5,
        y: start.y + 0.5,
        tileX: start.x,
        tileY: start.y,
        path: [],
        currentTarget: null,
        chaseMode: false,
        patrolTargets: [],
        patrolIndex: 0,
        graceTimer: Config.ENEMY_BEHAVIOR.chaseGrace,
        waitTimer: 0,
        home: { x: start.x, y: start.y },
        returning: false,
        wanderTimer: Utils.randRange(0.3, 1.2),
      };
      if (type === 'PATROL') {
        enemy.patrolTargets = createPatrolTargets(grid, start);
      }
      return enemy;
    }

    function gatherPool(cells = []) {
      const copy = cells.map((c) => ({ x: c.x, y: c.y }));
      Utils.shuffle(copy);
      return copy;
    }

    function selectSpawn(pool, grid, start, goal, used) {
      while (pool.length) {
        const cell = pool.shift();
        const key = `${cell.x},${cell.y}`;
        if (used.has(key)) continue;
        if (grid[cell.y][cell.x] !== 0) continue;
        if (cell.x === goal.x && cell.y === goal.y) continue;
        const dist = Math.hypot(cell.x - start.x, cell.y - start.y);
        if (dist < 6) continue;
        if (isNarrowCorridor(grid, cell.x, cell.y)) continue;
        used.add(key);
        return cell;
      }
      return null;
    }

    function spawn(grid, count, start, goal, level, metadata = { rooms: [], widened: [], junctions: [] }) {
      difficultyLevel = level;
      mazeMeta = metadata || { rooms: [], widened: [], junctions: [] };
      enemies.length = 0;
      const used = new Set();

      const roomTiles = gatherPool(
        (mazeMeta.rooms || []).flatMap((room) => room.tiles || [{ x: room.center?.x || start.x, y: room.center?.y || start.y }])
      );
      const wideTiles = gatherPool(mazeMeta.widened || []);
      const junctionTiles = gatherPool(mazeMeta.junctions || []);
      const generalTiles = [];
      for (let y = 1; y < grid.length - 1; y += 1) {
        for (let x = 1; x < grid[0].length - 1; x += 1) {
          if (grid[y][x] !== 0) continue;
          generalTiles.push({ x, y });
        }
      }
      Utils.shuffle(generalTiles);

      const placements = [];
      const roomCell = selectSpawn(roomTiles, grid, start, goal, used);
      if (roomCell) placements.push(roomCell);
      if (placements.length < count) {
        const wideCell = selectSpawn(wideTiles, grid, start, goal, used);
        if (wideCell) placements.push(wideCell);
      }
      while (placements.length < count) {
        const branchCell = selectSpawn(junctionTiles, grid, start, goal, used);
        if (!branchCell) break;
        placements.push(branchCell);
      }
      while (placements.length < count) {
        const cell = selectSpawn(generalTiles, grid, start, goal, used);
        if (!cell) break;
        placements.push(cell);
      }

      const typePool = ['SPRINT', 'WANDER'];
      if (level >= 2) typePool.push('STRATEGY');
      if (level >= 3) typePool.push('SPRINT');
      if (level >= 4) typePool.push('PATROL');
      if (level >= 6) typePool.push('STRATEGY', 'SPRINT');
      if (level >= 8) typePool.push('PATROL', 'WANDER');

      placements.slice(0, count).forEach((cell) => {
        const type = typePool[Utils.randInt(typePool.length)];
        enemies.push(createEnemy(type, cell, grid));
      });
    }

    function planPath(enemy, grid, target, useAStar) {
      if (!target) return false;
      const start = { x: enemy.tileX, y: enemy.tileY };
      const path = useAStar ? Pathfinding.aStar(grid, start, target) : Pathfinding.bfs(grid, start, target);
      if (path.length) {
        enemy.path = path;
        enemy.currentTarget = { ...target };
        enemy.pathCooldown = Utils.randRange(Config.ENEMY_BEHAVIOR.pathIntervalMin, Config.ENEMY_BEHAVIOR.pathIntervalMax);
        return true;
      }
      return false;
    }

    function randomStep(enemy, grid) {
      const options = dirs
        .map((dir) => ({ x: enemy.tileX + dir.x, y: enemy.tileY + dir.y }))
        .filter((pos) => grid[pos.y] && grid[pos.y][pos.x] === 0);
      if (options.length) {
        const pick = options[Utils.randInt(options.length)];
        enemy.path = [{ x: pick.x, y: pick.y }];
        enemy.currentTarget = { ...pick };
      }
    }

    function applyDensityControl() {
      const zoneMap = new Map();
      const zoneSize = Config.ENEMY_BEHAVIOR.densityZone;
      enemies.forEach((enemy) => {
        const zx = Math.floor(enemy.tileX / zoneSize);
        const zy = Math.floor(enemy.tileY / zoneSize);
        const key = `${zx},${zy}`;
        if (!zoneMap.has(key)) zoneMap.set(key, []);
        zoneMap.get(key).push(enemy);
      });
      zoneMap.forEach((list) => {
        if (list.length > Config.ENEMY_BEHAVIOR.densityLimit) {
          list
            .slice(Config.ENEMY_BEHAVIOR.densityLimit)
            .forEach((enemy) => {
              enemy.waitTimer = Math.max(enemy.waitTimer, Config.ENEMY_BEHAVIOR.densityCooldown);
              enemy.path = [];
            });
        }
      });
    }

    function update(delta, grid, player, options = {}) {
      const playerTile = { x: player.tileX, y: player.tileY };
      const noise = options.noise || { timer: 0 };
      const smokeActive = player.smokeTimer > 0;
      const baseSpeed = Config.LEVEL.baseEnemySpeed + (difficultyLevel - 1) * Config.LEVEL.speedStep;

      applyDensityControl();

      let pathBudget = Config.MAX_FRAME_PATHFIND;
      enemies.forEach((enemy) => {
        if (enemy.dead) return;
        enemy.graceTimer = Math.max(0, enemy.graceTimer - delta);
        if (enemy.waitTimer > 0) {
          enemy.waitTimer = Math.max(0, enemy.waitTimer - delta);
        }
        enemy.pathCooldown -= delta;
        enemy.wanderTimer -= delta;

        const noiseActive = noise.timer > 0;
        const distance = Math.abs(enemy.tileX - playerTile.x) + Math.abs(enemy.tileY - playerTile.y);
        let desiredTarget = null;
        let useAStar = false;
        let vision = enemy.view;
        if (smokeActive) {
          vision = Math.max(2, Math.floor(vision * 0.5));
        }

        if (enemy.waitTimer <= 0) {
          if (noiseActive) {
            desiredTarget = { x: noise.x, y: noise.y };
          } else if (enemy.graceTimer <= 0) {
            switch (enemy.type) {
              case 'STRATEGY': {
                if (distance <= vision * 1.2) {
                  const predicted = { x: playerTile.x, y: playerTile.y };
                  if (player.lastMoveDir) {
                    predicted.x += Math.sign(player.lastMoveDir.x) * Math.min(2, Math.abs(player.lastMoveDir.x) > 0 ? 2 : 0);
                    predicted.y += Math.sign(player.lastMoveDir.y) * Math.min(2, Math.abs(player.lastMoveDir.y) > 0 ? 2 : 0);
                    if (grid[predicted.y] && grid[predicted.y][predicted.x] === 0) {
                      desiredTarget = predicted;
                    }
                  }
                }
                if (!desiredTarget) {
                  desiredTarget = playerTile;
                  useAStar = true;
                }
                break;
              }
              case 'SPRINT':
                if (distance <= vision) {
                  desiredTarget = playerTile;
                }
                break;
              case 'WANDER':
                if (distance <= vision || enemy.chaseMode) {
                  enemy.chaseMode = true;
                  if (distance > vision * 2 && !noiseActive) {
                    enemy.chaseMode = false;
                  } else {
                    desiredTarget = playerTile;
                  }
                }
                break;
              case 'PATROL':
                if (distance <= vision) {
                  desiredTarget = playerTile;
                }
                break;
            }
          }
        }

        if (!desiredTarget && enemy.returning) {
          desiredTarget = { ...enemy.home };
        }

        if (!desiredTarget && enemy.type === 'PATROL' && enemy.waitTimer <= 0 && enemy.patrolTargets.length) {
          const current = enemy.patrolTargets[enemy.patrolIndex];
          if (enemy.tileX === current.x && enemy.tileY === current.y) {
            enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolTargets.length;
          }
          desiredTarget = enemy.patrolTargets[enemy.patrolIndex];
        }

        if (desiredTarget && enemy.waitTimer <= 0 && enemy.pathCooldown <= 0 && pathBudget > 0) {
          if (planPath(enemy, grid, desiredTarget, useAStar)) {
            pathBudget -= 1;
            const plannedLength = enemy.path.length;
            if (!enemy.returning && plannedLength > Config.ENEMY_BEHAVIOR.leashDistance) {
              enemy.returning = true;
              planPath(enemy, grid, enemy.home, false);
            } else if (enemy.returning && plannedLength === 0) {
              enemy.returning = false;
            } else if (!enemy.returning) {
              enemy.returning = false;
            }
          } else {
            enemy.pathCooldown = Utils.randRange(Config.ENEMY_BEHAVIOR.pathIntervalMin, Config.ENEMY_BEHAVIOR.pathIntervalMax);
          }
        }

        if (!enemy.path.length && enemy.waitTimer <= 0 && enemy.pathCooldown <= 0) {
          randomStep(enemy, grid);
          enemy.pathCooldown = Utils.randRange(Config.ENEMY_BEHAVIOR.pathIntervalMin, Config.ENEMY_BEHAVIOR.pathIntervalMax);
        }

        const speedFactor =
          enemy.speedFactor * (distance <= Config.ENEMY_BEHAVIOR.closeDistanceSlow ? Config.ENEMY_BEHAVIOR.closeSpeedFactor : 1);
        const noiseBoost = noiseActive ? 1 + Config.TRAP.noisePullStrength : 1;
        let speed = baseSpeed * speedFactor * noiseBoost * delta;
        if (enemy.waitTimer > 0) speed = 0;

        if (enemy.path.length) {
          const next = enemy.path[0];
          const targetX = next.x + 0.5;
          const targetY = next.y + 0.5;
          const dx = targetX - enemy.x;
          const dy = targetY - enemy.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= speed || dist < 0.0001) {
            enemy.x = targetX;
            enemy.y = targetY;
            enemy.tileX = next.x;
            enemy.tileY = next.y;
            enemy.path.shift();
          } else if (dist > 0) {
            enemy.x += (dx / dist) * speed;
            enemy.y += (dy / dist) * speed;
          }
        } else if (enemy.wanderTimer <= 0 && enemy.waitTimer <= 0) {
          randomStep(enemy, grid);
          enemy.wanderTimer = Utils.randRange(0.6, 1.6);
          enemy.pathCooldown = Utils.randRange(
            Config.ENEMY_BEHAVIOR.pathIntervalMin,
            Config.ENEMY_BEHAVIOR.pathIntervalMax
          );
        }
      });

      for (let i = enemies.length - 1; i >= 0; i -= 1) {
        if (enemies[i].dead) {
          enemies.splice(i, 1);
        }
      }
    }

    return {
      enemies,
      spawn,
      update,
    };
  })();


  const Ranking = (() => {
    let enabled = true;
    const STORAGE_KEY = 'meiro-ranking-v1';
    let data = [];

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      data = saved ? JSON.parse(saved) : [];
    } catch (err) {
      enabled = false;
      document.getElementById('open-ranking').disabled = true;
      document.getElementById('open-ranking').textContent = '🏆 ランキング不可';
      dom.rankingList.innerHTML = '<li>ランキングは利用できません</li>';
    }

    function save() {
      if (!enabled) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.slice(0, 10)));
      } catch (err) {
        enabled = false;
      }
    }

    return {
      add(entry) {
        if (!enabled) return;
        data.push(entry);
        data.sort((a, b) => b.score - a.score);
        data = data.slice(0, 10);
        save();
      },
      list() {
        return data;
      },
      reset() {
        if (!enabled) return;
        data = [];
        save();
      },
      enabled: () => enabled,
    };
  })();

  const Score = (() => {
    let current = 0;
    return {
      reset() {
        current = 0;
      },
      addLevel(level, time) {
        const base = Config.SCORE.base * level;
        const timePenalty = time * Config.SCORE.timePenalty;
        current += Math.max(100, base - timePenalty);
      },
      get() {
        return Math.floor(current);
      },
    };
  })();

  const GameState = (() => {
    const state = {
      level: 1,
      playing: false,
      paused: false,
      grid: [],
      start: { x: 1, y: 1 },
      goal: { x: 0, y: 0 },
      enemies: EnemyManager.enemies,
      items: Items.items,
      traps: Traps.traps,
      player: Player.state,
      visible: [],
      fog: { timer: 0, radius: Config.TRAP.fogRadiusBase },
      noise: { timer: 0, x: 0, y: 0 },
      fogActive: false,
      time: 0,
      totalTime: 0,
      lastUpdate: Utils.now(),
      debug: { grid: false, fogForce: false },
      loading: false,
      mazeMeta: { rooms: [], widened: [], junctions: [] },
    };

    function fullVisibility(grid) {
      return grid.map((row) => row.map(() => true));
    }

    function computeMazeSize(level) {
      const baseW = Config.LEVEL.baseSize.w + (level - 1) * Config.LEVEL.sizeStep;
      const baseH = Config.LEVEL.baseSize.h + (level - 1) * Config.LEVEL.sizeStep;
      let cols = baseW;
      let rows = baseH;
      const canvasWidth = canvas.clientWidth || window.innerWidth;
      const canvasHeight = canvas.clientHeight || window.innerHeight;
      let tile = Math.floor(Math.min(canvasWidth / cols, canvasHeight / rows));
      while (
        tile < Config.TILE_MIN &&
        (cols > Config.LEVEL.baseSize.w || rows > Config.LEVEL.baseSize.h)
      ) {
        if (cols > Config.LEVEL.baseSize.w) cols = Math.max(Config.LEVEL.baseSize.w, cols - Config.LEVEL.sizeStep);
        if (rows > Config.LEVEL.baseSize.h) rows = Math.max(Config.LEVEL.baseSize.h, rows - Config.LEVEL.sizeStep);
        tile = Math.floor(Math.min(canvasWidth / cols, canvasHeight / rows));
      }
      return { cols, rows };
    }

    function setupLevel() {
      state.loading = true;
      dom.loading.classList.remove('hidden');
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          const { cols, rows } = computeMazeSize(state.level);
          const { grid: maze, metadata } = Maze.generate(cols, rows);
          state.grid = maze;
          state.mazeMeta = metadata;
          state.start = { x: 1, y: 1 };
          state.goal = { x: maze[0].length - 2, y: maze.length - 2 };
          Player.reset(state.start);
          Input.setPadLabels(false);
          const minItemsByLevel = Math.max(1, Math.floor(state.level / 2));
          const baseItems = Math.floor(Config.LEVEL.baseItems * Math.pow(Config.LEVEL.itemDropDecay, state.level - 1));
          const itemCount = Math.max(minItemsByLevel, baseItems);
          Items.spawn(maze, itemCount, state.start, state.goal, state.level, metadata);
          const trapCount = Config.LEVEL.baseTraps + state.level;
          Traps.spawn(maze, trapCount, state.start, state.goal, state.level, Items.items);
          const enemyCount = Math.min(Config.LEVEL.baseEnemies + state.level, Config.LEVEL.maxEnemies);
          EnemyManager.spawn(maze, enemyCount, state.start, state.goal, state.level, metadata);
          state.fog.timer = 0;
          state.fog.radius = Math.max(
            3,
            Math.floor(ConfigStore.get('viewRadius') - (state.level - 1) * Config.TRAP.fogRadiusLevelStep)
          );
          state.noise.timer = 0;
          state.noise.x = -1;
          state.noise.y = -1;
          state.fogActive = false;
          state.visible = fullVisibility(maze);
          state.time = 0;
          state.loading = false;
          dom.loading.classList.add('hidden');
          Renderer.draw(state);
          resolve();
        });
      });
    }

    async function startGame() {
      state.level = 1;
      Score.reset();
      state.playing = false;
      state.paused = false;
      state.totalTime = 0;
      state.lastUpdate = Utils.now();
      dom.resultForm.classList.remove('hidden');
      dom.pauseOverlay.classList.add('hidden');
      dom.rankingPanel.classList.add('hidden');
      showOverlay(null);
      await setupLevel();
      dom.pauseButton.disabled = false;
      dom.virtualPad.setAttribute('aria-hidden', Input.getPadState() === 'hidden' ? 'true' : 'false');
      state.playing = true;
      state.paused = false;
      Audio.play('start');
      dom.pauseButton.textContent = '⏸ ポーズ';
    }

    async function nextLevel() {
      state.playing = false;
      state.paused = false;
      state.level += 1;
      dom.pauseOverlay.classList.add('hidden');
      dom.pauseButton.disabled = true;
      await setupLevel();
      dom.pauseButton.disabled = false;
      state.playing = true;
      state.paused = false;
      Audio.play('start');
      dom.pauseButton.textContent = '⏸ ポーズ';
    }

    function gameOver(win) {
      state.playing = false;
      dom.virtualPad.setAttribute('aria-hidden', 'true');
      dom.pauseButton.disabled = true;
      dom.pauseOverlay.classList.add('hidden');
      showOverlay('result');
      dom.resultScore.textContent = Score.get().toString();
      dom.resultLevel.textContent = state.level.toString();
      dom.resultTime.textContent = Utils.formatTime(state.totalTime);
      dom.resultForm.classList.remove('hidden');
      dom.pauseButton.textContent = '⏸ ポーズ';
      if (win) {
        Renderer.addParticle(state.goal.x, state.goal.y, '#fff');
      }
      Renderer.draw(state);
    }

    function update() {
      const now = Utils.now();
      const delta = Math.min(0.05, now - state.lastUpdate);
      state.lastUpdate = now;
      dom.pauseOverlay.classList.toggle('hidden', !(state.paused && state.playing));
      if (state.paused || !state.playing) return;
      state.time += delta;
      state.totalTime += delta;
      Player.update(delta, state.grid);

      if (Input.consumeDash()) {
        if (Player.tryDash() && ConfigStore.get('vibration') && navigator.vibrate) {
          navigator.vibrate(20);
        }
      }
      if (Input.consumeSmoke()) {
        if (Player.useSmoke()) {
          Audio.play('item');
          Renderer.addParticle(state.player.tileX, state.player.tileY, '#adb5ff');
        }
      }

      if (state.player.invincibleTimer > 0) {
        if (state.player.trapTimer > 0 || state.player.trapType) {
          state.player.trapTimer = 0;
          state.player.trapType = null;
          Input.setPadLabels(false);
        }
        state.fog.timer = 0;
        state.noise.timer = 0;
        state.noise.x = -1;
        state.noise.y = -1;
      }

      if (state.fog.timer > 0) {
        state.fog.timer = Math.max(0, state.fog.timer - delta);
        state.fogActive = true;
        if (state.player.trapType === 'fog') {
          state.player.trapTimer = state.fog.timer;
          if (state.fog.timer <= 0) {
            state.player.trapType = null;
            state.player.trapTimer = 0;
          }
        }
        if (state.fog.timer <= 0) {
          state.fogActive = false;
        }
      } else {
        state.fogActive = false;
      }

      if (state.noise.timer > 0) {
        state.noise.timer = Math.max(0, state.noise.timer - delta);
        if (state.player.trapType === 'noise') {
          state.player.trapTimer = state.noise.timer;
          if (state.noise.timer <= 0) {
            state.player.trapType = null;
            state.player.trapTimer = 0;
            state.noise.x = -1;
            state.noise.y = -1;
          }
        }
      } else if (state.player.trapType === 'noise') {
        state.player.trapType = null;
        state.player.trapTimer = 0;
        state.noise.x = -1;
        state.noise.y = -1;
      }

      EnemyManager.update(delta, state.grid, state.player, { noise: state.noise });
      Renderer.updateParticles(delta);

      const fogShouldRender =
        (state.fogActive && ConfigStore.get('fog')) || state.debug.fogForce;
      state.visible = fogShouldRender
        ? FogOfWar.compute(state.grid, { x: state.player.tileX, y: state.player.tileY }, state.fog.radius)
        : fullVisibility(state.grid);

      // check item pickup
      const item = Items.take(state.player.tileX, state.player.tileY);
      if (item) {
        if (ConfigStore.get('vibration') && navigator.vibrate) navigator.vibrate(30);
        let particleColor = '#9ef01a';
        switch (item.type) {
          case 'attack':
            state.player.attackTimer = Config.ITEM.attackDuration;
            particleColor = '#9ef01a';
            break;
          case 'invincible':
            state.player.invincibleTimer = Config.ITEM.invincibleDuration;
            state.player.trapType = null;
            state.player.trapTimer = 0;
            Input.setPadLabels(false);
            particleColor = '#ffd60a';
            break;
          case 'smoke':
            Player.addSmokeCharge();
            particleColor = '#adb5ff';
            break;
        }
        Audio.play('item');
        Renderer.addParticle(state.player.tileX, state.player.tileY, particleColor);
      }

      // check traps
      const trap = Traps.find(state.player.tileX, state.player.tileY);
      if (trap && state.player.invincibleTimer <= 0) {
        const trapIntensity = 1 + Math.min(0.5, (state.level - 1) * 0.05);
        let activated = false;
        switch (trap.type) {
          case 'slow':
            if (state.player.trapTimer <= 0) {
              state.player.trapType = 'slow';
              state.player.trapTimer = Config.TRAP.slowDuration * trapIntensity;
              activated = true;
            }
            break;
          case 'snare':
            if (state.player.trapTimer <= 0) {
              state.player.freezeTimer = Config.TRAP.snareDuration * trapIntensity;
              state.player.trapType = 'snare';
              state.player.trapTimer = Config.TRAP.snareDuration * trapIntensity;
              activated = true;
            }
            break;
          case 'reverse':
            if (state.player.trapTimer <= 0) {
              state.player.trapType = 'reverse';
              state.player.trapTimer = Config.TRAP.reverseDuration * trapIntensity;
              Input.setPadLabels(true);
              activated = true;
            }
            break;
          case 'fog':
            state.fog.timer = Config.TRAP.fogDuration * trapIntensity;
            state.fog.radius = Math.max(
              3,
              Math.floor(ConfigStore.get('viewRadius') - (state.level - 1) * Config.TRAP.fogRadiusLevelStep)
            );
            state.player.trapType = 'fog';
            state.player.trapTimer = state.fog.timer;
            state.fogActive = true;
            activated = true;
            break;
          case 'noise':
            state.noise.timer = Config.TRAP.noiseDuration * trapIntensity;
            state.noise.x = trap.x;
            state.noise.y = trap.y;
            state.player.trapType = 'noise';
            state.player.trapTimer = state.noise.timer;
            activated = true;
            break;
        }
        if (activated) {
          Traps.consume(state.player.tileX, state.player.tileY);
          if (ConfigStore.get('vibration') && navigator.vibrate) navigator.vibrate([60, 20, 60]);
          Audio.play('trap');
          const colorMap = {
            slow: '#00f5d4',
            snare: '#ffbe0b',
            reverse: '#f94144',
            fog: '#adb5ff',
            noise: '#ff9e00',
          };
          Renderer.setShake(trap.type === 'fog' ? 3 : trap.type === 'noise' ? 4 : 5);
          Renderer.addParticle(state.player.tileX, state.player.tileY, colorMap[trap.type] || '#f94144');
        }
      }

      if (state.player.invincibleTimer > 0 && state.player.trapType === 'snare') {
        state.player.trapType = null;
        Input.setPadLabels(false);
      }

      // collisions
      state.enemies.forEach((enemy) => {
        const dist = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
        if (dist < 0.6) {
          if (state.player.attackTimer > 0) {
            enemy.dead = true;
            Renderer.addParticle(enemy.tileX, enemy.tileY, '#ff6b6b');
          } else if (state.player.invincibleTimer > 0) {
            Renderer.setShake(6);
          } else {
            Audio.play('hit');
            Renderer.setShake(12);
            gameOver(false);
          }
        }
      });
      // goal check
      if (state.player.tileX === state.goal.x && state.player.tileY === state.goal.y) {
        state.playing = false;
        Score.addLevel(state.level, state.time);
        Audio.play('goal');
        Renderer.addParticle(state.player.tileX, state.player.tileY, '#74c69d');
        nextLevel();
      }
    }

    async function preparePreview() {
      state.level = 1;
      state.playing = false;
      state.paused = false;
      Score.reset();
      state.totalTime = 0;
      dom.virtualPad.setAttribute('aria-hidden', 'true');
      dom.pauseButton.disabled = true;
      dom.pauseButton.textContent = '⏸ ポーズ';
      dom.pauseOverlay.classList.add('hidden');
      await setupLevel();
      Renderer.draw(state);
    }

    return {
      state,
      startGame,
      nextLevel,
      update,
      setupLevel,
      gameOver,
      preparePreview,
    };
  })();

  function renderLoop() {
    requestAnimationFrame(renderLoop);
    GameState.update();
    if (GameState.state.playing) {
      Renderer.draw(GameState.state);
    }
  }

  function showOverlay(name) {
    Object.entries(dom.overlays).forEach(([key, el]) => {
      if (!el) return;
      if (key === name) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
  }

  function renderRanking() {
    dom.rankingList.innerHTML = '';
    if (!Ranking.enabled()) {
      dom.rankingList.innerHTML = '<li>ランキングは利用できません</li>';
    } else {
      const list = Ranking.list();
      if (!list.length) {
        dom.rankingList.innerHTML = '<li>記録なし</li>';
        return;
      }
      list.forEach((entry) => {
        const li = document.createElement('li');
        li.textContent = `${entry.initials} : ${entry.score}点 Lv${entry.level} ${entry.time}s (${entry.date})`;
        dom.rankingList.appendChild(li);
      });
    }
  }

  function updateHUD() {
    const player = GameState.state.player;
    dom.hudLevel.textContent = GameState.state.level.toString();
    dom.hudScore.textContent = Score.get().toString();
    const trapLabelMap = {
      slow: '減速',
      snare: '拘束',
      reverse: '逆操作',
      fog: '霧',
      noise: 'ノイズ',
    };
    dom.statusAttack.textContent = player.attackTimer > 0 ? `${player.attackTimer.toFixed(1)}s` : '-';
    dom.statusInvincible.textContent = player.invincibleTimer > 0 ? `${player.invincibleTimer.toFixed(1)}s` : '-';
    dom.statusTrap.textContent =
      player.trapTimer > 0 && player.trapType
        ? `${trapLabelMap[player.trapType] || ''} ${player.trapTimer.toFixed(1)}s`
        : '-';
    const fieldStatuses = [];
    if (GameState.state.fog.timer > 0 && ConfigStore.get('fog')) {
      fieldStatuses.push(`フォグ ${GameState.state.fog.timer.toFixed(1)}s`);
    }
    if (GameState.state.noise.timer > 0) {
      fieldStatuses.push(`ノイズ ${GameState.state.noise.timer.toFixed(1)}s`);
    }
    dom.statusField.textContent = fieldStatuses.length ? fieldStatuses.join(' / ') : '-';
    dom.statusDash.textContent =
      player.dashCooldown > 0 ? `${player.dashCooldown.toFixed(1)}s` : 'Ready';
    dom.statusSmoke.textContent =
      player.smokeTimer > 0 ? `${player.smokeTimer.toFixed(1)}s` : `${player.smokeCharges}`;
    dom.dashButton.disabled = player.dashCooldown > 0;
    dom.smokeButton.disabled = player.smokeTimer > 0 || player.smokeCharges <= 0;
  }

  function hudLoop() {
    updateHUD();
    requestAnimationFrame(hudLoop);
  }

  function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    Renderer.resize(width, height);
    if (GameState.state.grid.length) {
      Renderer.draw(GameState.state);
    }
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  renderLoop();
  hudLoop();

  showOverlay('title');
  GameState.preparePreview();

  const tutorialKey = 'maze-dpad-tutorial-v1';
  let tutorialSeen = false;
  try {
    tutorialSeen = localStorage.getItem(tutorialKey) === '1';
  } catch (err) {
    tutorialSeen = false;
  }
  if (!tutorialSeen) {
    dom.tutorial.classList.remove('hidden');
  }

  dom.tutorialClose.addEventListener('click', () => {
    dom.tutorial.classList.add('hidden');
    try {
      localStorage.setItem(tutorialKey, '1');
    } catch (err) {
      // ignore
    }
  });

  dom.startButton.addEventListener('click', () => {
    GameState.startGame();
  });

  dom.retryButton.addEventListener('click', () => {
    GameState.startGame();
  });

  dom.backTitle.addEventListener('click', () => {
    showOverlay('title');
    dom.rankingPanel.classList.add('hidden');
    GameState.preparePreview();
  });

  dom.howtoBtn.addEventListener('click', () => {
    dom.howto.classList.toggle('hidden');
  });

  dom.openRanking.addEventListener('click', () => {
    dom.rankingPanel.classList.remove('hidden');
    renderRanking();
  });

  dom.resetRanking.addEventListener('click', () => {
    if (confirm('ランキングを初期化しますか？')) {
      Ranking.reset();
      renderRanking();
    }
  });

  dom.closeRanking.addEventListener('click', () => {
    dom.rankingPanel.classList.add('hidden');
  });

  dom.openSettings.addEventListener('click', () => {
    dom.settingsPanel.classList.remove('hidden');
  });

  dom.closeSettings.addEventListener('click', () => {
    dom.settingsPanel.classList.add('hidden');
  });

  dom.toggleSound.addEventListener('click', () => {
    const muted = Audio.toggleMute();
    dom.toggleSound.textContent = muted ? '🔇 音OFF' : '🔊 音ON';
    dom.toggleSound.setAttribute('aria-pressed', muted ? 'true' : 'false');
  });

  dom.sightRange.addEventListener('input', () => {
    const value = Number(dom.sightRange.value);
    ConfigStore.set('viewRadius', value);
    if (GameState.state.fogActive) {
      GameState.state.fog.radius = Math.max(
        3,
        Math.floor(value - (GameState.state.level - 1) * Config.TRAP.fogRadiusLevelStep)
      );
    }
  });
  dom.padSize.addEventListener('input', () => {
    ConfigStore.set('padSize', Number(dom.padSize.value));
    Input.updatePadSize();
  });
  dom.swipeSensitivity.addEventListener('input', () => {
    ConfigStore.set('swipeSensitivity', Number(dom.swipeSensitivity.value));
  });
  dom.vibrationToggle.addEventListener('change', () => {
    ConfigStore.set('vibration', dom.vibrationToggle.checked);
  });
  dom.screenshakeToggle.addEventListener('change', () => {
    ConfigStore.set('screenshake', dom.screenshakeToggle.checked);
  });
  dom.fogToggle.addEventListener('change', () => {
    ConfigStore.set('fog', dom.fogToggle.checked);
  });

  dom.pauseButton.addEventListener('click', () => {
    if (!GameState.state.playing || GameState.state.loading) return;
    GameState.state.paused = !GameState.state.paused;
    dom.pauseButton.textContent = GameState.state.paused ? '▶ 再開' : '⏸ ポーズ';
  });

  dom.resultForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const initials = dom.initialInput.value || '???';
    const entry = {
      initials,
      score: Score.get(),
      level: GameState.state.level,
      time: Utils.formatTime(GameState.state.totalTime),
      date: new Date().toLocaleDateString(),
    };
    Ranking.add(entry);
    dom.initialInput.value = '';
    dom.rankingPanel.classList.remove('hidden');
    dom.resultForm.classList.add('hidden');
    renderRanking();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
      if (!GameState.state.playing || GameState.state.loading) return;
      GameState.state.paused = !GameState.state.paused;
      dom.pauseButton.textContent = GameState.state.paused ? '▶ 再開' : '⏸ ポーズ';
    } else if (e.key === 'g' || e.key === 'G') {
      GameState.state.debug.grid = !GameState.state.debug.grid;
      Renderer.draw(GameState.state);
    } else if (e.key === 'v' || e.key === 'V') {
      GameState.state.debug.fogForce = !GameState.state.debug.fogForce;
      if (GameState.state.grid.length) {
        if (GameState.state.debug.fogForce) {
          GameState.state.visible = FogOfWar.compute(
            GameState.state.grid,
            { x: GameState.state.player.tileX, y: GameState.state.player.tileY },
            GameState.state.fog.radius
          );
        } else if (!GameState.state.fogActive || !ConfigStore.get('fog')) {
          GameState.state.visible = GameState.state.grid.map((row) => row.map(() => true));
        }
      }
      Renderer.draw(GameState.state);
    } else if (e.key === 'l' || e.key === 'L') {
      if (GameState.state.playing && !GameState.state.loading) {
        GameState.state.playing = false;
        Score.addLevel(GameState.state.level, GameState.state.time);
        GameState.nextLevel();
      }
    }
  });

  setInterval(updateHUD, 200);
})();
