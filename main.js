const Config = {
  tileSize: 28,
  mapWidth: 61,
  mapHeight: 61,
  minRooms: 6,
  maxRooms: 12,
  roomMinSize: 4,
  roomMaxSize: 8,
  baseEnemies: 7,
  baseItems: 12,
  baseTraps: 10,
  braidRatioRange: [0.25, 0.45],
  branchRatioTarget: 0.15,
  corridorWidenChance: 0.4,
  hungerPerTurn: 1,
  hungerDamage: 3,
  maxInventory: 20,
  fogRadius: 5,
  graceTurns: 2,
  swipeThreshold: 30,
  padDragDelay: 220,
  xpTable: [0, 25, 55, 95, 145, 205, 275, 360, 450, 560],
};

const Terrain = {
  WALL: "wall",
  ROOM: "room",
  FLOOR: "floor",
  WATER: "water",
  GRASS: "grass",
  ROCK: "rock",
  STAIRS: "stairs",
};

const TrapType = {
  SLOW: "slow",
  SNARE: "snare",
  REVERSE: "reverse",
  FOG: "fog",
  NOISE: "noise",
};

const ItemType = {
  SWORD: "sword",
  SHIELD: "shield",
  HERB: "herb",
  SCROLL: "scroll",
  BREAD: "bread",
  STONE: "stone",
};

const EnemyType = {
  SPRINTER: "sprinter",
  STRATEGIST: "strategist",
  WANDERER: "wanderer",
};

const Directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const DirectionNames = {
  up: "上",
  down: "下",
  left: "左",
  right: "右",
};

const DirectionKeys = {
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
};

const Action = {
  MOVE: "move",
  WAIT: "wait",
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function key(x, y) {
  return `${x},${y}`;
}

class Tile {
  constructor(type = Terrain.WALL) {
    this.terrain = type;
    this.trap = null;
    this.decoration = null;
    this.item = null;
    this.roomId = null;
  }

  isWalkable() {
    return this.terrain !== Terrain.WALL && this.terrain !== Terrain.ROCK;
  }
}

class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = Array(n).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }

  union(a, b) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return false;
    if (this.rank[ra] < this.rank[rb]) {
      this.parent[ra] = rb;
    } else if (this.rank[ra] > this.rank[rb]) {
      this.parent[rb] = ra;
    } else {
      this.parent[rb] = ra;
      this.rank[ra]++;
    }
    return true;
  }
}

