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
    screens: {
      title: document.getElementById('title-screen'),
      game: document.getElementById('game-screen'),
      result: document.getElementById('result-screen'),
    },
    hudLevel: document.getElementById('hud-level'),
    hudScore: document.getElementById('hud-score'),
    statusAttack: document.querySelector('#status-attack .value'),
    statusInvincible: document.querySelector('#status-invincible .value'),
    statusTrap: document.querySelector('#status-trap .value'),
    statusField: document.querySelector('#status-field .value'),
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
  };

  const Config = (() => {
    const BASE_TILE = 32;
    return {
      VERSION: '1.0.0',
      CANVAS_MIN_HEIGHT: 520,
      TILE_BASE: BASE_TILE,
      MAX_FRAME_PATHFIND: 3,
      VIEW_RADIUS_DEFAULT: Number(dom.sightRange.value),
      INPUT: {
        swipeSensitivity: Number(dom.swipeSensitivity.value),
        padSize: Number(dom.padSize.value),
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
      },
      ITEM: {
        attackDuration: 6,
        invincibleDuration: 5,
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

    function updatePadSize() {
      const size = ConfigStore.get('padSize');
      dom.padButtons.forEach((btn) => {
        btn.style.width = `${size}px`;
        btn.style.height = `${size}px`;
      });
    }

    dom.padButtons.forEach((btn) => {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        gamepadDir = btn.dataset.dir;
      });
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        gamepadDir = null;
      });
      btn.addEventListener('touchcancel', () => {
        gamepadDir = null;
      });
      btn.addEventListener('mousedown', () => {
        gamepadDir = btn.dataset.dir;
      });
      btn.addEventListener('mouseup', () => {
        gamepadDir = null;
      });
      btn.addEventListener('mouseleave', () => {
        gamepadDir = null;
      });
    });

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        e.preventDefault();
      }
      keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => {
      keys.delete(e.key.toLowerCase());
    });

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        swipeStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });
    canvas.addEventListener('touchend', (e) => {
      if (swipeStart && e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - swipeStart.x;
        const dy = e.changedTouches[0].clientY - swipeStart.y;
        const sens = ConfigStore.get('swipeSensitivity');
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > sens) {
          gamepadDir = dx > 0 ? 'right' : 'left';
        } else if (Math.abs(dy) > sens) {
          gamepadDir = dy > 0 ? 'down' : 'up';
        }
        setTimeout(() => {
          gamepadDir = null;
        }, 100);
      }
      swipeStart = null;
    });

    function getDirection(reverse) {
      let horizontal = 0;
      let vertical = 0;
      if (keys.has('arrowup') || keys.has('w')) vertical -= 1;
      if (keys.has('arrowdown') || keys.has('s')) vertical += 1;
      if (keys.has('arrowleft') || keys.has('a')) horizontal -= 1;
      if (keys.has('arrowright') || keys.has('d')) horizontal += 1;
      if (gamepadDir) {
        switch (gamepadDir) {
          case 'up': vertical -= 1; break;
          case 'down': vertical += 1; break;
          case 'left': horizontal -= 1; break;
          case 'right': horizontal += 1; break;
        }
      }
      if (reverse) {
        horizontal *= -1;
        vertical *= -1;
      }
      return { x: horizontal, y: vertical };
    }

    updatePadSize();

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
    };
  })();

  const Maze = (() => {
    /**
     * @param {number} width odd
     * @param {number} height odd
     * @returns {number[][]}
     */
    function generate(width, height, seed = null) {
      const w = width % 2 === 0 ? width + 1 : width;
      const h = height % 2 === 0 ? height + 1 : height;
      const maze = Array.from({ length: h }, () => Array(w).fill(1));
      const stack = [];
      const startX = 1;
      const startY = 1;
      maze[startY][startX] = 0;
      stack.push({ x: startX, y: startY });

      const dir = [
        { x: 0, y: -2 },
        { x: 0, y: 2 },
        { x: -2, y: 0 },
        { x: 2, y: 0 },
      ];

      while (stack.length) {
        const current = stack[stack.length - 1];
        const candidates = dir
          .map((d) => ({ x: current.x + d.x, y: current.y + d.y, midX: current.x + d.x / 2, midY: current.y + d.y / 2 }))
          .filter((cell) => cell.x > 0 && cell.y > 0 && cell.x < w - 1 && cell.y < h - 1 && maze[cell.y][cell.x] === 1);
        if (candidates.length === 0) {
          stack.pop();
        } else {
          const next = candidates[Math.floor(Math.random() * candidates.length)];
          maze[next.midY][next.midX] = 0;
          maze[next.y][next.x] = 0;
          stack.push({ x: next.x, y: next.y });
        }
      }

      maze[h - 2][w - 2] = 0;
      return maze;
    }

    return {
      generate,
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

    function resize(width, height) {
      canvas.width = width;
      canvas.height = height;
    }

    function updateTileSize(grid) {
      tileSize = Math.min(canvas.width / grid[0].length, canvas.height / grid.length);
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
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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
        if (game.fogActive && ConfigStore.get('fog') && !game.visible[trap.y][trap.x]) return;
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
        if (game.fogActive && ConfigStore.get('fog') && !game.visible[item.y][item.x]) return;
        const px = item.x * tileSize + tileSize / 2;
        const py = item.y * tileSize + tileSize / 2;
        ctx.fillStyle = item.type === 'attack' ? '#9ef01a' : '#ffd60a';
        ctx.font = `${tileSize * 0.6}px "M PLUS 1p"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.type === 'attack' ? '剣' : '盾', px, py);
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
        if (game.fogActive && ConfigStore.get('fog') && !game.visible[enemy.tileY][enemy.tileX]) return;
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

      if (game.fogActive && ConfigStore.get('fog')) {
        ctx.fillStyle = 'rgba(5,8,12,0.8)';
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
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

    function spawn(grid, count, start, goal) {
      items.length = 0;
      const h = grid.length;
      const w = grid[0].length;
      const flat = [];
      for (let y = 1; y < h - 1; y += 1) {
        for (let x = 1; x < w - 1; x += 1) {
          if (grid[y][x] === 0 && !(x === start.x && y === start.y) && !(x === goal.x && y === goal.y)) {
            flat.push({ x, y });
          }
        }
      }
      Utils.shuffle(flat);
      const types = ['attack', 'invincible'];
      for (let i = 0; i < count && i < flat.length; i += 1) {
        items.push({ ...flat[i], type: types[i % types.length] });
      }
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

    function spawn(grid, count, start, goal, level) {
      traps.length = 0;
      const h = grid.length;
      const w = grid[0].length;
      const candidates = [];
      for (let y = 1; y < h - 1; y += 1) {
        for (let x = 1; x < w - 1; x += 1) {
          if (grid[y][x] === 0 && !(x === start.x && y === start.y) && !(x === goal.x && y === goal.y)) {
            if ((x + y) % 3 === 0) continue;
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
    }

    function update(delta, grid) {
      if (state.freezeTimer > 0) {
        state.freezeTimer -= delta;
        return;
      }
      const reverse = state.trapType === 'reverse';
      const dir = Input.getDirection(reverse);
      let moveX = dir.x;
      let moveY = dir.y;
      const length = Math.hypot(moveX, moveY) || 1;
      moveX /= length;
      moveY /= length;
      let speed = state.speed;
      if (state.trapType === 'slow') speed *= Config.PLAYER.slowFactor;
      const newX = state.x + moveX * delta * speed;
      const newY = state.y + moveY * delta * speed;

      const tryMove = (nx, ny) => {
        const tx = Math.floor(nx);
        const ty = Math.floor(ny);
        if (grid[ty] && grid[ty][tx] === 0) {
          state.x = nx;
          state.y = ny;
          state.tileX = tx;
          state.tileY = ty;
        }
      };

      tryMove(newX, state.y);
      tryMove(state.x, newY);

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
    }

    return {
      state,
      reset,
      update,
    };
  })();

  const EnemyManager = (() => {
    const enemies = [];
    let difficultyLevel = 1;
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];

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
        pathTimerMax: Math.max(18, base.pathTimer - difficultyLevel * 1.5),
        pathTimer: 0,
        x: start.x + 0.5,
        y: start.y + 0.5,
        tileX: start.x,
        tileY: start.y,
        path: [],
        currentTarget: null,
        chaseMode: false,
        patrolTargets: [],
        patrolIndex: 0,
      };
      if (type === 'PATROL') {
        enemy.patrolTargets = createPatrolTargets(grid, start);
      }
      return enemy;
    }

    function spawn(grid, count, start, goal, level) {
      difficultyLevel = level;
      enemies.length = 0;
      const openCells = [];
      for (let y = 1; y < grid.length - 1; y += 1) {
        for (let x = 1; x < grid[0].length - 1; x += 1) {
          if (grid[y][x] === 0 && !(x === start.x && y === start.y) && !(x === goal.x && y === goal.y)) {
            openCells.push({ x, y });
          }
        }
      }
      Utils.shuffle(openCells);
      const typePool = ['SPRINT', 'WANDER'];
      if (level >= 2) typePool.push('STRATEGY');
      if (level >= 3) typePool.push('SPRINT');
      if (level >= 4) typePool.push('PATROL');
      if (level >= 6) typePool.push('STRATEGY', 'SPRINT');
      if (level >= 8) typePool.push('PATROL', 'WANDER');
      for (let i = 0; i < count && i < openCells.length; i += 1) {
        const type = typePool[Utils.randInt(typePool.length)];
        enemies.push(createEnemy(type, openCells[i], grid));
      }
    }

    function planPath(enemy, grid, target, useAStar) {
      if (!target) return false;
      const start = { x: enemy.tileX, y: enemy.tileY };
      const path = useAStar
        ? Pathfinding.aStar(grid, start, target)
        : Pathfinding.bfs(grid, start, target);
      if (path.length) {
        enemy.path = path;
        enemy.currentTarget = { ...target };
        enemy.pathTimer = enemy.pathTimerMax;
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
        enemy.pathTimer = enemy.pathTimerMax * 0.5;
      }
    }

    function update(delta, grid, player, options = {}) {
      const playerTile = { x: player.tileX, y: player.tileY };
      const noise = options.noise || { timer: 0 };
      let pathBudget = Config.MAX_FRAME_PATHFIND;
      enemies.forEach((enemy) => {
        enemy.pathTimer -= delta * 60;
        const noiseActive = noise.timer > 0;
        const distance = Math.abs(enemy.tileX - playerTile.x) + Math.abs(enemy.tileY - playerTile.y);
        let desiredTarget = null;
        let useAStar = false;

        if (noiseActive) {
          desiredTarget = { x: noise.x, y: noise.y };
        }

        if (!desiredTarget) {
          switch (enemy.type) {
            case 'STRATEGY':
              desiredTarget = playerTile;
              useAStar = true;
              break;
            case 'SPRINT':
              if (distance <= enemy.view) {
                desiredTarget = playerTile;
              }
              break;
            case 'WANDER':
              if (distance <= enemy.view || enemy.chaseMode) {
                enemy.chaseMode = true;
                if (distance > enemy.view * 2 && !noiseActive) {
                  enemy.chaseMode = false;
                } else {
                  desiredTarget = playerTile;
                }
              }
              break;
            case 'PATROL':
              if (distance <= enemy.view) {
                desiredTarget = playerTile;
              }
              break;
          }
        }

        if (!desiredTarget && enemy.type === 'PATROL' && enemy.patrolTargets.length) {
          const current = enemy.patrolTargets[enemy.patrolIndex];
          if (!enemy.currentTarget || (enemy.tileX === current.x && enemy.tileY === current.y)) {
            enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolTargets.length;
          }
          desiredTarget = enemy.patrolTargets[enemy.patrolIndex];
        }

        if (desiredTarget) {
          const sameTarget =
            enemy.currentTarget && enemy.currentTarget.x === desiredTarget.x && enemy.currentTarget.y === desiredTarget.y;
          if ((!sameTarget && pathBudget > 0) || enemy.pathTimer <= 0) {
            if (pathBudget > 0 && planPath(enemy, grid, desiredTarget, useAStar)) {
              pathBudget -= 1;
            }
          }
        } else if (!enemy.path.length || enemy.pathTimer <= 0) {
          randomStep(enemy, grid);
        }

        const target = enemy.path[0];
        if (target) {
          const dx = target.x + 0.5 - enemy.x;
          const dy = target.y + 0.5 - enemy.y;
          const len = Math.hypot(dx, dy) || 1;
          const speedBase = Config.LEVEL.baseEnemySpeed + Config.LEVEL.speedStep * (difficultyLevel - 1);
          const speed = speedBase * enemy.speedFactor * (noiseActive ? 1 + Config.TRAP.noisePullStrength : 1);
          enemy.x += (dx / len) * speed * delta;
          enemy.y += (dy / len) * speed * delta;
          enemy.tileX = Math.floor(enemy.x);
          enemy.tileY = Math.floor(enemy.y);
          if (Math.abs(enemy.x - (target.x + 0.5)) < 0.05 && Math.abs(enemy.y - (target.y + 0.5)) < 0.05) {
            enemy.path.shift();
          }
        }

        const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
        if (player.attackTimer > 0 && dist < 0.9) {
          enemy.dead = true;
          Renderer.addParticle(enemy.tileX, enemy.tileY, '#ff6b6b');
          Audio.play('hit');
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
    };

    function fullVisibility(grid) {
      return grid.map((row) => row.map(() => true));
    }

    function setupLevel() {
      const size = Config.LEVEL.baseSize.w + (state.level - 1) * Config.LEVEL.sizeStep;
      const maze = Maze.generate(size, size);
      state.grid = maze;
      state.start = { x: 1, y: 1 };
      state.goal = { x: maze[0].length - 2, y: maze.length - 2 };
      Player.reset(state.start);
      const itemCount = Math.max(1, Math.floor(Config.LEVEL.baseItems * Math.pow(Config.LEVEL.itemDropDecay, state.level - 1)));
      Items.spawn(maze, itemCount, state.start, state.goal);
      const trapCount = Config.LEVEL.baseTraps + state.level;
      Traps.spawn(maze, trapCount, state.start, state.goal, state.level);
      const enemyCount = Math.min(Config.LEVEL.baseEnemies + state.level, Config.LEVEL.maxEnemies);
      EnemyManager.spawn(maze, enemyCount, state.start, state.goal, state.level);
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
    }

    function startGame() {
      state.level = 1;
      Score.reset();
      state.playing = true;
      state.paused = false;
      state.totalTime = 0;
      state.lastUpdate = Utils.now();
      setupLevel();
      changeScreen('game');
      Audio.play('start');
      dom.virtualPad.setAttribute('aria-hidden', 'false');
      dom.pauseButton.textContent = '⏸ ポーズ';
    }

    function nextLevel() {
      state.level += 1;
      setupLevel();
      Audio.play('start');
    }

    function gameOver(win) {
      state.playing = false;
      changeScreen('result');
      dom.resultScore.textContent = Score.get().toString();
      dom.resultLevel.textContent = state.level.toString();
      dom.resultTime.textContent = Utils.formatTime(state.totalTime);
      dom.resultForm.classList.remove('hidden');
      dom.virtualPad.setAttribute('aria-hidden', 'true');
      dom.pauseButton.textContent = '⏸ ポーズ';
      if (win) {
        Renderer.addParticle(state.goal.x, state.goal.y, '#fff');
      }
    }

    function update() {
      const now = Utils.now();
      const delta = Math.min(0.05, now - state.lastUpdate);
      state.lastUpdate = now;
      if (state.paused || !state.playing) return;
      state.time += delta;
      state.totalTime += delta;
      Player.update(delta, state.grid);

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

      state.visible =
        state.fogActive && ConfigStore.get('fog')
          ? FogOfWar.compute(state.grid, { x: state.player.tileX, y: state.player.tileY }, state.fog.radius)
          : fullVisibility(state.grid);

      // check item pickup
      const item = Items.take(state.player.tileX, state.player.tileY);
      if (item) {
        if (ConfigStore.get('vibration') && navigator.vibrate) navigator.vibrate(30);
        if (item.type === 'attack') {
          state.player.attackTimer = Config.ITEM.attackDuration;
        } else {
          state.player.invincibleTimer = Config.ITEM.invincibleDuration;
          state.player.trapType = null;
          state.player.trapTimer = 0;
          Input.setPadLabels(false);
        }
        Audio.play('item');
        Renderer.addParticle(state.player.tileX, state.player.tileY, '#9ef01a');
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
        Score.addLevel(state.level, state.time);
        Audio.play('goal');
        Renderer.addParticle(state.player.tileX, state.player.tileY, '#74c69d');
        nextLevel();
      }
    }

    return {
      state,
      startGame,
      nextLevel,
      update,
      setupLevel,
      gameOver,
    };
  })();

  function renderLoop() {
    requestAnimationFrame(renderLoop);
    GameState.update();
    if (GameState.state.playing) {
      Renderer.draw(GameState.state);
    }
  }

  function changeScreen(name) {
    Object.entries(dom.screens).forEach(([key, el]) => {
      if (key === name) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
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
  }

  function hudLoop() {
    updateHUD();
    requestAnimationFrame(hudLoop);
  }

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    Renderer.resize(Math.floor(rect.width), Math.floor(Math.max(Config.CANVAS_MIN_HEIGHT, rect.height)));
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  renderLoop();
  hudLoop();

  dom.startButton.addEventListener('click', () => {
    changeScreen('game');
    GameState.startGame();
  });

  dom.retryButton.addEventListener('click', () => {
    changeScreen('game');
    GameState.startGame();
  });

  dom.backTitle.addEventListener('click', () => {
    changeScreen('title');
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
      GameState.state.paused = !GameState.state.paused;
      dom.pauseButton.textContent = GameState.state.paused ? '▶ 再開' : '⏸ ポーズ';
    }
  });

  setInterval(updateHUD, 200);
})();