class DungeonGenerator {
  constructor(width, height, depth) {
    this.width = width | 1;
    this.height = height | 1;
    this.depth = depth;
    this.grid = Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => new Tile())
    );
    this.rooms = [];
  }

  generate() {
    this.placeRooms();
    this.connectRooms();
    this.braidDeadEnds();
    this.forceBranching();
    this.ensureAlternateRoute();
    this.widenCorridors();
    this.decorateTerrain();
    return { tiles: this.grid, rooms: this.rooms };
  }

  placeRooms() {
    const targetRooms = randInt(Config.minRooms, Config.maxRooms);
    let attempts = 0;
    const limit = 400;
    while (this.rooms.length < targetRooms && attempts < limit) {
      attempts++;
      const w = randInt(Config.roomMinSize, Config.roomMaxSize);
      const h = randInt(Config.roomMinSize, Config.roomMaxSize);
      const x = randInt(1, this.width - w - 2);
      const y = randInt(1, this.height - h - 2);
      if (!this.canPlaceRoom(x, y, w, h)) continue;
      const roomId = this.rooms.length;
      for (let yy = y; yy < y + h; yy++) {
        for (let xx = x; xx < x + w; xx++) {
          const tile = this.grid[yy][xx];
          tile.terrain = Terrain.ROOM;
          tile.roomId = roomId;
        }
      }
      const center = { x: Math.floor(x + w / 2), y: Math.floor(y + h / 2) };
      this.rooms.push({ x, y, w, h, center });
    }
    if (this.rooms.length < Config.minRooms) {
      // fallback regenerate with smaller bounds
      this.grid = Array.from({ length: this.height }, () =>
        Array.from({ length: this.width }, () => new Tile())
      );
      this.rooms = [];
      this.placeRooms();
    }
  }

  canPlaceRoom(x, y, w, h) {
    for (let yy = y - 1; yy <= y + h; yy++) {
      for (let xx = x - 1; xx <= x + w; xx++) {
        if (xx < 1 || yy < 1 || xx >= this.width - 1 || yy >= this.height - 1) return false;
        if (this.grid[yy][xx].terrain !== Terrain.WALL) return false;
      }
    }
    return true;
  }

  carvePath(ax, ay, bx, by) {
    let x = ax;
    let y = ay;
    while (x !== bx) {
      const tile = this.grid[y][x];
      if (tile.terrain === Terrain.WALL) tile.terrain = Terrain.FLOOR;
      x += x < bx ? 1 : -1;
    }
    while (y !== by) {
      const tile = this.grid[y][x];
      if (tile.terrain === Terrain.WALL) tile.terrain = Terrain.FLOOR;
      y += y < by ? 1 : -1;
    }
    const tile = this.grid[y][x];
    if (tile.terrain === Terrain.WALL) tile.terrain = Terrain.FLOOR;
  }

  connectRooms() {
    if (this.rooms.length <= 1) return;
    const edges = [];
    for (let i = 0; i < this.rooms.length; i++) {
      for (let j = i + 1; j < this.rooms.length; j++) {
        const a = this.rooms[i].center;
        const b = this.rooms[j].center;
        const d = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
        edges.push({ i, j, d });
      }
    }
    edges.sort((a, b) => a.d - b.d);
    const uf = new UnionFind(this.rooms.length);
    for (const edge of edges) {
      if (uf.union(edge.i, edge.j)) {
        this.carvePath(
          this.rooms[edge.i].center.x,
          this.rooms[edge.i].center.y,
          this.rooms[edge.j].center.x,
          this.rooms[edge.j].center.y
        );
      }
    }
    const extra = Math.max(2, Math.floor(this.rooms.length / 2));
    for (let i = 0; i < extra; i++) {
      const a = randChoice(this.rooms);
      const b = randChoice(this.rooms);
      if (a === b) continue;
      this.carvePath(a.center.x, a.center.y, b.center.x, b.center.y);
    }
  }

  neighbors(x, y) {
    const list = [];
    if (x > 0) list.push({ x: x - 1, y });
    if (x < this.width - 1) list.push({ x: x + 1, y });
    if (y > 0) list.push({ x, y: y - 1 });
    if (y < this.height - 1) list.push({ x, y: y + 1 });
    return list;
  }

  walkableCount(x, y) {
    return this.neighbors(x, y).filter(({ x: nx, y: ny }) => this.grid[ny][nx].isWalkable()).length;
  }

  findDeadEnds() {
    const list = [];
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        const tile = this.grid[y][x];
        if (tile.terrain === Terrain.FLOOR && this.walkableCount(x, y) === 1) {
          list.push({ x, y });
        }
      }
    }
    return list;
  }

  braidDeadEnds() {
    const dead = this.findDeadEnds();
    if (!dead.length) return;
    const ratio = Math.random() * (Config.braidRatioRange[1] - Config.braidRatioRange[0]) + Config.braidRatioRange[0];
    const target = Math.floor(dead.length * ratio);
    let braided = 0;
    for (const cell of shuffle(dead)) {
      if (braided >= target) break;
      const candidates = this.neighbors(cell.x, cell.y).filter(({ x, y }) => {
        const tile = this.grid[y][x];
        if (tile.terrain !== Terrain.WALL) return false;
        const around = this.neighbors(x, y).filter(({ x: nx, y: ny }) => this.grid[ny][nx].isWalkable());
        return around.length >= 2;
      });
      if (candidates.length) {
        const choice = randChoice(candidates);
        this.grid[choice.y][choice.x].terrain = Terrain.FLOOR;
        braided++;
      }
    }
  }

  forceBranching() {
    const corridors = [];
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        const tile = this.grid[y][x];
        if (tile.terrain === Terrain.FLOOR && tile.roomId === null) corridors.push({ x, y });
      }
    }
    if (!corridors.length) return;
    const junctions = corridors.filter(({ x, y }) => this.walkableCount(x, y) >= 3);
    let ratio = junctions.length / corridors.length;
    let guard = 0;
    while (ratio < Config.branchRatioTarget && guard < 200) {
      guard++;
      const cell = randChoice(corridors);
      const walls = this.neighbors(cell.x, cell.y).filter(({ x, y }) => this.grid[y][x].terrain === Terrain.WALL);
      if (!walls.length) continue;
      const target = randChoice(walls);
      const neighbors = this.neighbors(target.x, target.y).filter(
        ({ x, y }) => !(x === cell.x && y === cell.y) && this.grid[y][x].terrain !== Terrain.WALL
      );
      if (!neighbors.length) continue;
      this.grid[target.y][target.x].terrain = Terrain.FLOOR;
      ratio = corridors.filter(({ x, y }) => this.walkableCount(x, y) >= 3).length / corridors.length;
    }
  }

  ensureAlternateRoute() {
    if (this.rooms.length < 2) return;
    const start = this.rooms[0].center;
    const goal = this.rooms[this.rooms.length - 1].center;
    const path = this.shortestPath(start, goal);
    if (!path) return;
    const candidates = [];
    for (const point of path) {
      for (const neighbor of this.neighbors(point.x, point.y)) {
        const tile = this.grid[neighbor.y][neighbor.x];
        if (tile.terrain !== Terrain.WALL) continue;
        const beyond = this.neighbors(neighbor.x, neighbor.y).filter(
          ({ x, y }) => !(x === point.x && y === point.y) && this.grid[y][x].terrain !== Terrain.WALL
        );
        if (beyond.length) candidates.push({ x: neighbor.x, y: neighbor.y });
      }
    }
    if (candidates.length) {
      const extra = randChoice(candidates);
      this.grid[extra.y][extra.x].terrain = Terrain.FLOOR;
    }
  }

  shortestPath(start, goal) {
    const frontier = [start];
    const visited = new Set([key(start.x, start.y)]);
    const parent = new Map();
    while (frontier.length) {
      const current = frontier.shift();
      if (current.x === goal.x && current.y === goal.y) {
        const path = [];
        let node = key(goal.x, goal.y);
        while (node) {
          const [nx, ny] = node.split(",").map(Number);
          path.unshift({ x: nx, y: ny });
          node = parent.get(node) || null;
        }
        return path;
      }
      for (const { x, y } of this.neighbors(current.x, current.y)) {
        const tile = this.grid[y][x];
        if (!tile.isWalkable() && tile.terrain !== Terrain.ROOM) continue;
        const k = key(x, y);
        if (visited.has(k)) continue;
        visited.add(k);
        parent.set(k, key(current.x, current.y));
        frontier.push({ x, y });
      }
    }
    return null;
  }

  widenCorridors() {
    for (let y = 1; y < this.height - 1; y++) {
      let run = 0;
      for (let x = 1; x < this.width - 1; x++) {
        const tile = this.grid[y][x];
        if (tile.terrain === Terrain.FLOOR && tile.roomId === null) {
          const left = this.grid[y][x - 1];
          const right = this.grid[y][x + 1];
          const neighbors = this.walkableCount(x, y);
          const straight = left && right && left.isWalkable() && right.isWalkable() && neighbors === 2;
          if (straight) {
            run++;
          } else {
            if (run > 10 && Math.random() < Config.corridorWidenChance) {
              for (let i = x - run; i < x; i++) {
                const up = this.grid[y - 1][i];
                if (up.terrain === Terrain.WALL) up.terrain = Terrain.FLOOR;
              }
            }
            run = 0;
          }
        } else {
          if (run > 10 && Math.random() < Config.corridorWidenChance) {
            for (let i = x - run; i < x; i++) {
              const up = this.grid[y - 1][i];
              if (up.terrain === Terrain.WALL) up.terrain = Terrain.FLOOR;
            }
          }
          run = 0;
        }
      }
    }
  }

  decorateTerrain() {
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        const tile = this.grid[y][x];
        if (tile.terrain === Terrain.FLOOR && Math.random() < 0.05) {
          tile.decoration = randChoice([Terrain.WATER, Terrain.GRASS]);
        } else if (tile.terrain === Terrain.ROOM && Math.random() < 0.03) {
          tile.decoration = Terrain.GRASS;
        }
      }
    }
    for (let i = 0; i < 25; i++) {
      const x = randInt(1, this.width - 2);
      const y = randInt(1, this.height - 2);
      const tile = this.grid[y][x];
      if (tile.terrain === Terrain.FLOOR && !tile.decoration && Math.random() < 0.4) {
        tile.decoration = Terrain.ROCK;
      }
    }
  }
}

class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.energy = 0;
    this.maxHp = 1;
    this.hp = 1;
    this.attack = 1;
    this.defense = 0;
    this.status = {
      slow: 0,
      snare: 0,
      blind: 0,
      sleep: 0,
    };
  }

  isAlive() {
    return this.hp > 0;
  }
}

class Player extends Entity {
  constructor(x, y) {
    super(x, y);
    this.type = "player";
    this.maxHp = 30;
    this.hp = this.maxHp;
    this.baseAttack = 5;
    this.baseDefense = 2;
    this.attack = this.baseAttack;
    this.defense = this.baseDefense;
    this.level = 1;
    this.exp = 0;
    this.hunger = 100;
    this.effects = {
      reverse: 0,
      fog: 0,
      slow: 0,
      snare: 0,
    };
    this.inventory = [];
    this.equipment = {
      sword: null,
      shield: null,
    };
    this.kills = 0;
  }
}

class Enemy extends Entity {
  constructor(x, y, type, depth) {
    super(x, y);
    this.type = type;
    const baseAttack = 6 + depth * 2;
    if (type === EnemyType.SPRINTER) {
      this.maxHp = 12 + depth * 2;
      this.attack = baseAttack;
      this.defense = 2 + depth;
      this.speed = 130;
    } else if (type === EnemyType.STRATEGIST) {
      this.maxHp = 18 + depth * 2;
      this.attack = baseAttack + 2;
      this.defense = 3 + depth;
      this.speed = 100;
    } else {
      this.maxHp = 16 + depth * 2;
      this.attack = baseAttack - 1;
      this.defense = 2 + depth;
      this.speed = 90;
    }
    this.hp = this.maxHp;
    this.energy = 0;
    this.aware = false;
    this.grace = Config.graceTurns;
  }
}

let cryptoId = 0;
function generateId() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  cryptoId += 1;
  return `id-${Date.now()}-${cryptoId}`;
}

class Item {
  constructor(type, bonus = 0) {
    this.id = generateId();
    this.type = type;
    this.bonus = bonus;
  }

  get label() {
    switch (this.type) {
      case ItemType.SWORD:
        return `剣+${this.bonus}`;
      case ItemType.SHIELD:
        return `盾+${this.bonus}`;
      case ItemType.HERB:
        return "草";
      case ItemType.SCROLL:
        return "巻";
      case ItemType.BREAD:
        return "パン";
      case ItemType.STONE:
        return "石";
      default:
        return "?";
    }
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.messageLog = document.getElementById("message-log");
    this.toast = document.getElementById("toast");
    this.depth = 1;
    this.turn = 0;
    this.entities = [];
    this.items = [];
    this.map = null;
    this.rooms = [];
    this.player = null;
    this.state = "tutorial";
    this.pendingThrow = null;
    this.playerSlowGate = false;
    this.visualViewport = window.visualViewport;
    this.logMessages = [];

    this.resizeCanvas = this.resizeCanvas.bind(this);
    window.addEventListener("resize", this.resizeCanvas);
    if (this.visualViewport) {
      this.visualViewport.addEventListener("resize", this.resizeCanvas);
    }

    this.bindUI();
    this.initInput();
    this.resizeCanvas();
    this.showTutorial();
  }

  bindUI() {
    document.getElementById("tutorial-close").addEventListener("click", () => {
      document.getElementById("tutorial").classList.add("hidden");
      this.state = "running";
      this.startNewRun();
    });

    document.getElementById("pad-menu").addEventListener("click", () => this.openInventory());
    document.getElementById("close-menu").addEventListener("click", () => this.closeInventory());

    document.getElementById("ranking-button").addEventListener("click", () => this.showRanking());
    document.getElementById("close-ranking").addEventListener("click", () => {
      document.getElementById("ranking-overlay").classList.add("hidden");
    });
    document.getElementById("reset-ranking").addEventListener("click", () => {
      localStorage.removeItem("rogueRanking");
      this.updateRankingList();
    });

    document.getElementById("retry-button").addEventListener("click", () => {
      document.getElementById("result-overlay").classList.add("hidden");
      this.state = "running";
      this.startNewRun();
    });

    document.getElementById("result-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("result-name").value || "???";
      this.saveRanking(name);
      document.getElementById("result-overlay").classList.add("hidden");
      this.showRanking();
    });

    document.getElementById("pad-toggle").addEventListener("click", () => this.cyclePadState());
    this.initPadDrag();
  }

  resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.canvas.width = width * window.devicePixelRatio;
    this.canvas.height = height * window.devicePixelRatio;
    this.ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    this.draw();
  }

  showTutorial() {
    document.getElementById("tutorial").classList.remove("hidden");
  }

  startNewRun() {
    this.depth = 1;
    this.turn = 0;
    this.playerSlowGate = false;
    this.logMessages = [];
    this.generateFloor();
    this.updateHUD();
    this.draw();
    this.pushMessage("地下1Fに降り立った。周囲を探索しよう。");
  }

  generateFloor() {
    const generator = new DungeonGenerator(Config.mapWidth, Config.mapHeight, this.depth);
    const result = generator.generate();
    this.map = result.tiles;
    this.rooms = result.rooms;
    const startRoom = this.rooms[0];
    const stairsRoom = this.rooms[this.rooms.length - 1];
    this.map[stairsRoom.center.y][stairsRoom.center.x].terrain = Terrain.STAIRS;
    this.player = new Player(startRoom.center.x, startRoom.center.y);
    this.entities = [this.player];
    this.items = [];
    this.recalculateStats();
    this.placeInitialItems(startRoom);
    this.populateItems();
    this.populateTraps();
    this.spawnEnemies(startRoom.center);
    this.turn = 0;
  }

  randomFloorTile(options = {}) {
    const attempts = 200;
    for (let i = 0; i < attempts; i++) {
      const x = randInt(1, this.map[0].length - 2);
      const y = randInt(1, this.map.length - 2);
      const tile = this.map[y][x];
      if (!tile.isWalkable()) continue;
      if (tile.terrain === Terrain.STAIRS) continue;
      if (options.avoid) {
        const d2 = (x - options.avoid.x) ** 2 + (y - options.avoid.y) ** 2;
        if (d2 < options.avoid.radius * options.avoid.radius) continue;
      }
      if (this.entities.some((e) => e.x === x && e.y === y)) continue;
      return { tile, x, y };
    }
    return null;
  }

  placeInitialItems(startRoom) {
    const safeRadius = randInt(3, 8);
    let placed = false;
    for (let attempt = 0; attempt < 40 && !placed; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const r = randInt(1, safeRadius);
      const x = clamp(Math.floor(startRoom.center.x + Math.cos(angle) * r), 1, this.map[0].length - 2);
      const y = clamp(Math.floor(startRoom.center.y + Math.sin(angle) * r), 1, this.map.length - 2);
      const tile = this.map[y][x];
      if (!tile.isWalkable() || tile.item) continue;
      const item = new Item(Math.random() < 0.5 ? ItemType.HERB : ItemType.SCROLL);
      tile.item = item;
      placed = true;
    }
  }

  populateItems() {
    const count = Config.baseItems + Math.floor(this.depth * 1.5);
    for (let i = 0; i < count; i++) {
      const found = this.randomFloorTile();
      if (!found) continue;
      const { tile, x, y } = found;
      if (tile.item) continue;
      const roll = Math.random();
      let item;
      if (roll < 0.25) {
        item = new Item(ItemType.HERB);
      } else if (roll < 0.45) {
        item = new Item(ItemType.SCROLL);
      } else if (roll < 0.65) {
        item = new Item(ItemType.BREAD);
      } else if (roll < 0.78) {
        item = new Item(ItemType.STONE);
      } else if (roll < 0.9) {
        item = new Item(ItemType.SWORD, randInt(1, 2 + Math.floor(this.depth / 3)));
      } else {
        item = new Item(ItemType.SHIELD, randInt(1, 2 + Math.floor(this.depth / 3)));
      }
      tile.item = item;
      this.items.push({ item, x, y });
    }
  }

  populateTraps() {
    const count = Config.baseTraps + this.depth * 3;
    for (let i = 0; i < count; i++) {
      const found = this.randomFloorTile();
      if (!found) continue;
      const { tile } = found;
      if (tile.trap) continue;
      tile.trap = { type: randChoice(Object.values(TrapType)), armed: true };
    }
  }

  spawnEnemies(startCenter) {
    const count = Config.baseEnemies + Math.floor(this.depth * 1.6);
    const safeRadius = 6;
    const types = [EnemyType.SPRINTER, EnemyType.STRATEGIST, EnemyType.WANDERER];
    for (let i = 0; i < count; i++) {
      const found = this.randomFloorTile({ avoid: { x: startCenter.x, y: startCenter.y, radius: safeRadius } });
      if (!found) continue;
      const { x, y } = found;
      const enemy = new Enemy(x, y, randChoice(types), this.depth);
      this.entities.push(enemy);
    }
  }

  initInput() {
    document.addEventListener("keydown", (e) => {
      if (this.state !== "running") return;
      if (e.code === "Space") {
        e.preventDefault();
        this.handleAction(Action.WAIT);
        return;
      }
      if (e.code === "KeyG") {
        this.debugGrid = !this.debugGrid;
        this.draw();
        return;
      }
      if (e.code === "KeyF") {
        this.player.effects.fog = this.player.effects.fog ? 0 : 999;
        this.draw();
        return;
      }
      if (e.code === "KeyN") {
        this.nextFloor();
        return;
      }
      if (e.code === "KeyB") {
        this.debugBranch = !this.debugBranch;
        this.draw();
        return;
      }
      const dirKey = DirectionKeys[e.code];
      if (dirKey) {
        e.preventDefault();
        this.handleMove(dirKey);
      }
    });

    const dpad = document.getElementById("dpad");
    dpad.querySelectorAll(".pad-btn").forEach((btn) => {
      btn.addEventListener(
        "pointerdown",
        (e) => {
          e.preventDefault();
          const action = btn.dataset.action;
          if (action === "wait") {
            this.handleAction(Action.WAIT);
          } else {
            this.handleMove(action);
          }
        },
        { passive: false }
      );
    });

    this.initSwipe();
  }

  initPadDrag() {
    const dpad = document.getElementById("dpad");
    let dragging = false;
    let offset = { x: 0, y: 0 };
    let timer = null;

    const start = (e) => {
      if (e.target.closest(".pad-btn") || e.target.id === "pad-menu") return;
      timer = setTimeout(() => {
        dragging = true;
        const rect = dpad.getBoundingClientRect();
        offset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        dpad.style.transition = "none";
      }, Config.padDragDelay);
    };

    const move = (e) => {
      if (!dragging) return;
      const x = e.clientX - offset.x;
      const y = e.clientY - offset.y;
      dpad.style.left = `${x + dpad.offsetWidth / 2}px`;
      dpad.style.top = `${y}px`;
      dpad.style.bottom = "auto";
      dpad.style.transform = "translate(-50%, 0)";
    };

    const end = () => {
      clearTimeout(timer);
      timer = null;
      dragging = false;
      dpad.style.transition = "";
    };

    dpad.addEventListener("pointerdown", start);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  initSwipe() {
    let start = null;
    document.body.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) return;
        start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      },
      { passive: true }
    );
    document.body.addEventListener(
      "touchend",
      (e) => {
        if (!start) return;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        if (Math.abs(dx) < Config.swipeThreshold && Math.abs(dy) < Config.swipeThreshold) {
          this.handleAction(Action.WAIT);
        } else if (Math.abs(dx) > Math.abs(dy)) {
          this.handleMove(dx > 0 ? "right" : "left");
        } else {
          this.handleMove(dy > 0 ? "down" : "up");
        }
        start = null;
      },
      { passive: true }
    );
  }

  cyclePadState() {
    const dpad = document.getElementById("dpad");
    const toggle = document.getElementById("pad-toggle");
    const order = ["full", "compact", "hidden"];
    const current = dpad.dataset.size || "full";
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];
    dpad.dataset.size = next;
    toggle.dataset.visibility = next;
    if (next === "hidden") {
      dpad.style.display = "none";
    } else {
      dpad.style.display = "flex";
    }
  }

  handleMove(dirKey) {
    if (this.state !== "running") return;
    if (this.pendingThrow) {
      const dir = this.player.effects.reverse > 0 ? this.getReversedDirection(dirKey) : dirKey;
      this.performThrow(Directions[dir]);
      return;
    }
    if (this.player.effects.snare > 0) {
      this.pushMessage("罠に拘束されて動けない…");
      this.player.effects.snare = Math.max(0, this.player.effects.snare - 1);
      this.endPlayerTurn();
      return;
    }
    if (this.player.effects.slow > 0 && !this.playerSlowGate) {
      this.playerSlowGate = true;
      this.pushMessage("動きが鈍くて足が重い…");
      this.endPlayerTurn();
      return;
    }
    if (this.player.effects.slow > 0 && this.playerSlowGate) {
      this.playerSlowGate = false;
    }

    let effectiveDir = dirKey;
    if (this.player.effects.reverse > 0) {
      if (dirKey === "up") effectiveDir = "down";
      else if (dirKey === "down") effectiveDir = "up";
      else if (dirKey === "left") effectiveDir = "right";
      else if (dirKey === "right") effectiveDir = "left";
    }
    const dir = Directions[effectiveDir];
    if (!dir) return;
    const nx = this.player.x + dir.x;
    const ny = this.player.y + dir.y;
    const tile = this.map[ny]?.[nx];
    if (!tile || !tile.isWalkable()) {
      this.pushMessage("壁が行く手を阻む。");
      return;
    }
    const enemy = this.entities.find((e) => e !== this.player && e.x === nx && e.y === ny && e.isAlive());
    if (enemy) {
      this.resolveCombat(this.player, enemy);
      if (!enemy.isAlive()) {
        this.player.kills++;
        this.entities = this.entities.filter((e) => e.isAlive());
        this.gainExp(10 + this.depth * 2);
      }
      this.endPlayerTurn();
      return;
    }
    this.player.x = nx;
    this.player.y = ny;
    this.handleTileEffects(tile);
    this.endPlayerTurn();
  }

  getReversedDirection(dirKey) {
    if (dirKey === "up") return "down";
    if (dirKey === "down") return "up";
    if (dirKey === "left") return "right";
    if (dirKey === "right") return "left";
    return dirKey;
  }

  handleAction(action) {
    if (this.state !== "running") return;
    if (action === Action.WAIT) {
      if (this.player.effects.snare > 0) {
        this.player.effects.snare = Math.max(0, this.player.effects.snare - 1);
      }
      this.pushMessage("私は身構えて様子を伺った。");
      this.endPlayerTurn();
    }
  }

  handleTileEffects(tile) {
    if (tile.terrain === Terrain.STAIRS) {
      this.nextFloor();
      return;
    }
    if (tile.trap && tile.trap.armed) {
      tile.trap.armed = false;
      switch (tile.trap.type) {
        case TrapType.SLOW:
          this.player.effects.slow = 5;
          this.playerSlowGate = false;
          this.pushMessage("スロウ罠！動きが鈍くなった。");
          break;
        case TrapType.SNARE:
          this.player.effects.snare = 1;
          this.pushMessage("スネア罠！身動きが取れない。");
          break;
        case TrapType.REVERSE:
          this.player.effects.reverse = 6;
          this.pushMessage("逆操作罠！感覚が狂う。");
          break;
        case TrapType.FOG:
          this.player.effects.fog = 10;
          this.pushMessage("フォグ罠！視界が狭まった。");
          break;
        case TrapType.NOISE:
          this.pushMessage("ノイズ罠！敵が集まってくる気配。");
          this.alertEnemies();
          break;
      }
    }
  }

  alertEnemies() {
    for (const enemy of this.entities) {
      if (enemy === this.player) continue;
      enemy.aware = true;
    }
  }

  endPlayerTurn() {
    this.turn++;
    this.player.hunger = Math.max(0, this.player.hunger - Config.hungerPerTurn);
    if (this.player.hunger === 0) {
      this.player.hp = Math.max(0, this.player.hp - Config.hungerDamage);
      this.pushMessage("空腹でダメージを受けた…");
      if (this.player.hp <= 0) {
        this.gameOver("飢えて倒れてしまった…");
        return;
      }
    }
    if (this.player.effects.reverse > 0) this.player.effects.reverse--;
    if (this.player.effects.fog > 0) this.player.effects.fog--;
    if (this.player.effects.slow > 0) this.player.effects.slow--;
    if (this.player.effects.snare > 0) this.player.effects.snare--;
    this.processItemsOnTile();
    this.updateHUD();
    this.processEnemies();
    this.draw();
  }

  processItemsOnTile() {
    const tile = this.map[this.player.y][this.player.x];
    if (tile.item) {
      if (this.inventoryCount() >= Config.maxInventory) {
        this.pushMessage("荷物がいっぱいだ。");
        return;
      }
      const item = tile.item;
      tile.item = null;
      this.player.inventory.push(item);
      this.pushMessage(`${item.label} を拾った。`);
      this.showToast(`${item.label} 入手`);
      this.updateHUD();
    }
  }

  processEnemies() {
    for (const enemy of this.entities) {
      if (enemy === this.player) continue;
      if (!enemy.isAlive()) continue;
      if (enemy.status.sleep > 0) {
        enemy.status.sleep--;
        continue;
      }
      if (enemy.status.snare > 0) {
        enemy.status.snare--;
        continue;
      }
      enemy.energy += enemy.speed;
      while (enemy.energy >= 100) {
        enemy.energy -= 100;
        this.enemyAct(enemy);
        if (!this.player.isAlive()) return;
      }
    }
  }

  enemyAct(enemy) {
    if (!enemy.aware) {
      const dist = Math.abs(enemy.x - this.player.x) + Math.abs(enemy.y - this.player.y);
      if (dist <= 6 || enemy.grace <= 0) {
        enemy.aware = true;
      } else {
        enemy.grace--;
      }
    }
    if (!enemy.aware) {
      this.wander(enemy);
      return;
    }
    const dx = this.player.x - enemy.x;
    const dy = this.player.y - enemy.y;
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      this.resolveCombat(enemy, this.player);
      if (!this.player.isAlive()) {
        this.gameOver("敵に倒されてしまった…");
      }
      return;
    }
    let path = null;
    if (enemy.type === EnemyType.STRATEGIST) {
      path = this.findPath(enemy, this.player);
    } else if (enemy.type === EnemyType.SPRINTER && Math.random() < 0.5) {
      path = this.findPath(enemy, this.player);
    }
    if (path && path.length > 1) {
      enemy.x = path[1].x;
      enemy.y = path[1].y;
    } else {
      this.chaseOrWander(enemy);
    }
  }

  findPath(startEntity, targetEntity) {
    const start = { x: startEntity.x, y: startEntity.y };
    const goal = { x: targetEntity.x, y: targetEntity.y };
    const frontier = [start];
    const visited = new Set([key(start.x, start.y)]);
    const parent = new Map();
    while (frontier.length) {
      const current = frontier.shift();
      if (current.x === goal.x && current.y === goal.y) {
        const path = [];
        let node = key(goal.x, goal.y);
        while (node) {
          const [nx, ny] = node.split(",").map(Number);
          path.unshift({ x: nx, y: ny });
          node = parent.get(node) || null;
        }
        return path;
      }
      for (const dir of Object.values(Directions)) {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        const tile = this.map[ny]?.[nx];
        if (!tile || !tile.isWalkable()) continue;
        if (this.entities.some((e) => e !== startEntity && e !== this.player && e.x === nx && e.y === ny && e.isAlive())) continue;
        const k = key(nx, ny);
        if (visited.has(k)) continue;
        visited.add(k);
        parent.set(k, key(current.x, current.y));
        frontier.push({ x: nx, y: ny });
      }
    }
    return null;
  }

  wander(enemy) {
    for (const dir of shuffle(Object.values(Directions))) {
      const nx = enemy.x + dir.x;
      const ny = enemy.y + dir.y;
      const tile = this.map[ny]?.[nx];
      if (!tile || !tile.isWalkable()) continue;
      if (this.entities.some((e) => e !== enemy && e.x === nx && e.y === ny && e.isAlive())) continue;
      enemy.x = nx;
      enemy.y = ny;
      break;
    }
  }

  chaseOrWander(enemy) {
    const dx = this.player.x - enemy.x;
    const dy = this.player.y - enemy.y;
    const dirs = [];
    if (Math.abs(dx) > Math.abs(dy)) {
      dirs.push(dx > 0 ? Directions.right : Directions.left);
      dirs.push(dy > 0 ? Directions.down : Directions.up);
    } else {
      dirs.push(dy > 0 ? Directions.down : Directions.up);
      dirs.push(dx > 0 ? Directions.right : Directions.left);
    }
    dirs.push(...shuffle(Object.values(Directions)));
    for (const dir of dirs) {
      const nx = enemy.x + dir.x;
      const ny = enemy.y + dir.y;
      const tile = this.map[ny]?.[nx];
      if (!tile || !tile.isWalkable()) continue;
      if (this.entities.some((e) => e !== enemy && e.x === nx && e.y === ny && e.isAlive())) continue;
      enemy.x = nx;
      enemy.y = ny;
      break;
    }
  }

  resolveCombat(attacker, defender) {
    const attack = attacker.attack + randInt(0, 2);
    const defense = defender.defense + randInt(0, 2);
    const damage = Math.max(1, attack - defense);
    defender.hp = Math.max(0, defender.hp - damage);
    const attackerName = attacker === this.player ? "私" : "敵";
    const defenderName = defender === this.player ? "私" : "敵";
    this.pushMessage(`${attackerName}は${defenderName}に${damage}のダメージ！`);
    if (defender.hp <= 0) {
      this.pushMessage(`${defenderName}を倒した！`);
      if (defender === this.player) {
        this.gameOver("力尽きた…");
      }
    }
  }

  gainExp(amount) {
    this.player.exp += amount;
    const next = Config.xpTable[this.player.level] || (this.player.level * 90 + 200);
    if (this.player.exp >= next) {
      this.player.level++;
      this.player.maxHp += 5;
      this.player.baseAttack += 2;
      this.player.baseDefense += 1;
      this.recalculateStats();
      this.player.hp = this.player.maxHp;
      this.pushMessage(`レベル${this.player.level}に上がった！`);
    }
  }

  inventoryCount() {
    return this.player.inventory.length;
  }

  openInventory() {
    const overlay = document.getElementById("menu-overlay");
    const list = document.getElementById("inventory-list");
    list.innerHTML = "";
    if (!this.player.inventory.length) {
      const li = document.createElement("li");
      li.textContent = "何も持っていない";
      list.appendChild(li);
    } else {
      for (const item of this.player.inventory) {
        const li = document.createElement("li");
        const label = document.createElement("span");
        label.textContent = item.label;
        li.appendChild(label);
        const actions = document.createElement("div");
        if (item.type === ItemType.SWORD || item.type === ItemType.SHIELD) {
          const btn = document.createElement("button");
          btn.textContent = "装備";
          btn.addEventListener("click", () => {
            this.equipItem(item);
            this.openInventory();
          });
          actions.appendChild(btn);
        } else {
          const btn = document.createElement("button");
          btn.textContent = "使用";
          btn.addEventListener("click", () => {
            this.useItem(item);
            if (!this.pendingThrow) this.openInventory();
          });
          actions.appendChild(btn);
        }
        const drop = document.createElement("button");
        drop.textContent = "捨てる";
        drop.addEventListener("click", () => {
          this.dropItem(item);
          this.openInventory();
        });
        actions.appendChild(drop);
        li.appendChild(actions);
        list.appendChild(li);
      }
    }
    overlay.classList.remove("hidden");
  }

  closeInventory() {
    document.getElementById("menu-overlay").classList.add("hidden");
  }

  equipItem(item) {
    if (item.type === ItemType.SWORD) {
      this.player.equipment.sword = item;
    } else if (item.type === ItemType.SHIELD) {
      this.player.equipment.shield = item;
    }
    this.recalculateStats();
    this.pushMessage(`${item.label} を装備した。`);
    this.player.inventory = this.player.inventory.filter((i) => i.id !== item.id);
    this.updateHUD();
  }

  dropItem(item) {
    const tile = this.map[this.player.y][this.player.x];
    if (tile.item) {
      this.pushMessage("ここには置けない。");
      return;
    }
    tile.item = item;
    this.player.inventory = this.player.inventory.filter((i) => i.id !== item.id);
    this.pushMessage(`${item.label} を置いた。`);
    this.updateHUD();
  }

  recalculateStats() {
    let attack = this.player.baseAttack;
    let defense = this.player.baseDefense;
    if (this.player.equipment.sword) attack += this.player.equipment.sword.bonus;
    if (this.player.equipment.shield) defense += this.player.equipment.shield.bonus;
    this.player.attack = attack;
    this.player.defense = defense;
  }

  useItem(item) {
    switch (item.type) {
      case ItemType.HERB: {
        const heal = 18;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
        this.pushMessage(`草を使ってHPを${heal}回復した。`);
        break;
      }
      case ItemType.SCROLL:
        this.castScroll();
        break;
      case ItemType.BREAD:
        this.player.hunger = clamp(this.player.hunger + 60, 0, 120);
        this.pushMessage("パンを食べて満腹になった！");
        break;
      case ItemType.STONE:
        this.pendingThrow = item;
        this.pushMessage("投げたい方向を選ぼう。" );
        this.showToast("方向入力で投擲");
        return;
      default:
        break;
    }
    this.player.inventory = this.player.inventory.filter((i) => i.id !== item.id);
    this.closeInventory();
    this.endPlayerTurn();
  }

  performThrow(direction) {
    const item = this.pendingThrow;
    this.pendingThrow = null;
    if (!direction) return;
    let x = this.player.x;
    let y = this.player.y;
    let hit = false;
    while (true) {
      x += direction.x;
      y += direction.y;
      const tile = this.map[y]?.[x];
      if (!tile || !tile.isWalkable()) {
        break;
      }
      const enemy = this.entities.find((e) => e !== this.player && e.x === x && e.y === y && e.isAlive());
      if (enemy) {
        const damage = 8 + this.depth * 2;
        enemy.hp = Math.max(0, enemy.hp - damage);
        this.pushMessage(`石が敵に命中し${damage}ダメージ！`);
        if (!enemy.isAlive()) {
          this.player.kills++;
          this.gainExp(10 + this.depth * 2);
          this.entities = this.entities.filter((e) => e.isAlive());
        }
        hit = true;
        break;
      }
    }
    if (!hit) this.pushMessage("石は床に落ちた。");
    this.player.inventory = this.player.inventory.filter((i) => i.id !== item.id);
    this.closeInventory();
    this.endPlayerTurn();
  }

  castScroll() {
    const roll = Math.random();
    if (roll < 0.4) {
      this.pushMessage("目くらましの巻物！敵が混乱した。");
      for (const enemy of this.entities) {
        if (enemy === this.player) continue;
        enemy.status.blind = 3;
      }
    } else if (roll < 0.75) {
      this.pushMessage("眠りの巻物！周囲の敵が眠った。");
      for (const enemy of this.entities) {
        if (enemy === this.player) continue;
        const dist = Math.abs(enemy.x - this.player.x) + Math.abs(enemy.y - this.player.y);
        if (dist <= 6) enemy.status.sleep = 4;
      }
    } else {
      this.pushMessage("場所替えの巻物！");
      const candidates = this.entities.filter((e) => e !== this.player && e.isAlive());
      if (candidates.length) {
        const enemy = randChoice(candidates);
        const px = this.player.x;
        const py = this.player.y;
        this.player.x = enemy.x;
        this.player.y = enemy.y;
        enemy.x = px;
        enemy.y = py;
      }
    }
  }

  updateHUD() {
    document.getElementById("ui-floor").textContent = `${this.depth}F`;
    document.getElementById("ui-hp").textContent = `${this.player.hp} / ${this.player.maxHp}`;
    document.getElementById("ui-level").textContent = this.player.level;
    document.getElementById("ui-exp").textContent = this.player.exp;
    document.getElementById("ui-hunger").textContent = `${this.player.hunger}%`;
    document.getElementById("ui-atk").textContent = this.player.attack;
    document.getElementById("ui-def").textContent = this.player.defense;
    document.getElementById("ui-inventory").textContent = `${this.inventoryCount()} / ${Config.maxInventory}`;
  }

  pushMessage(message) {
    this.logMessages.push(message);
    if (this.logMessages.length > 8) this.logMessages.shift();
    this.messageLog.innerHTML = this.logMessages.map((m) => `<p>${m}</p>`).join("");
  }

  showToast(text) {
    this.toast.textContent = text;
    this.toast.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast.classList.remove("show");
    }, 1800);
  }

  draw() {
    if (!this.map) return;
    const ctx = this.ctx;
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;
    ctx.clearRect(0, 0, width, height);
    const tileSize = Config.tileSize;
    const offsetX = (width - this.map[0].length * tileSize) / 2;
    const offsetY = (height - this.map.length * tileSize) / 2;
    ctx.save();
    ctx.translate(offsetX, offsetY);
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[0].length; x++) {
        const tile = this.map[y][x];
        let visible = true;
        if (this.player?.effects.fog > 0) {
          const dx = x - this.player.x;
          const dy = y - this.player.y;
          visible = dx * dx + dy * dy <= Config.fogRadius * Config.fogRadius;
        }
        this.drawTile(ctx, tile, x, y, tileSize, visible);
      }
    }
    for (const entity of this.entities) {
      if (!entity.isAlive()) continue;
      let visible = true;
      if (this.player?.effects.fog > 0) {
        const dx = entity.x - this.player.x;
        const dy = entity.y - this.player.y;
        visible = dx * dx + dy * dy <= Config.fogRadius * Config.fogRadius;
      }
      if (!visible) continue;
      const px = entity.x * tileSize;
      const py = entity.y * tileSize;
      ctx.fillStyle = entity === this.player ? "#ffeb3b" : "#ff6b6b";
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 2;
      ctx.font = `${tileSize - 6}px 'Noto Sans JP', sans-serif`;
      ctx.textBaseline = "top";
      const symbol = entity === this.player ? "私" : "敵";
      ctx.strokeText(symbol, px + 4, py + 2);
      ctx.fillText(symbol, px + 4, py + 2);
    }
    ctx.restore();
  }

  drawTile(ctx, tile, x, y, size, visible) {
    const px = x * size;
    const py = y * size;
    if (!visible) {
      ctx.fillStyle = "rgba(5,6,12,0.85)";
      ctx.fillRect(px, py, size, size);
      return;
    }
    let color = "#0b111a";
    if (tile.terrain === Terrain.ROOM) color = "#1e2b43";
    else if (tile.terrain === Terrain.FLOOR) color = "#1a2436";
    else if (tile.terrain === Terrain.WATER || tile.decoration === Terrain.WATER) color = "#0d3a63";
    else if (tile.decoration === Terrain.GRASS) color = "#1f3d28";
    else if (tile.decoration === Terrain.ROCK) color = "#35393c";
    else if (tile.terrain === Terrain.STAIRS) color = "#38446c";
    ctx.fillStyle = color;
    ctx.fillRect(px, py, size, size);
    if (tile.terrain === Terrain.STAIRS) {
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 4, py + 4, size - 8, size - 8);
      ctx.fillStyle = "#ffe08a";
      ctx.font = `${size - 12}px 'Noto Sans JP', sans-serif`;
      ctx.fillText("階", px + 6, py + 6);
    }
    if (tile.trap && tile.trap.armed) {
      ctx.strokeStyle = "#ff8a65";
      ctx.strokeRect(px + 6, py + 6, size - 12, size - 12);
      ctx.fillStyle = "#ffccbc";
      ctx.font = `${size - 14}px 'Noto Sans JP', sans-serif`;
      ctx.fillText("罠", px + 8, py + 6);
    }
    if (tile.item) {
      ctx.strokeStyle = "#f8f8f8";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 8, py + 8, size - 16, size - 16);
      ctx.fillStyle = "#e1f5fe";
      ctx.font = `${size - 12}px 'Noto Sans JP', sans-serif`;
      let symbol = "?";
      switch (tile.item.type) {
        case ItemType.SWORD:
          symbol = "剣";
          break;
        case ItemType.SHIELD:
          symbol = "盾";
          break;
        case ItemType.HERB:
          symbol = "草";
          break;
        case ItemType.SCROLL:
          symbol = "巻";
          break;
        case ItemType.BREAD:
          symbol = "食";
          break;
        case ItemType.STONE:
          symbol = "石";
          break;
      }
      ctx.fillText(symbol, px + 8, py + 8);
    }
    if (this.debugGrid) {
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.strokeRect(px, py, size, size);
    }
  }

  nextFloor() {
    this.depth++;
    this.playerSlowGate = false;
    this.pushMessage(`${this.depth}Fへ降りた。敵が強くなっている…`);
    this.generateFloor();
    this.updateHUD();
    this.draw();
  }

  gameOver(reason) {
    this.state = "result";
    document.getElementById("result-floor").textContent = `${this.depth}F`;
    document.getElementById("result-kills").textContent = this.player.kills;
    const score = this.depth * 100 + this.player.kills * 10 - this.turn;
    document.getElementById("result-score").textContent = Math.max(0, score);
    document.getElementById("result-overlay").classList.remove("hidden");
    this.pushMessage(reason);
  }

  saveRanking(name) {
    const score = parseInt(document.getElementById("result-score").textContent, 10) || 0;
    const entry = {
      name,
      score,
      floor: this.depth,
      kills: this.player.kills,
      time: new Date().toISOString(),
    };
    const ranking = JSON.parse(localStorage.getItem("rogueRanking") || "[]");
    ranking.push(entry);
    ranking.sort((a, b) => b.score - a.score);
    localStorage.setItem("rogueRanking", JSON.stringify(ranking.slice(0, 10)));
  }

  updateRankingList() {
    const ranking = JSON.parse(localStorage.getItem("rogueRanking") || "[]");
    const list = document.getElementById("ranking-list");
    list.innerHTML = "";
    ranking.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = `${entry.name} - ${entry.score}点 (深さ${entry.floor}F / 撃破${entry.kills})`;
      list.appendChild(li);
    });
    if (!ranking.length) {
      const li = document.createElement("li");
      li.textContent = "記録はまだありません";
      list.appendChild(li);
    }
  }

  showRanking() {
    this.updateRankingList();
    document.getElementById("ranking-overlay").classList.remove("hidden");
  }
}

const game = new Game();

window.game = game;

document.getElementById("menu-overlay").addEventListener("click", (e) => {
  if (e.target.id === "menu-overlay") {
    document.getElementById("menu-overlay").classList.add("hidden");
  }
});

document.getElementById("ranking-overlay").addEventListener("click", (e) => {
  if (e.target.id === "ranking-overlay") {
    document.getElementById("ranking-overlay").classList.add("hidden");
  }
});
