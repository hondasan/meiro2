const defaultUISettings = {
  hand: "right",
  dpadSize: "M",
  dpadOffset: { x: 0, y: 0 },
  haptics: false,
  autoHide: true,
  reduceMotion: false,
  highContrast: false,
  fontScale: 1,
  radialRadius: 180,
  radialAngle: 120,
  slotCount: 8,
  reachGuide: false,
  spacing: 8,
  autoRepeatInitial: 220,
  autoRepeatInterval: 120,
};

const UI_STORAGE_KEY = "rogueMobileUI";

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
  baseHungerPerTurn: 1,
  earlyHungerPerTurn: 0.2,
  hungerDamage: 3,
  maxInventory: 20,
  fogRadius: 5,
  graceTurns: 2,
  earlyDepthLimit: 3,
  earlyEnemyActionChance: 0.5,
  earlyEnemySight: 5,
  earlyEnemyChaseTurns: 5,
  earlyRoomEnemyCap: 2,
  padCollapsedHeight: 48,
  swipeThreshold: 26,
  flickTime: 220,
  longPressFlickTime: 260,
  autoMoveDelay: 150,
  xpTable: [0, 25, 55, 95, 145, 205, 275, 360, 450, 560],
  ui: JSON.parse(JSON.stringify(defaultUISettings)),
  camera: {
    deadzone: 2,
    lerp: 0.18,
  },
  balance: {
    minorHungerFactor: 0.25,
    earlyGraceTurns: 2,
  },
};

const ActionCost = {
  FREE: "free",
  MINOR: "minor",
  MAJOR: "major",
};

const MAP_SIZE_OPTIONS = [
  { cols: 61, rows: 61 },
  { cols: 51, rows: 51 },
  { cols: 45, rows: 45 },
  { cols: 39, rows: 39 },
  { cols: 33, rows: 33 },
  { cols: 27, rows: 27 },
  { cols: 25, rows: 25 },
  { cols: 21, rows: 21 },
  { cols: 19, rows: 19 },
  { cols: 17, rows: 17 },
];

const MIN_TILE_SIZE = 18;

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
  WEAPON: "weapon",
  SHIELD: "shield",
  HERB: "herb",
  SCROLL: "scroll",
  BREAD: "bread",
  STONE: "stone",
};

const WeaponType = {
  DAGGER: "dagger",
  SWORD: "sword",
  GREATSWORD: "greatsword",
  SPEAR: "spear",
  BOW: "bow",
  CROSSBOW: "crossbow",
};

const WeaponRarity = ["N", "U", "R", "SR", "SSR"];

const WeaponEffects = {
  BLEED: { id: "bleed", label: "出血" },
  STUN: { id: "stun", label: "スタン" },
  PIERCE: { id: "pierce", label: "貫通" },
  REFLECT: { id: "reflect", label: "反射" },
};

const WeaponCatalog = {
  [WeaponType.DAGGER]: {
    label: "短剣",
    baseAttack: 4,
    tags: { firstStrike: true, attackMod: -1 },
  },
  [WeaponType.SWORD]: {
    label: "片手剣",
    baseAttack: 6,
    tags: {},
  },
  [WeaponType.GREATSWORD]: {
    label: "大剣",
    baseAttack: 8,
    tags: { heavy: true },
  },
  [WeaponType.SPEAR]: {
    label: "槍",
    baseAttack: 6,
    reach: 2,
    tags: { reach: true },
  },
  [WeaponType.BOW]: {
    label: "弓",
    baseAttack: 5,
    range: 3,
    tags: { ranged: true, reload: true },
  },
  [WeaponType.CROSSBOW]: {
    label: "クロスボウ",
    baseAttack: 6,
    range: 3,
    tags: { ranged: true, reload: true, heavy: true },
  },
};

const Factions = {
  BEAST: "beast",
  DEMON: "demon",
  THIEF: "thief",
  SPIRIT: "spirit",
  MACHINE: "machine",
};

const FactionConfig = {
  [Factions.BEAST]: {
    label: "獣",
    color: "#fb923c",
    accent: "#f97316",
    grace: Config.graceTurns,
    trapWeak: true,
  },
  [Factions.DEMON]: {
    label: "悪",
    color: "#dc2626",
    accent: "#ef4444",
    relentless: true,
  },
  [Factions.THIEF]: {
    label: "盗",
    color: "#a855f7",
    accent: "#c084fc",
    stealChance: 0.45,
  },
  [Factions.SPIRIT]: {
    label: "霊",
    color: "#60a5fa",
    accent: "#bae6fd",
    phaseChance: 0.05,
  },
  [Factions.MACHINE]: {
    label: "機",
    color: "#22d3ee",
    accent: "#67e8f9",
    bleedImmune: true,
  },
};

const EnemyType = {
  SPRINTER: "sprinter",
  STRATEGIST: "strategist",
  WANDERER: "wanderer",
  PATROLLER: "patroller",
  AMBUSHER: "ambusher",
};

const EnemyTypeConfig = {
  [EnemyType.SPRINTER]: { speed: 130, vision: 4 },
  [EnemyType.STRATEGIST]: { speed: 100, vision: 7 },
  [EnemyType.WANDERER]: { speed: 90, vision: 6 },
  [EnemyType.PATROLLER]: { speed: 95, vision: 6 },
  [EnemyType.AMBUSHER]: { speed: 100, vision: 6 },
};

Config.factions = FactionConfig;
Config.types = EnemyTypeConfig;
Config.spawnMixByFloor = [
  {
    floors: [1, 3],
    factions: {
      [Factions.BEAST]: 0.7,
      [Factions.THIEF]: 0.12,
      [Factions.DEMON]: 0.08,
      [Factions.MACHINE]: 0.05,
    },
    types: {
      [EnemyType.WANDERER]: 0.55,
      [EnemyType.SPRINTER]: 0.35,
      [EnemyType.STRATEGIST]: 0.1,
    },
  },
  {
    floors: [4, 7],
    factions: {
      [Factions.BEAST]: 0.45,
      [Factions.THIEF]: 0.28,
      [Factions.SPIRIT]: 0.15,
      [Factions.DEMON]: 0.08,
      [Factions.MACHINE]: 0.04,
    },
    types: {
      [EnemyType.WANDERER]: 0.4,
      [EnemyType.SPRINTER]: 0.25,
      [EnemyType.STRATEGIST]: 0.2,
      [EnemyType.PATROLLER]: 0.1,
      [EnemyType.AMBUSHER]: 0.05,
    },
  },
  {
    floors: [8, 99],
    factions: {
      [Factions.DEMON]: 0.3,
      [Factions.MACHINE]: 0.25,
      [Factions.BEAST]: 0.2,
      [Factions.THIEF]: 0.15,
      [Factions.SPIRIT]: 0.1,
    },
    types: {
      [EnemyType.STRATEGIST]: 0.3,
      [EnemyType.PATROLLER]: 0.25,
      [EnemyType.AMBUSHER]: 0.2,
      [EnemyType.SPRINTER]: 0.15,
      [EnemyType.WANDERER]: 0.1,
    },
  },
];

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

function loadUISettings() {
  const stored = localStorage.getItem(UI_STORAGE_KEY);
  if (!stored) return JSON.parse(JSON.stringify(defaultUISettings));
  try {
    const parsed = JSON.parse(stored);
    return {
      ...JSON.parse(JSON.stringify(defaultUISettings)),
      ...parsed,
      dpadOffset: {
        ...defaultUISettings.dpadOffset,
        ...(parsed?.dpadOffset || {}),
      },
    };
  } catch (err) {
    console.warn("Failed to parse UI settings", err);
    return JSON.parse(JSON.stringify(defaultUISettings));
  }
}

function saveUISettings(settings) {
  localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(settings));
}

class MobileUI {
  constructor(game) {
    this.game = game;
    this.settings = loadUISettings();
    Config.ui = JSON.parse(JSON.stringify(this.settings));

    this.stage = document.getElementById("stage");
    this.padDock = document.getElementById("pad-dock");
    this.dockInner = this.padDock?.querySelector?.(".dock-inner");
    this.padHandle = document.getElementById("pad-handle");
    this.thumbZone = document.getElementById("thumb-zone");
    this.dpad = document.getElementById("dpad");
    this.menuBtn = document.getElementById("menu-btn");
    this.confirmBtn = document.getElementById("confirm-btn");
    this.reachGuide = document.getElementById("reach-guide");
    this.touchLayer = document.getElementById("touch-layer");
    this.radial = document.getElementById("radial-menu");
    this.radialSlotsContainer = this.radial.querySelector(".radial-slots");
    this.radialCancel = document.getElementById("radial-cancel");
    this.radialCore = this.radial.querySelector(".radial-core");
    this.quickslotBar = document.getElementById("quickslot-bar");
    this.quickslotButtons = Array.from(document.querySelectorAll(".quickslot"));
    this.padPointer = null;
    this.padCurrentBtn = null;
    this.padRepeatTimer = null;
    this.padRepeatInterval = null;
    this.touchSession = null;
    this.touchLongPress = null;
    this.twoFingerWait = false;
    this.radialActiveSlot = null;
    this.radialPointerId = null;
    this.radialActions = this.buildRadialActions();
    this.autoHideTimer = null;
    this.padHeld = false;
    this.padCollapsedHeight = Config.padCollapsedHeight || 48;

    this.applySettings();
    this.setupHandSelection();
    this.setupStatusBar();
    this.setupMinimap();
    this.setupControls();
    this.setupRadialMenu();
    this.setupTouchInput();
    this.setupDockHandle();
    this.setupSettingsPanel();
    this.setupQuickslots();
    this.observeViewport();
    this.layout();
  }

  buildRadialActions() {
    return [
      {
        id: "items",
        icon: "🎒",
        label: "アイテム",
        handler: () => this.game.openInventory(),
      },
      {
        id: "equip",
        icon: "⚔️",
        label: "装備変更",
        handler: () => this.game.quickEquip(),
      },
      {
        id: "throw",
        icon: "🎯",
        label: "投擲",
        handler: () => this.game.prepareThrow(),
      },
      {
        id: "wait",
        icon: "⏳",
        label: "足踏み",
        handler: () => this.game.handleAction(Action.WAIT, "radial"),
      },
      {
        id: "minimap",
        icon: "🗺️",
        label: "マップ",
        handler: () => this.toggleMinimap(),
      },
      {
        id: "autorun",
        icon: "⚡",
        label: "オート",
        handler: () => this.game.toggleAutoRun(),
      },
      {
        id: "food",
        icon: "🍞",
        label: "食料",
        handler: () => this.game.consumeFood(),
      },
      {
        id: "settings",
        icon: "⚙️",
        label: "設定",
        handler: () => this.openSettings(),
      },
    ];
  }

  applySettings() {
    Config.ui = JSON.parse(JSON.stringify(this.settings));
    document.body.classList.toggle("high-contrast", !!this.settings.highContrast);
    document.body.classList.toggle("reduce-motion", !!this.settings.reduceMotion);
    document.documentElement.style.fontSize = `${16 * (this.settings.fontScale || 1)}px`;
    document.documentElement.style.setProperty(
      "--btn-press-scale",
      this.settings.reduceMotion ? 1 : 0.96
    );
    this.settings.spacing = Math.max(8, this.settings.spacing || 8);
    this.settings.autoRepeatInitial = Number(this.settings.autoRepeatInitial) || defaultUISettings.autoRepeatInitial;
    this.settings.autoRepeatInterval = Number(this.settings.autoRepeatInterval) || defaultUISettings.autoRepeatInterval;
    this.settings.autoHide = this.settings.autoHide !== false;
    document.documentElement.style.setProperty(
      "--pad-gap",
      `${Math.max(8, this.settings.spacing || 8)}px`
    );
    if (this.padDock) {
      this.padDock.dataset.hand = this.settings.hand;
    }
    this.dpad.dataset.size = this.settings.dpadSize;
    this.reachGuide.classList.toggle("show", !!this.settings.reachGuide);
    this.updateThumbOffset();
    if (!this.settings.autoHide) {
      this.cancelAutoHide();
      this.padDock?.setAttribute("aria-expanded", "true");
    }
    this.renderRadialSlots();
    this.layout();
  }

  updateThumbOffset() {
    const clampX = Math.max(-40, Math.min(this.settings.dpadOffset.x || 0, 160));
    const clampY = Math.max(0, Math.min(this.settings.dpadOffset.y || 0, 180));
    this.settings.dpadOffset = { x: clampX, y: clampY };
    this.thumbZone.style.setProperty("--thumb-offset-x", `${clampX}px`);
    this.thumbZone.style.setProperty("--thumb-offset-y", `${clampY}px`);
  }

  setupHandSelection() {
    const overlay = document.getElementById("handedness-overlay");
    if (this.settings.hand) {
      overlay.classList.add("hidden");
    }
    overlay.querySelectorAll("button[data-hand]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const hand = btn.dataset.hand;
        this.settings.hand = hand;
        saveUISettings(this.settings);
        this.applySettings();
        overlay.classList.add("hidden");
      });
    });
  }

  setupStatusBar() {
    const collapse = document.getElementById("status-collapse");
    const secondary = document.querySelector(".status-secondary");
    collapse.addEventListener("click", () => {
      const expanded = collapse.getAttribute("aria-expanded") === "true";
      collapse.setAttribute("aria-expanded", (!expanded).toString());
      secondary.hidden = expanded;
      collapse.textContent = expanded ? "▲" : "▼";
    });
  }

  setupMinimap() {
    const toggle = document.getElementById("minimap-toggle");
    const container = document.getElementById("minimap-container");
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", (!expanded).toString());
      container.setAttribute("aria-hidden", expanded ? "true" : "false");
      if (!expanded) {
        this.game.drawMinimap();
      }
    });
    container.setAttribute("aria-hidden", "true");
  }

  setupControls() {
    this.dpad.querySelectorAll(".pad-btn").forEach((btn) => {
      btn.addEventListener(
        "pointerdown",
        (e) => this.onPadPointerDown(e, btn),
        { passive: false }
      );
    });
    this.bindAuxButton(this.confirmBtn);
    this.bindAuxButton(this.menuBtn);
    window.addEventListener(
      "pointermove",
      (e) => this.onPadPointerMove(e),
      { passive: false }
    );
    window.addEventListener(
      "pointerup",
      (e) => this.onPadPointerUp(e),
      { passive: false }
    );
    window.addEventListener(
      "pointercancel",
      (e) => this.onPadPointerUp(e),
      { passive: false }
    );

    this.dpad.addEventListener(
      "pointerdown",
      (e) => this.beginPadDrag(e),
      { passive: false }
    );

    this.confirmBtn.addEventListener("click", () => {
      this.onUserInteract();
      this.game.confirmAction();
    });

    this.menuBtn.addEventListener("click", (e) => {
      this.onUserInteract();
      if (this.menuBtn.dataset.longPress === "true") {
        this.menuBtn.dataset.longPress = "false";
        return;
      }
      this.game.openInventory();
    });
    this.menuBtn.addEventListener(
      "pointerdown",
      (e) => {
        this.menuBtn.dataset.longPress = "false";
        this.menuLongPress = setTimeout(() => {
          this.menuBtn.dataset.longPress = "true";
          const rect = this.menuBtn.getBoundingClientRect();
          this.openRadial(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }, 500);
      },
      { passive: false }
    );
    this.menuBtn.addEventListener(
      "pointerup",
      () => {
        clearTimeout(this.menuLongPress);
      },
      { passive: false }
    );
    this.menuBtn.addEventListener(
      "pointercancel",
      () => {
        clearTimeout(this.menuLongPress);
      },
      { passive: false }
    );
  }

  onPadPointerDown(e, btn) {
    if (this.padPointer !== null) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    this.padPointer = e.pointerId;
    this.padCurrentBtn = btn;
    this.handlePadPressStart();
    this.triggerPadAction(btn.dataset.action);
    this.dpad.setPointerCapture?.(e.pointerId);
    this.padRepeatTimer = setTimeout(() => {
      this.padRepeatInterval = setInterval(() => {
        if (this.padCurrentBtn) {
          this.triggerPadAction(this.padCurrentBtn.dataset.action, true);
        }
      }, this.settings.autoRepeatInterval);
    }, this.settings.autoRepeatInitial);
  }

  onPadPointerMove(e) {
    if (this.padPointer !== e.pointerId) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const btn = target?.closest?.(".pad-btn");
    if (btn && btn !== this.padCurrentBtn) {
      this.padCurrentBtn = btn;
      this.triggerPadAction(btn.dataset.action);
      this.resetPadRepeat();
    }
  }

  onPadPointerUp(e) {
    if (this.padPointer !== e.pointerId) return;
    this.dpad.releasePointerCapture?.(e.pointerId);
    this.clearPadRepeat();
  }

  triggerPadAction(action, isRepeat = false) {
    if (!action) return;
    if (!isRepeat) this.hapticPulse();
    if (action === "wait") {
      this.game.handleAction(Action.WAIT, "dpad");
    } else {
      this.game.handleMove(action, "dpad");
    }
  }

  resetPadRepeat() {
    this.clearPadRepeat(false);
    this.padRepeatTimer = setTimeout(() => {
      this.padRepeatInterval = setInterval(() => {
        if (this.padCurrentBtn) {
          this.triggerPadAction(this.padCurrentBtn.dataset.action, true);
        }
      }, this.settings.autoRepeatInterval);
    }, this.settings.autoRepeatInitial);
  }

  clearPadRepeat(clearPointer = true) {
    clearTimeout(this.padRepeatTimer);
    clearInterval(this.padRepeatInterval);
    this.padRepeatTimer = null;
    this.padRepeatInterval = null;
    if (clearPointer) {
      this.padPointer = null;
      this.padCurrentBtn = null;
      this.handlePadPressEnd();
    }
  }

  beginPadDrag(e) {
    if (e.target.closest(".pad-btn")) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const start = performance.now();
    const startOffset = { ...this.settings.dpadOffset };
    const pointerId = e.pointerId;
    let moved = false;
    let allowCycle = false;
    const holdTimer = setTimeout(() => {
      allowCycle = true;
    }, Config.longPressFlickTime);
    const move = (ev) => {
      if (ev.pointerId !== pointerId) return;
      const elapsed = performance.now() - start;
      if (elapsed < Config.longPressFlickTime) return;
      const hand = this.settings.hand;
      let offsetX = startOffset.x;
      if (hand === "right") {
        offsetX = startOffset.x + (e.clientX - ev.clientX);
      } else {
        offsetX = startOffset.x + (ev.clientX - e.clientX);
      }
      const offsetY = startOffset.y + (e.clientY - ev.clientY);
      this.settings.dpadOffset = { x: offsetX, y: offsetY };
      this.updateThumbOffset();
      moved = true;
    };
    const up = (ev) => {
      if (ev.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      clearTimeout(holdTimer);
      if (!moved && allowCycle) {
        this.cyclePadSize();
      } else if (moved) {
        saveUISettings(this.settings);
        this.applySettings();
      }
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up, { passive: false });
    window.addEventListener("pointercancel", up, { passive: false });
  }

  cyclePadSize() {
    const order = ["S", "M", "L"];
    const current = this.settings.dpadSize || "M";
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];
    this.settings.dpadSize = next;
    saveUISettings(this.settings);
    this.applySettings();
    this.hapticPulse();
    this.game.showToast(`Dパッドサイズ: ${next}`);
  }

  setupRadialMenu() {
    this.radialCancel.addEventListener("click", () => this.closeRadial());
    this.radial.addEventListener(
      "pointerdown",
      (e) => {
        if (!this.radial.classList.contains("active")) return;
        this.radialPointerId = e.pointerId;
        this.handleRadialPointer(e);
        e.preventDefault();
      },
      { passive: false }
    );
    this.radial.addEventListener(
      "pointermove",
      (e) => {
        if (this.radialPointerId !== e.pointerId) return;
        this.handleRadialPointer(e);
      },
      { passive: false }
    );
    this.radial.addEventListener(
      "pointerup",
      (e) => {
        if (this.radialPointerId !== e.pointerId) return;
        const active = this.radialActiveSlot;
        this.closeRadial();
        if (active) {
          active.classList.remove("active");
          const action = active.dataset.action;
          const entry = this.radialActions.find((a) => a.id === action);
          entry?.handler?.();
        }
      },
      { passive: false }
    );
    this.radial.addEventListener(
      "pointercancel",
      () => {
        this.closeRadial();
      },
      { passive: false }
    );
  }

  renderRadialSlots() {
    if (!this.radialSlotsContainer) return;
    this.radialSlotsContainer.innerHTML = "";
    const count = Math.min(this.settings.slotCount || 8, this.radialActions.length);
    const actions = this.radialActions.slice(0, count);
    actions.forEach((action) => {
      const slot = document.createElement("div");
      slot.className = "radial-slot";
      slot.dataset.action = action.id;
      slot.innerHTML = `<span>${action.icon}</span><span>${action.label}</span>`;
      this.radialSlotsContainer.appendChild(slot);
    });
  }

  openRadial(x, y) {
    if (this.radial.classList.contains("active")) return;
    this.expandPadDock();
    this.cancelAutoHide();
    this.radial.classList.add("active");
    const dockRect = this.padDock?.getBoundingClientRect();
    if (dockRect) {
      const safeBottom = this.getSafeBottom();
      const bottom = Math.max(0, dockRect.bottom - y - safeBottom);
      const left = Math.max(0, x - dockRect.left);
      this.radialCore.style.bottom = `${bottom}px`;
      this.radialCore.style.left = `${left}px`;
    } else {
      this.radialCore.style.bottom = "0px";
      this.radialCore.style.left = "0px";
    }
    this.positionRadialSlots();
    this.radialActiveSlot = null;
  }

  closeRadial() {
    this.radialPointerId = null;
    this.radialActiveSlot?.classList.remove("active");
    this.radialActiveSlot = null;
    this.radial.classList.remove("active");
    this.resetAutoHide();
  }

  positionRadialSlots() {
    const radius = this.settings.radialRadius || 180;
    const angleSpan = this.settings.radialAngle || 120;
    const slots = Array.from(this.radialSlotsContainer.children);
    const count = slots.length;
    if (!count) return;
    const hand = this.settings.hand;
    const startAngle = hand === "right" ? -angleSpan : 180 + angleSpan;
    const step = count > 1 ? angleSpan / (count - 1) : 0;
    slots.forEach((slot, index) => {
      const angleDeg = hand === "right" ? startAngle + step * index : startAngle - step * index;
      const angleRad = (angleDeg * Math.PI) / 180;
      const tx = Math.cos(angleRad) * radius;
      const ty = Math.sin(angleRad) * radius;
      slot.style.transform = `translate(${tx}px, ${ty}px)`;
    });
  }

  handleRadialPointer(e) {
    const rect = this.radialCore.getBoundingClientRect();
    const cx = rect.left;
    const cy = rect.bottom;
    const dx = e.clientX - cx;
    const dy = cy - e.clientY;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const slots = Array.from(this.radialSlotsContainer.children);
    if (!slots.length) return;
    let closest = null;
    let minDiff = Infinity;
    slots.forEach((slot) => {
      const transform = slot.style.transform;
      const match = /translate\(([-0-9.]+)px,\s*([-0-9.]+)px\)/.exec(transform);
      if (!match) return;
      const sx = parseFloat(match[1]);
      const sy = parseFloat(match[2]);
      const sa = (Math.atan2(-sy, sx) * 180) / Math.PI;
      let diff = Math.abs(sa - angle);
      if (diff > 180) diff = 360 - diff;
      if (diff < minDiff) {
        minDiff = diff;
        closest = slot;
      }
    });
    if (closest && closest !== this.radialActiveSlot) {
      this.radialActiveSlot?.classList.remove("active");
      closest.classList.add("active");
      this.radialActiveSlot = closest;
    }
  }

  setupTouchInput() {
    this.touchLayer.addEventListener(
      "pointerdown",
      (e) => {
        if (this.radial.classList.contains("active")) return;
        if (this.padPointer !== null) return;
        if (this.touchSession) return;
        this.touchSession = {
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          startTime: performance.now(),
        };
        if (this.padDock?.getAttribute("aria-expanded") === "false" && this.isInBottomZone(e.clientX, e.clientY)) {
          this.expandPadDock(true);
        }
        this.resetAutoHide();
        this.touchLongPress = setTimeout(() => {
          if (this.isInBottomZone(e.clientX, e.clientY)) {
            this.openRadial(e.clientX, e.clientY);
          }
        }, 480);
        e.preventDefault();
      },
      { passive: false }
    );
    this.touchLayer.addEventListener(
      "pointermove",
      (e) => {
        if (!this.touchSession || this.touchSession.pointerId !== e.pointerId) return;
        const dx = e.clientX - this.touchSession.startX;
        const dy = e.clientY - this.touchSession.startY;
        if (Math.hypot(dx, dy) > 12) {
          clearTimeout(this.touchLongPress);
        }
      },
      { passive: false }
    );
    this.touchLayer.addEventListener(
      "pointerup",
      (e) => {
        if (!this.touchSession || this.touchSession.pointerId !== e.pointerId) return;
        clearTimeout(this.touchLongPress);
        const session = this.touchSession;
        this.touchSession = null;
        this.resetAutoHide();
        if (this.twoFingerWait) {
          this.twoFingerWait = false;
          return;
        }
        const dx = e.clientX - session.startX;
        const dy = e.clientY - session.startY;
        const dist = Math.hypot(dx, dy);
        const elapsed = performance.now() - session.startTime;
        if (dist < Config.swipeThreshold) {
          this.handleTap(e.clientX, e.clientY);
        } else {
          const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
          if (elapsed < Config.flickTime) {
            this.game.handleMove(dir, "swipe");
          } else {
            this.game.startAutoRun(dir);
          }
        }
      },
      { passive: false }
    );
    this.touchLayer.addEventListener(
      "pointercancel",
      () => {
        clearTimeout(this.touchLongPress);
        this.touchSession = null;
        this.resetAutoHide();
      },
      { passive: false }
    );

    this.touchLayer.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          this.twoFingerWait = true;
          this.touchSession = null;
          clearTimeout(this.touchLongPress);
          this.resetAutoHide();
        }
      },
      { passive: false }
    );
    this.touchLayer.addEventListener(
      "touchend",
      (e) => {
        if (this.twoFingerWait && e.touches.length === 0) {
          this.game.handleAction(Action.WAIT, "twofinger");
          this.twoFingerWait = false;
        }
        this.resetAutoHide();
      }
    );
  }

  setupDockHandle() {
    if (!this.padDock) return;
    if (this.padHandle) {
      this.padHandle.addEventListener("click", () => {
        const expanded = this.padDock.getAttribute("aria-expanded") !== "false";
        if (expanded && this.settings.autoHide) {
          this.collapsePadDock(true);
        } else {
          this.expandPadDock(true);
          this.resetAutoHide();
        }
      });
    }
  }

  handleTap(clientX, clientY) {
    if (this.radial.classList.contains("active")) return;
    const rect = this.game.canvas.getBoundingClientRect();
    const scaleX = this.game.canvas.width / rect.width;
    const scaleY = this.game.canvas.height / rect.height;
    const px = (clientX - rect.left) * scaleX / window.devicePixelRatio;
    const py = (clientY - rect.top) * scaleY / window.devicePixelRatio;
    this.game.handleTapMove(px, py);
  }

  isInBottomZone(x, y) {
    const viewport = this.getViewport();
    const padHeight = this.getPadHeight();
    const safeBottom = this.getSafeBottom();
    return y >= viewport.height - (padHeight + safeBottom);
  }

  setupSettingsPanel() {
    const overlay = document.getElementById("settings-overlay");
    const form = document.getElementById("settings-form");
    const closeBtn = document.getElementById("settings-close");
    form.hand.value = this.settings.hand;
    form.dpadSize.value = this.settings.dpadSize;
    form.padSpacing.value = this.settings.spacing;
    form.haptics.checked = !!this.settings.haptics;
    form.autoHide.checked = !!this.settings.autoHide;
    form.reduceMotion.checked = !!this.settings.reduceMotion;
    form.highContrast.checked = !!this.settings.highContrast;
    form.fontScale.value = this.settings.fontScale;
    form.radialRadius.value = this.settings.radialRadius;
    form.radialAngle.value = this.settings.radialAngle;
    form.slotCount.value = this.settings.slotCount;
    form.reachGuide.checked = !!this.settings.reachGuide;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.settings.hand = form.hand.value;
      this.settings.dpadSize = form.dpadSize.value;
      this.settings.spacing = parseInt(form.padSpacing.value, 10) || this.settings.spacing;
      this.settings.haptics = form.haptics.checked;
      this.settings.autoHide = form.autoHide.checked;
      this.settings.reduceMotion = form.reduceMotion.checked;
      this.settings.highContrast = form.highContrast.checked;
      this.settings.fontScale = parseFloat(form.fontScale.value) || 1;
      this.settings.radialRadius = parseInt(form.radialRadius.value, 10) || this.settings.radialRadius;
      this.settings.radialAngle = parseInt(form.radialAngle.value, 10) || this.settings.radialAngle;
      this.settings.slotCount = Math.max(4, Math.min(8, parseInt(form.slotCount.value, 10) || 8));
      this.settings.reachGuide = form.reachGuide.checked;
      saveUISettings(this.settings);
      this.applySettings();
      overlay.classList.add("hidden");
    });
    closeBtn.addEventListener("click", () => overlay.classList.add("hidden"));
  }

  openSettings() {
    const overlay = document.getElementById("settings-overlay");
    const form = document.getElementById("settings-form");
    form.hand.value = this.settings.hand;
    form.dpadSize.value = this.settings.dpadSize;
    form.padSpacing.value = this.settings.spacing;
    form.haptics.checked = !!this.settings.haptics;
    form.autoHide.checked = !!this.settings.autoHide;
    form.reduceMotion.checked = !!this.settings.reduceMotion;
    form.highContrast.checked = !!this.settings.highContrast;
    form.fontScale.value = this.settings.fontScale;
    form.radialRadius.value = this.settings.radialRadius;
    form.radialAngle.value = this.settings.radialAngle;
    form.slotCount.value = this.settings.slotCount;
    form.reachGuide.checked = !!this.settings.reachGuide;
    overlay.classList.remove("hidden");
  }

  setupQuickslots() {
    if (!this.quickslotButtons?.length) return;
    this.quickslotButtons.forEach((btn, index) => {
      let clearTimer = null;
      btn.addEventListener("click", () => {
        this.onUserInteract({ expand: false });
        this.game.useQuickSlot(index);
      });
      btn.addEventListener("dragover", (ev) => {
        ev.preventDefault();
        btn.classList.add("drag-over");
      });
      btn.addEventListener("dragleave", () => btn.classList.remove("drag-over"));
      btn.addEventListener("drop", (ev) => {
        ev.preventDefault();
        btn.classList.remove("drag-over");
        const id = ev.dataTransfer?.getData("text/plain");
        if (id) {
          this.game.assignQuickslot(index, id);
        }
      });
      btn.addEventListener("pointerdown", () => {
        clearTimer = setTimeout(() => {
          this.game.clearQuickslot(index);
        }, 600);
      });
      const cancelClear = () => {
        if (clearTimer) {
          clearTimeout(clearTimer);
          clearTimer = null;
        }
      };
      btn.addEventListener("pointerup", cancelClear);
      btn.addEventListener("pointerleave", cancelClear);
      btn.addEventListener("pointercancel", cancelClear);
    });
    this.renderQuickslots(this.game.getQuickslotState());
  }

  renderQuickslots(slots = []) {
    if (!this.quickslotButtons?.length) return;
    slots.forEach((slot, index) => {
      const btn = this.quickslotButtons[index];
      if (!btn) return;
      const iconEl = btn.querySelector(".quickslot-icon");
      const labelEl = btn.querySelector(".quickslot-label");
      if (slot?.empty || !slot) {
        btn.classList.add("empty");
        if (iconEl) iconEl.textContent = "+";
        if (labelEl) labelEl.textContent = "";
        btn.setAttribute("aria-label", `クイックスロット${index + 1} 空`);
      } else {
        btn.classList.remove("empty");
        if (iconEl) iconEl.textContent = slot.icon || "◎";
        if (labelEl) labelEl.textContent = slot.label || "";
        btn.setAttribute("aria-label", `クイックスロット${index + 1} ${slot.label}`);
      }
    });
  }

  toggleMinimap() {
    const toggle = document.getElementById("minimap-toggle");
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
    const container = document.getElementById("minimap-container");
    container.setAttribute("aria-hidden", (!expanded).toString());
    if (!expanded) {
      this.game.drawMinimap();
    }
  }

  hapticPulse() {
    if (!this.settings.haptics) return;
    if (navigator.vibrate) {
      navigator.vibrate(12);
    }
  }

  bindAuxButton(button) {
    if (!button) return;
    button.addEventListener(
      "pointerdown",
      (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        this.handlePadPressStart();
      },
      { passive: true }
    );
    button.addEventListener(
      "pointerup",
      () => this.handlePadPressEnd(),
      { passive: true }
    );
    button.addEventListener(
      "pointercancel",
      () => this.handlePadPressEnd(),
      { passive: true }
    );
  }

  handlePadPressStart() {
    if (this.padHeld) return;
    this.padHeld = true;
    this.expandPadDock();
    this.cancelAutoHide();
    this.padDock?.classList.add("is-pressed");
  }

  handlePadPressEnd() {
    if (!this.padHeld) return;
    this.padHeld = false;
    this.padDock?.classList.remove("is-pressed");
    this.resetAutoHide();
  }

  expandPadDock(force = false) {
    if (!this.padDock) return;
    const expanded = this.padDock.getAttribute("aria-expanded") !== "false";
    if (expanded && !force) return;
    this.padDock.setAttribute("aria-expanded", "true");
    this.updatePadHeight();
  }

  collapsePadDock(force = false) {
    if (!this.padDock) return;
    if (!this.settings.autoHide && !force) return;
    if (this.padHeld && !force) {
      this.resetAutoHide();
      return;
    }
    if (this.padDock.getAttribute("aria-expanded") === "false") return;
    this.padDock.setAttribute("aria-expanded", "false");
    this.updatePadHeight();
  }

  cancelAutoHide() {
    clearTimeout(this.autoHideTimer);
    this.autoHideTimer = null;
  }

  resetAutoHide() {
    this.cancelAutoHide();
    if (!this.settings.autoHide) return;
    if (!document.body.classList.contains("dock-active")) return;
    this.autoHideTimer = setTimeout(() => this.collapsePadDock(), 1500);
  }

  onUserInteract({ expand = true } = {}) {
    if (expand) this.expandPadDock();
    this.resetAutoHide();
  }

  updatePadHeight() {
    if (!document.body.classList.contains("dock-active")) {
      document.documentElement.style.setProperty("--pad-h", "0px");
      this.game.resizeCanvas();
      this.positionRadialSlots();
      return;
    }
    this.dockInner = this.padDock?.querySelector?.(".dock-inner");
    requestAnimationFrame(() => {
      const expanded = this.padDock?.getAttribute("aria-expanded") !== "false";
      let padHeight = this.padCollapsedHeight;
      if (expanded) {
        if (this.dockInner) {
          padHeight = this.dockInner.offsetHeight;
        } else if (this.padDock) {
          padHeight = Math.max(0, this.padDock.offsetHeight - this.getSafeBottom());
        }
      }
      document.documentElement.style.setProperty("--pad-h", `${padHeight}px`);
      this.game.resizeCanvas();
      this.positionRadialSlots();
    });
  }

  observeViewport() {
    window.addEventListener("resize", () => this.layout());
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", () => this.layout());
    }
  }

  layout() {
    this.dockInner = this.padDock?.querySelector?.(".dock-inner");
    this.updateThumbOffset();
    const viewport = this.getViewport();
    const isMobile = viewport.width <= 960 || viewport.height <= 820;
    if (this.padDock) {
      this.padDock.dataset.hand = this.settings.hand;
    }
    document.body.classList.toggle("dock-active", isMobile);
    if (!isMobile) {
      this.padDock?.setAttribute("aria-expanded", "true");
      this.cancelAutoHide();
      document.documentElement.style.setProperty("--pad-h", "0px");
      this.game.resizeCanvas();
      this.positionRadialSlots();
      return;
    }
    if (!this.settings.autoHide) {
      this.padDock?.setAttribute("aria-expanded", "true");
    }
    this.updatePadHeight();
    this.positionRadialSlots();
    this.resetAutoHide();
  }

  getViewport() {
    if (window.visualViewport) {
      return { width: window.visualViewport.width, height: window.visualViewport.height };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  }

  getSafeBottom() {
    const value = getComputedStyle(document.documentElement).getPropertyValue("--safe-bottom");
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  getPadHeight() {
    const value = getComputedStyle(document.documentElement).getPropertyValue("--pad-h");
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}

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

function weightedChoice(weights) {
  const entries = Object.entries(weights).filter(([, value]) => value > 0);
  if (!entries.length) return null;
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  let r = Math.random() * total;
  for (const [key, value] of entries) {
    r -= value;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

const WeaponRarityBonus = {
  N: 0,
  U: 1,
  R: 2,
  SR: 3,
  SSR: 4,
};

const WeaponEffectChance = {
  N: 0,
  U: 0.05,
  R: 0.12,
  SR: 0.25,
  SSR: 0.35,
};

const WeaponTypeWeights = {
  [WeaponType.DAGGER]: 0.18,
  [WeaponType.SWORD]: 0.32,
  [WeaponType.GREATSWORD]: 0.16,
  [WeaponType.SPEAR]: 0.14,
  [WeaponType.BOW]: 0.12,
  [WeaponType.CROSSBOW]: 0.08,
};

function rollWeaponRarity(depth) {
  const base = { N: 0.5, U: 0.24, R: 0.14, SR: 0.1, SSR: 0.02 };
  if (depth <= 3) {
    const ssr = 0.01 + Math.random() * 0.02;
    const delta = base.SSR - ssr;
    base.SSR = ssr;
    base.N += delta;
  } else if (depth >= 6) {
    base.SR += 0.03;
    base.SSR += 0.02;
    base.N -= 0.025;
    base.U -= 0.015;
  }
  return weightedChoice(base) || "N";
}

function rollWeaponType(depth) {
  const weights = { ...WeaponTypeWeights };
  if (depth >= 5) {
    weights[WeaponType.CROSSBOW] += 0.04;
    weights[WeaponType.GREATSWORD] += 0.02;
    weights[WeaponType.DAGGER] -= 0.02;
  }
  if (depth <= 3) {
    weights[WeaponType.GREATSWORD] *= 0.7;
    weights[WeaponType.CROSSBOW] *= 0.6;
  }
  return weightedChoice(weights) || WeaponType.SWORD;
}

function rollWeaponEffect(rarity, factionId) {
  const chance = WeaponEffectChance[rarity] || 0;
  if (Math.random() > chance) return null;
  const options = [WeaponEffects.BLEED, WeaponEffects.STUN, WeaponEffects.PIERCE, WeaponEffects.REFLECT];
  if (factionId === Factions.MACHINE) {
    return randChoice(options.filter((e) => e !== WeaponEffects.BLEED)) || null;
  }
  return randChoice(options);
}

function createWeapon(depth, factionId) {
  const rarity = rollWeaponRarity(depth);
  const weaponType = rollWeaponType(depth);
  const base = WeaponCatalog[weaponType];
  const bonus = WeaponRarityBonus[rarity] || 0;
  const depthBonus = Math.floor((depth - 1) / 3);
  const attack = base.baseAttack + bonus + depthBonus;
  const effect = rollWeaponEffect(rarity, factionId);
  const tags = { ...(base.tags || {}) };
  if (effect && effect.id === WeaponEffects.REFLECT.id) {
    tags.reflect = true;
  }
  return new Item(ItemType.WEAPON, {
    weaponType,
    weaponLabel: base.label,
    rarity,
    attack,
    reach: base.reach || 1,
    range: base.range || 1,
    tags,
    effect: effect || null,
  });
}

function getSpawnMix(depth) {
  return (
    Config.spawnMixByFloor.find((entry) => depth >= entry.floors[0] && depth <= entry.floors[1]) ||
    Config.spawnMixByFloor[Config.spawnMixByFloor.length - 1]
  );
}

function pickFaction(depth) {
  const mix = getSpawnMix(depth);
  return weightedChoice(mix.factions) || Factions.BEAST;
}

function pickEnemyType(depth) {
  const mix = getSpawnMix(depth);
  return weightedChoice(mix.types) || EnemyType.WANDERER;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function key(x, y) {
  return `${x},${y}`;
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
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
      bleed: 0,
      stun: 0,
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
    this.maxHp = 40;
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
      weapon: null,
      shield: null,
    };
    this.kills = 0;
    this.rangedLoaded = false;
  }
}

class Enemy extends Entity {
  constructor(x, y, options = {}) {
    super(x, y);
    this.type = options.type || EnemyType.WANDERER;
    this.depth = options.depth || 1;
    this.faction = options.faction || Factions.BEAST;
    const typeConfig = EnemyTypeConfig[this.type] || EnemyTypeConfig[EnemyType.WANDERER];
    const factionConfig = FactionConfig[this.faction] || FactionConfig[Factions.BEAST];
    const baseAttack = 6 + this.depth * 2;
    this.maxHp = 14 + this.depth * 2;
    this.attack = baseAttack;
    this.defense = 2 + Math.floor(this.depth / 2);
    this.speed = typeConfig.speed || 100;
    this.vision = typeConfig.vision || 6;
    if (this.type === EnemyType.SPRINTER) {
      this.maxHp -= 2;
      this.attack -= 1;
    } else if (this.type === EnemyType.STRATEGIST) {
      this.defense += 1;
    } else if (this.type === EnemyType.AMBUSHER) {
      this.attack += 2;
    }
    if (this.faction === Factions.DEMON) {
      this.attack += 2;
      this.vision += 1;
    } else if (this.faction === Factions.MACHINE) {
      this.defense += 2;
    } else if (this.faction === Factions.SPIRIT) {
      this.speed += 5;
    } else if (this.faction === Factions.BEAST) {
      this.maxHp += 2;
    }
    this.hp = this.maxHp;
    this.energy = 0;
    this.aware = false;
    this.grace = factionConfig.grace ?? Config.graceTurns;
    this.turnsSinceSeen = 0;
    this.factionColor = factionConfig.color;
    this.badge = factionConfig.label;
    this.flags = {
      relentless: !!factionConfig.relentless,
      trapWeak: !!factionConfig.trapWeak,
      stealChance: factionConfig.stealChance || 0,
      phaseChance: factionConfig.phaseChance || 0,
      bleedImmune: !!factionConfig.bleedImmune,
    };
    this.patrolRoute = options.patrolRoute || [];
    this.patrolIndex = 0;
    this.stolenItems = [];
    this.specialFx = null;
  }
}

let cryptoId = 0;
function generateId() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  cryptoId += 1;
  return `id-${Date.now()}-${cryptoId}`;
}

class Item {
  constructor(type, data = {}) {
    this.id = generateId();
    this.type = type;
    Object.assign(this, data);
  }

  get label() {
    switch (this.type) {
      case ItemType.WEAPON: {
        const rarity = this.rarity || "N";
        const effect = this.effect ? `(${this.effect.label})` : "";
        const bonus = this.attack !== undefined ? `+${this.attack}` : "";
        return `${rarity} ${this.weaponLabel}${bonus}${effect}`;
      }
      case ItemType.SHIELD:
        return `盾+${this.bonus ?? 0}`;
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

  get icon() {
    switch (this.type) {
      case ItemType.WEAPON:
        return "⚔";
      case ItemType.SHIELD:
        return "🛡";
      case ItemType.HERB:
        return "🌿";
      case ItemType.SCROLL:
        return "📜";
      case ItemType.BREAD:
        return "🥖";
      case ItemType.STONE:
        return "🪨";
      default:
        return "?";
    }
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.stageElement = document.getElementById("stage");
    this.stageWidth = this.stageElement?.clientWidth || window.innerWidth;
    this.stageHeight = this.stageElement?.clientHeight || window.innerHeight;
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
    this.autoPath = [];
    this.autoRunDirection = null;
    this.autoTimer = null;
    this.lastDirection = null;
    this.visited = new Set();
    this.quickslots = Array(4).fill(null);
    this.ui = null;
    this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };

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

  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.stageElement = document.getElementById("stage") || this.stageElement;
    const width = this.stageElement?.clientWidth || window.innerWidth;
    const height = this.stageElement?.clientHeight || window.innerHeight;
    this.stageWidth = width;
    this.stageHeight = height;
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = Math.max(1, Math.round(width * ratio));
    this.canvas.height = Math.max(1, Math.round(height * ratio));
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const layout = this.determineMapLayout(width, height);
    const mapChanged = Config.mapWidth !== layout.cols || Config.mapHeight !== layout.rows;
    Config.mapWidth = layout.cols;
    Config.mapHeight = layout.rows;
    Config.tileSize = layout.tile;
    if (mapChanged && this.map) {
      this.clearAutomation();
      this.pendingThrow = null;
      this.generateFloor({ preservePlayer: true });
      this.updateHUD();
    }
    if (this.map) {
      this.draw();
    }
  }

  determineMapLayout(width, height) {
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    for (const option of MAP_SIZE_OPTIONS) {
      const tile = Math.floor(Math.min(w / option.cols, h / option.rows));
      if (tile >= MIN_TILE_SIZE) {
        return { cols: option.cols, rows: option.rows, tile };
      }
    }
    const last = MAP_SIZE_OPTIONS[MAP_SIZE_OPTIONS.length - 1];
    const tile = Math.max(8, Math.floor(Math.min(w / last.cols, h / last.rows)));
    return { cols: last.cols, rows: last.rows, tile };
  }

  showTutorial() {
    document.getElementById("tutorial").classList.remove("hidden");
  }

  startNewRun() {
    this.depth = 1;
    this.turn = 0;
    this.playerSlowGate = false;
    this.logMessages = [];
    this.clearAutomation();
    this.lastDirection = null;
    this.quickslots = this.quickslots.map(() => null);
    this.generateFloor();
    this.updateHUD();
    this.resizeCanvas();
    this.pushMessage("地下1Fに降り立った。周囲を探索しよう。");
    this.updateQuickslots();
  }

  generateFloor(options = {}) {
    const preservePlayer = !!options.preservePlayer && !!this.player;
    const generator = new DungeonGenerator(Config.mapWidth, Config.mapHeight, this.depth);
    const result = generator.generate();
    this.map = result.tiles;
    this.rooms = result.rooms;
    const startRoom = this.rooms[0];
    const stairsRoom = this.rooms[this.rooms.length - 1];
    this.map[stairsRoom.center.y][stairsRoom.center.x].terrain = Terrain.STAIRS;
    if (preservePlayer) {
      this.player.x = startRoom.center.x;
      this.player.y = startRoom.center.y;
    } else {
      this.player = new Player(startRoom.center.x, startRoom.center.y);
    }
    this.visited = new Set([key(this.player.x, this.player.y)]);
    this.entities = [this.player];
    this.items = [];
    this.recalculateStats();
    this.placeInitialItems(startRoom);
    this.populateItems();
    this.populateTraps();
    this.spawnEnemies(startRoom.center);
    if (!preservePlayer) {
      this.turn = 0;
    }
    this.playerSlowGate = false;
    this.resetCamera();
    this.updateQuickslots();
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

  placeItemAt(x, y, item) {
    const tile = this.map[y]?.[x];
    if (!tile || !tile.isWalkable() || tile.item) return false;
    tile.item = item;
    this.items.push({ item, x, y });
    return true;
  }

  randomWalkableInRoom(room, avoidSet = new Set()) {
    for (let attempt = 0; attempt < 80; attempt++) {
      const x = randInt(room.x, room.x + room.w - 1);
      const y = randInt(room.y, room.y + room.h - 1);
      const tile = this.map[y]?.[x];
      if (!tile || !tile.isWalkable()) continue;
      if (tile.terrain === Terrain.STAIRS) continue;
      const k = key(x, y);
      if (avoidSet.has(k)) continue;
      if (this.entities.some((e) => e.x === x && e.y === y)) continue;
      if (tile.item) continue;
      return { x, y, tile };
    }
    return null;
  }

  findNearbyTile(center, radius, avoidSet = new Set()) {
    for (let attempt = 0; attempt < 80; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = randInt(1, radius);
      const x = clamp(Math.floor(center.x + Math.cos(angle) * dist), 1, this.map[0].length - 2);
      const y = clamp(Math.floor(center.y + Math.sin(angle) * dist), 1, this.map.length - 2);
      const tile = this.map[y]?.[x];
      if (!tile || !tile.isWalkable() || tile.terrain === Terrain.STAIRS) continue;
      const k = key(x, y);
      if (avoidSet.has(k)) continue;
      if (tile.item) continue;
      return { x, y, tile };
    }
    return null;
  }

  rollEarlyItem() {
    const roll = Math.random();
    if (roll < 0.35) return new Item(ItemType.HERB);
    if (roll < 0.65) return new Item(ItemType.BREAD);
    if (roll < 0.8) return new Item(ItemType.SCROLL);
    if (roll < 0.92) return new Item(ItemType.STONE);
    if (Math.random() < 0.5) {
      return createWeapon(this.depth, null);
    }
    const bonus = randInt(1, 1 + Math.floor(this.depth / 3));
    return new Item(ItemType.SHIELD, { bonus });
  }

  ensureEarlyEquipment(occupied) {
    if (this.depth > 2) return;
    const hasGear = this.items.some(({ item }) => item.type === ItemType.WEAPON || item.type === ItemType.SHIELD);
    if (hasGear) return;
    const rooms = shuffle(this.rooms.slice(1));
    for (const room of rooms) {
      const spot = this.randomWalkableInRoom(room, occupied);
      if (!spot) continue;
      let item;
      if (Math.random() < 0.6) {
        item = createWeapon(this.depth, null);
      } else {
        const bonus = randInt(1, 1 + Math.floor(this.depth / 2));
        item = new Item(ItemType.SHIELD, { bonus });
      }
      if (this.placeItemAt(spot.x, spot.y, item)) {
        occupied.add(key(spot.x, spot.y));
        break;
      }
    }
  }

  populateEarlyItems() {
    const occupied = new Set(this.items.map(({ x, y }) => key(x, y)));
    for (let i = 1; i < this.rooms.length; i++) {
      const room = this.rooms[i];
      const spawnCount = 1 + (Math.random() < 0.4 ? 1 : 0);
      for (let j = 0; j < spawnCount; j++) {
        const spot = this.randomWalkableInRoom(room, occupied);
        if (!spot) continue;
        if (this.placeItemAt(spot.x, spot.y, this.rollEarlyItem())) {
          occupied.add(key(spot.x, spot.y));
        }
      }
    }
    this.ensureEarlyEquipment(occupied);
  }

  placeInitialItems(startRoom) {
    if (this.depth === 1) {
      const taken = new Set([key(startRoom.center.x, startRoom.center.y)]);
      const herb = this.findNearbyTile(startRoom.center, 5, taken);
      if (herb && this.placeItemAt(herb.x, herb.y, new Item(ItemType.HERB))) {
        taken.add(key(herb.x, herb.y));
      }
      const bread = this.findNearbyTile(startRoom.center, 5, taken);
      if (bread && this.placeItemAt(bread.x, bread.y, new Item(ItemType.BREAD))) {
        taken.add(key(bread.x, bread.y));
      }
    } else {
      const radius = clamp(randInt(3, 6), 2, 8);
      const nearby = this.findNearbyTile(startRoom.center, radius);
      if (nearby) {
        const type = Math.random() < 0.6 ? ItemType.HERB : ItemType.BREAD;
        this.placeItemAt(nearby.x, nearby.y, new Item(type));
      }
    }
  }

  populateItems() {
    if (this.depth <= Config.earlyDepthLimit) {
      this.populateEarlyItems();
      return;
    }
    const count = Config.baseItems + Math.floor(this.depth * 1.5);
    for (let i = 0; i < count; i++) {
      const found = this.randomFloorTile();
      if (!found) continue;
      const { x, y } = found;
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
      } else {
        if (roll < 0.9) {
          item = createWeapon(this.depth, null);
        } else {
          item = new Item(ItemType.SHIELD, {
            bonus: randInt(1, 2 + Math.floor(this.depth / 3)),
          });
        }
      }
      this.placeItemAt(x, y, item);
    }
  }

  populateTraps() {
    if (this.depth === 1) return;
    let factor = 1;
    if (this.depth === 2) factor = 0.25;
    else if (this.depth === 3) factor = 0.4;
    else if (this.depth <= 6) factor = 0.75;
    const base = Config.baseTraps + this.depth * 3;
    const count = Math.max(0, Math.floor(base * factor));
    for (let i = 0; i < count; i++) {
      const found = this.randomFloorTile();
      if (!found) continue;
      const { tile } = found;
      if (tile.trap) continue;
      tile.trap = { type: randChoice(Object.values(TrapType)), armed: true };
    }
  }

  spawnEnemies(startCenter) {
    const safeRadius = 6;
    if (this.depth <= Config.earlyDepthLimit) {
      const occupied = new Set([key(startCenter.x, startCenter.y)]);
      const maxTotal = Math.max(4, Math.floor(this.rooms.length * 1.2));
      let total = 0;
      for (let i = 1; i < this.rooms.length && total < maxTotal; i++) {
        const room = this.rooms[i];
        let spawnCount = Math.random() < 0.25 ? 0 : 1;
        if (Math.random() < 0.3) spawnCount = Math.min(Config.earlyRoomEnemyCap, spawnCount + 1);
        const roomAvoid = new Set(occupied);
        let attempts = 0;
        while (spawnCount > 0 && attempts < 20) {
          attempts++;
          const spot = this.randomWalkableInRoom(room, roomAvoid);
          if (!spot) break;
          const spotKey = key(spot.x, spot.y);
          roomAvoid.add(spotKey);
          const distSq = (spot.x - startCenter.x) ** 2 + (spot.y - startCenter.y) ** 2;
          if (distSq < safeRadius * safeRadius) continue;
          const faction = pickFaction(this.depth);
          const type = pickEnemyType(this.depth);
          const enemy = new Enemy(spot.x, spot.y, { type, depth: this.depth, faction });
          if (enemy.type === EnemyType.PATROLLER) {
            enemy.patrolRoute = this.buildPatrolRoute(enemy.x, enemy.y);
          }
          this.entities.push(enemy);
          occupied.add(spotKey);
          total++;
          spawnCount--;
          if (total >= maxTotal) break;
        }
      }
      const minTotal = Math.max(3, Math.floor(this.rooms.length * 0.6));
      let safety = 0;
      while (total < minTotal && safety < 30) {
        safety++;
        const found = this.randomFloorTile({ avoid: { x: startCenter.x, y: startCenter.y, radius: safeRadius } });
        if (!found) break;
        const { x, y } = found;
        const spotKey = key(x, y);
        if (occupied.has(spotKey)) continue;
        const faction = pickFaction(this.depth);
        const type = pickEnemyType(this.depth);
        const enemy = new Enemy(x, y, { type, depth: this.depth, faction });
        if (enemy.type === EnemyType.PATROLLER) {
          enemy.patrolRoute = this.buildPatrolRoute(enemy.x, enemy.y);
        }
        this.entities.push(enemy);
        occupied.add(spotKey);
        total++;
      }
      return;
    }
    const count = Config.baseEnemies + Math.floor(this.depth * 1.6);
    for (let i = 0; i < count; i++) {
      const found = this.randomFloorTile({ avoid: { x: startCenter.x, y: startCenter.y, radius: safeRadius } });
      if (!found) continue;
      const { x, y } = found;
      const faction = pickFaction(this.depth);
      const type = pickEnemyType(this.depth);
      const enemy = new Enemy(x, y, { type, depth: this.depth, faction });
      if (enemy.type === EnemyType.PATROLLER) {
        enemy.patrolRoute = this.buildPatrolRoute(enemy.x, enemy.y);
      }
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

  }

  handleMove(dirKey, source = "manual") {
    if (this.state !== "running") return;
    const isAuto = source === "auto" || source === "autoRun";

    if (!isAuto) {
      this.clearAutomation();
    }

    if (this.pendingThrow) {
      if (isAuto) {
        this.clearAutomation();
        return;
      }
      const dir = this.player.effects.reverse > 0 ? this.getReversedDirection(dirKey) : dirKey;
      this.performThrow(Directions[dir]);
      return;
    }

    const weapon = this.player.equipment.weapon;
    if (this.player.effects.snare > 0) {
      if (isAuto) this.clearAutomation();
      this.pushMessage("罠に拘束されて動けない…");
      this.player.effects.snare = Math.max(0, this.player.effects.snare - 1);
      this.endPlayerTurn(ActionCost.MAJOR);
      return;
    }
    if (this.player.effects.slow > 0 && !this.playerSlowGate) {
      this.playerSlowGate = true;
      this.pushMessage("動きが鈍くて足が重い…");
      this.endPlayerTurn(ActionCost.MAJOR);
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

    if (weapon?.tags?.ranged && this.player.rangedLoaded) {
      const fired = this.fireRangedWeapon(dir);
      if (isAuto) this.clearAutomation();
      if (fired) {
        this.endPlayerTurn(ActionCost.MAJOR);
      }
      return;
    }

    const nx = this.player.x + dir.x;
    const ny = this.player.y + dir.y;
    const tile = this.map[ny]?.[nx];
    if (!tile || !tile.isWalkable()) {
      if (isAuto) {
        this.clearAutomation();
        this.showToast("進行が止まった");
      } else {
        this.pushMessage("壁が行く手を阻む。");
      }
      return;
    }

    const enemy = this.entities.find((e) => e !== this.player && e.x === nx && e.y === ny && e.isAlive());
    if (weapon?.tags?.reach && !enemy && tile.isWalkable()) {
      const fx = nx + dir.x;
      const fy = ny + dir.y;
      const farEnemy = this.entities.find((e) => e !== this.player && e.x === fx && e.y === fy && e.isAlive());
      if (farEnemy) {
        this.resolveCombat(this.player, farEnemy);
        if (!farEnemy.isAlive()) {
          this.player.kills++;
          this.entities = this.entities.filter((e) => e.isAlive());
          this.gainExp(12 + this.depth * 2);
        }
        if (isAuto) this.clearAutomation();
        this.endPlayerTurn(ActionCost.MAJOR);
        return;
      }
    }
    if (enemy) {
      this.resolveCombat(this.player, enemy);
      if (!enemy.isAlive()) {
        this.player.kills++;
        this.entities = this.entities.filter((e) => e.isAlive());
        this.gainExp(10 + this.depth * 2);
      }
      if (isAuto) this.clearAutomation();
      this.endPlayerTurn(ActionCost.MAJOR);
      return;
    }

    const targetKey = key(nx, ny);
    const wasVisited = this.visited.has(targetKey);
    const trapAhead = tile.trap && tile.trap.armed;

    this.player.x = nx;
    this.player.y = ny;
    this.lastDirection = effectiveDir;
    this.visited.add(targetKey);

    if (isAuto) {
      if (trapAhead || !wasVisited || this.isBranchTile(nx, ny) || tile.terrain === Terrain.STAIRS) {
        this.clearAutomation();
        this.showToast("様子を伺って立ち止まった");
      }
    }

    this.handleTileEffects(tile);
    this.endPlayerTurn(ActionCost.MAJOR);
  }

  getReversedDirection(dirKey) {
    if (dirKey === "up") return "down";
    if (dirKey === "down") return "up";
    if (dirKey === "left") return "right";
    if (dirKey === "right") return "left";
    return dirKey;
  }

  handleAction(action, source = "manual") {
    if (this.state !== "running") return;
    if (source !== "auto" && source !== "autoRun") {
      this.clearAutomation();
    }
    if (action === Action.WAIT) {
      if (this.player.effects.snare > 0) {
        this.player.effects.snare = Math.max(0, this.player.effects.snare - 1);
      }
      this.pushMessage("私は身構えて様子を伺った。");
      this.endPlayerTurn(ActionCost.MAJOR);
    }
  }

  clearAutomation() {
    this.autoPath = [];
    this.autoRunDirection = null;
    if (this.autoTimer) {
      clearTimeout(this.autoTimer);
      this.autoTimer = null;
    }
  }

  scheduleAutomation() {
    if (this.autoTimer || this.state !== "running") return;
    if (!this.autoPath.length && !this.autoRunDirection) return;
    this.autoTimer = setTimeout(() => {
      this.autoTimer = null;
      if (this.state !== "running") return;
      if (this.autoPath.length) {
        const next = this.autoPath.shift();
        if (!next) {
          this.clearAutomation();
          return;
        }
        const dx = next.x - this.player.x;
        const dy = next.y - this.player.y;
        const dir = this.directionFromDelta(dx, dy);
        if (dir) {
          this.handleMove(dir, "auto");
        } else {
          this.clearAutomation();
        }
      } else if (this.autoRunDirection) {
        this.handleMove(this.autoRunDirection, "autoRun");
      }
    }, Config.autoMoveDelay);
  }

  startAutoRun(direction) {
    if (this.state !== "running") return;
    if (this.pendingThrow) {
      this.showToast("投擲中は移動できない");
      return;
    }
    this.autoPath = [];
    this.autoRunDirection = direction;
    this.lastDirection = direction;
    this.scheduleAutomation();
    this.showToast("オートラン開始");
  }

  toggleAutoRun() {
    if (this.autoRunDirection) {
      this.clearAutomation();
      this.showToast("オートラン停止");
      return;
    }
    if (!this.lastDirection) {
      this.showToast("先に進む方向を入力して");
      return;
    }
    this.startAutoRun(this.lastDirection);
  }

  directionFromDelta(dx, dy) {
    if (dx === 1 && dy === 0) return "right";
    if (dx === -1 && dy === 0) return "left";
    if (dx === 0 && dy === 1) return "down";
    if (dx === 0 && dy === -1) return "up";
    return null;
  }

  walkableNeighborsCount(x, y) {
    let count = 0;
    for (const dir of Object.values(Directions)) {
      const nx = x + dir.x;
      const ny = y + dir.y;
      const tile = this.map[ny]?.[nx];
      if (tile && tile.isWalkable()) count++;
    }
    return count;
  }

  isBranchTile(x, y) {
    return this.walkableNeighborsCount(x, y) >= 3;
  }

  handleTapMove(px, py) {
    if (this.state !== "running") return;
    if (this.pendingThrow) {
      this.showToast("先に投擲方向を選ぼう");
      return;
    }
    this.clearAutomation();
    const tileSize = Config.tileSize;
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;
    const offsetX = (width - this.map[0].length * tileSize) / 2;
    const offsetY = (height - this.map.length * tileSize) / 2;
    const tx = Math.floor((px - offsetX) / tileSize);
    const ty = Math.floor((py - offsetY) / tileSize);
    if (tx === this.player.x && ty === this.player.y) {
      this.confirmAction();
      return;
    }
    if (tx < 0 || ty < 0 || ty >= this.map.length || tx >= this.map[0].length) return;
    const tile = this.map[ty]?.[tx];
    if (!tile || !tile.isWalkable()) {
      this.showToast("そこへは進めない");
      return;
    }
    const path = this.findPathTo({ x: tx, y: ty });
    if (!path || path.length <= 1) {
      this.showToast("経路がない");
      return;
    }
    this.autoPath = path.slice(1);
    this.autoRunDirection = null;
    this.scheduleAutomation();
    this.showToast("目的地へ移動開始");
  }

  prepareThrow() {
    if (this.pendingThrow) {
      this.showToast("投擲準備中");
      return;
    }
    this.clearAutomation();
    const stone = this.player.inventory.find((item) => item.type === ItemType.STONE);
    if (!stone) {
      this.showToast("投げられる物がない");
      return;
    }
    this.pendingThrow = stone;
    this.pushMessage("投げたい方向を選ぼう。");
    this.showToast("方向入力で投擲");
  }

  quickEquip() {
    this.clearAutomation();
    const weapons = this.player.inventory.filter((item) => item.type === ItemType.WEAPON);
    const shields = this.player.inventory.filter((item) => item.type === ItemType.SHIELD);
    let equipped = false;
    if (weapons.length) {
      const bestWeapon = weapons.reduce(
        (best, item) => (item.attack > (best?.attack ?? -Infinity) ? item : best),
        null
      );
      if (bestWeapon) {
        this.equipItem(bestWeapon);
        equipped = true;
      }
    }
    if (shields.length) {
      const bestShield = shields.reduce((best, item) => (item.bonus > (best?.bonus ?? -Infinity) ? item : best), null);
      if (bestShield) {
        this.equipItem(bestShield);
        equipped = true;
      }
    }
    if (equipped) {
      this.showToast("装備を整えた");
      this.updateHUD();
    } else {
      this.showToast("装備できる物がない");
    }
  }

  consumeFood() {
    const food = this.player.inventory.find((item) => item.type === ItemType.BREAD);
    if (!food) {
      this.showToast("食料がない");
      return;
    }
    this.clearAutomation();
    this.useItem(food, { fromQuickslot: true });
  }

  attachUI(ui) {
    this.ui = ui;
    if (Array.isArray(ui.quickslotButtons) && ui.quickslotButtons.length !== this.quickslots.length) {
      this.quickslots = Array(ui.quickslotButtons.length).fill(null);
    }
    this.updateQuickslots();
  }

  cleanQuickslots() {
    const inventory = this.player?.inventory || [];
    const ids = new Set(inventory.map((item) => item.id));
    this.quickslots = this.quickslots.map((slot) => {
      if (!slot) return null;
      if (!ids.has(slot.itemId)) return null;
      return slot;
    });
  }

  getQuickslotState() {
    this.cleanQuickslots();
    const inventory = this.player?.inventory || [];
    return this.quickslots.map((slot, index) => {
      if (!slot) {
        return { index, empty: true };
      }
      const item = inventory.find((it) => it.id === slot.itemId);
      if (!item) {
        this.quickslots[index] = null;
        return { index, empty: true };
      }
      return {
        index,
        empty: false,
        icon: item.icon,
        label: item.label,
        type: item.type,
      };
    });
  }

  updateQuickslots() {
    if (this.ui?.renderQuickslots) {
      this.ui.renderQuickslots(this.getQuickslotState());
    }
  }

  assignQuickslot(index, itemId) {
    if (index < 0 || index >= this.quickslots.length) return;
    if (!this.player) return;
    const item = this.player.inventory.find((i) => i.id === itemId);
    if (!item) {
      this.showToast("登録できない");
      return;
    }
    this.quickslots[index] = {
      itemId: item.id,
      type: item.type,
    };
    this.showToast(`${item.label} を登録した`);
    this.updateQuickslots();
  }

  clearQuickslot(index) {
    if (index < 0 || index >= this.quickslots.length) return;
    if (!this.player) return;
    this.quickslots[index] = null;
    this.updateQuickslots();
  }

  useQuickSlot(index) {
    if (index < 0 || index >= this.quickslots.length) return;
    if (!this.player) return;
    const slot = this.quickslots[index];
    if (!slot) {
      this.showToast("空のスロット");
      return;
    }
    const item = this.player.inventory.find((i) => i.id === slot.itemId);
    if (!item) {
      this.quickslots[index] = null;
      this.updateQuickslots();
      this.showToast("アイテムが見つからない");
      return;
    }
    if (item.type === ItemType.WEAPON || item.type === ItemType.SHIELD) {
      this.equipItem(item);
      this.updateQuickslots();
      return;
    }
    this.useItem(item, { fromQuickslot: true, sourceSlot: index });
    this.updateQuickslots();
  }

  confirmAction() {
    this.clearAutomation();
    const tile = this.map[this.player.y][this.player.x];
    if (!tile) return;
    if (tile.terrain === Terrain.STAIRS) {
      this.pushMessage("階段を慎重に降りた。");
      this.nextFloor();
      return;
    }
    const weapon = this.player.equipment.weapon;
    const traps = [];
    for (const dy of [-1, 0, 1]) {
      for (const dx of [-1, 0, 1]) {
        const nx = this.player.x + dx;
        const ny = this.player.y + dy;
        const target = this.map[ny]?.[nx];
        if (target?.trap && target.trap.armed) {
          traps.push(target);
        }
      }
    }
    if (traps.length) {
      for (const trap of traps) {
        trap.trap.armed = false;
      }
      this.pushMessage("足元の罠を見つけて解除した！");
      this.endPlayerTurn(ActionCost.MAJOR);
      return;
    }
    if (weapon?.tags?.ranged) {
      if (!this.player.rangedLoaded) {
        this.player.rangedLoaded = true;
        this.pushMessage(`${weapon.weaponLabel} に矢をつがえた。`);
        this.showToast("装填完了");
        this.endPlayerTurn(ActionCost.MINOR);
      } else {
        this.player.rangedLoaded = false;
        this.showToast("構えを解いた");
        this.endPlayerTurn(ActionCost.FREE);
      }
      return;
    }
    this.pushMessage("周囲を警戒したが異常はなさそうだ。");
    this.endPlayerTurn(ActionCost.MINOR);
  }

  drawMinimap(force = false) {
    const canvas = document.getElementById("minimap");
    const container = document.getElementById("minimap-container");
    if (!canvas || !this.map) return;
    if (!force && container?.getAttribute("aria-hidden") === "true") return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const displayW = canvas.clientWidth || canvas.width;
    const displayH = canvas.clientHeight || canvas.height;
    if (canvas.width !== Math.floor(displayW * dpr) || canvas.height !== Math.floor(displayH * dpr)) {
      canvas.width = Math.floor(displayW * dpr);
      canvas.height = Math.floor(displayH * dpr);
    }
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    const cols = this.map[0].length;
    const rows = this.map.length;
    const cellW = displayW / cols;
    const cellH = displayH / rows;
    const itemCoords = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const tile = this.map[y][x];
        if (!tile) continue;
        let color = "#0f172a";
        if (tile.terrain === Terrain.ROOM) color = "#1f2a44";
        else if (tile.terrain === Terrain.FLOOR) color = "#162238";
        else if (tile.terrain === Terrain.STAIRS) color = "#2f4f6f";
        ctx.fillStyle = color;
        ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
        if (tile.item) {
          itemCoords.push({ x, y });
        }
      }
    }
    const baseRadius = Math.min(cellW, cellH);
    const itemRadius = Math.max(2, baseRadius * 0.18);
    ctx.fillStyle = "#2dd4bf";
    for (const pos of itemCoords) {
      const cx = pos.x * cellW + cellW / 2;
      const cy = pos.y * cellH + cellH / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, itemRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    const enemyRadius = Math.max(itemRadius * 1.2, baseRadius * 0.24);
    ctx.fillStyle = "#f87171";
    for (const enemy of this.entities) {
      if (enemy === this.player || !enemy.isAlive()) continue;
      const cx = enemy.x * cellW + cellW / 2;
      const cy = enemy.y * cellH + cellH / 2;
      ctx.fillStyle = enemy.factionColor || "#f87171";
      ctx.beginPath();
      ctx.arc(cx, cy, enemyRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    const playerRadius = Math.max(enemyRadius * 1.4, baseRadius * 0.32);
    const playerX = this.player.x * cellW + cellW / 2;
    const playerY = this.player.y * cellH + cellH / 2;
    ctx.fillStyle = "#facc15";
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = Math.max(1.5, playerRadius * 0.28);
    ctx.beginPath();
    ctx.arc(playerX, playerY, playerRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const dirAngles = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 };
    const angle = dirAngles[this.lastDirection] ?? -Math.PI / 2;
    ctx.save();
    ctx.translate(playerX, playerY);
    ctx.rotate(angle);
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.moveTo(0, -playerRadius * 1.4);
    ctx.lineTo(-playerRadius * 0.45, -playerRadius * 0.15);
    ctx.lineTo(playerRadius * 0.45, -playerRadius * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.restore();
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
      enemy.turnsSinceSeen = 0;
      enemy.grace = 0;
    }
  }

  getHungerDrain() {
    if (this.depth <= Config.earlyDepthLimit) {
      return Config.earlyHungerPerTurn;
    }
    return Config.baseHungerPerTurn;
  }

  endPlayerTurn(cost = ActionCost.MAJOR) {
    if (cost === ActionCost.FREE) {
      this.processItemsOnTile();
      this.updateHUD();
      this.draw();
      return;
    }
    this.turn++;
    const hungerDrain = this.getHungerDrain();
    if (cost === ActionCost.MINOR) {
      this.player.hunger = Math.max(0, this.player.hunger - hungerDrain * Config.balance.minorHungerFactor);
      this.processItemsOnTile();
      this.updateHUD();
      this.draw();
      this.scheduleAutomation();
      return;
    }
    this.player.hunger = Math.max(0, this.player.hunger - hungerDrain);
    if (this.player.hunger <= 0) {
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
    this.scheduleAutomation();
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
      this.updateQuickslots();
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
      if (enemy.status.stun > 0) {
        enemy.status.stun--;
        continue;
      }
      if (enemy.status.snare > 0) {
        enemy.status.snare--;
        continue;
      }
      if (enemy.status.bleed > 0) {
        enemy.hp = Math.max(0, enemy.hp - 2);
        enemy.status.bleed--;
        if (!enemy.isAlive()) {
          this.player.kills++;
          this.gainExp(8 + this.depth * 2);
          this.entities = this.entities.filter((e) => e.isAlive());
          continue;
        }
      }
      enemy.energy += enemy.speed;
      while (enemy.energy >= 100) {
        enemy.energy -= 100;
        const early = this.depth <= Config.earlyDepthLimit;
        if (early && Math.random() > Config.earlyEnemyActionChance) {
          if (enemy.grace > 0) enemy.grace--;
          continue;
        }
        this.enemyAct(enemy);
        if (!this.player.isAlive()) return;
      }
    }
  }

  enemyAct(enemy) {
    const dx = this.player.x - enemy.x;
    const dy = this.player.y - enemy.y;
    const distManhattan = Math.abs(dx) + Math.abs(dy);
    const distSq = dx * dx + dy * dy;
    const early = this.depth <= Config.earlyDepthLimit;
    const sightRadius = early ? Config.earlyEnemySight : 6;
    const withinSight = early ? distSq <= sightRadius * sightRadius : distManhattan <= sightRadius;

    if (!enemy.aware) {
      if (enemy.grace > 0) {
        enemy.grace--;
      }
      if ((enemy.grace <= 0 && withinSight) || (!early && enemy.grace <= 0)) {
        enemy.aware = true;
        enemy.turnsSinceSeen = 0;
      } else {
        this.enemyIdleMove(enemy);
        return;
      }
    }

    if (early) {
      if (withinSight) {
        enemy.turnsSinceSeen = 0;
      } else {
        enemy.turnsSinceSeen = (enemy.turnsSinceSeen || 0) + 1;
        if (enemy.turnsSinceSeen >= Config.earlyEnemyChaseTurns) {
          enemy.aware = false;
          enemy.turnsSinceSeen = 0;
          enemy.grace = Config.graceTurns;
          this.enemyIdleMove(enemy);
          return;
        }
      }
    } else {
      if (withinSight) {
        enemy.turnsSinceSeen = 0;
      } else {
        enemy.turnsSinceSeen = (enemy.turnsSinceSeen || 0) + 1;
        const chaseLimit = enemy.flags.relentless ? 999 : 8;
        if (enemy.turnsSinceSeen >= chaseLimit) {
          enemy.aware = false;
          enemy.turnsSinceSeen = 0;
          enemy.grace = Config.graceTurns;
          this.enemyIdleMove(enemy);
          return;
        }
      }
    }

    if (distManhattan === 1) {
      if (enemy.flags.stealChance > 0 && Math.random() < enemy.flags.stealChance) {
        this.enemySteal(enemy);
        return;
      }
      this.resolveCombat(enemy, this.player, { faction: enemy.faction });
      if (!this.player.isAlive()) {
        this.gameOver("敵に倒されてしまった…");
      }
      return;
    }

    if (enemy.type === EnemyType.PATROLLER && !enemy.aware) {
      this.followPatrol(enemy);
      return;
    }

    let path = null;
    if (enemy.type === EnemyType.STRATEGIST || enemy.type === EnemyType.PATROLLER || enemy.type === EnemyType.AMBUSHER) {
      path = this.findPath(enemy, this.player);
    } else if (enemy.type === EnemyType.SPRINTER && Math.random() < 0.5) {
      path = this.findPath(enemy, this.player);
    }

    if (enemy.type === EnemyType.AMBUSHER) {
      const predicted = this.predictPlayerTile();
      if (predicted) {
        const ambushPath = this.findPath(enemy, predicted);
        if (ambushPath && ambushPath.length > 1) {
          if (this.moveEnemyTo(enemy, ambushPath[1].x, ambushPath[1].y, { event: "ambush" })) {
            return;
          }
        }
      }
    }

    if (path && path.length > 1) {
      if (this.moveEnemyTo(enemy, path[1].x, path[1].y)) {
        return;
      }
    }

    if (enemy.type === EnemyType.PATROLLER) {
      this.followPatrol(enemy);
      return;
    }

    this.chaseOrWander(enemy);
  }

  moveEnemyTo(enemy, nx, ny, options = {}) {
    if (nx === this.player.x && ny === this.player.y) return false;
    const tile = this.map[ny]?.[nx];
    if (!tile) return false;
    if (!tile.isWalkable()) {
      if (enemy.flags.phaseChance && Math.random() < enemy.flags.phaseChance) {
        enemy.specialFx = { symbol: "〰", ttl: 8, color: enemy.factionColor };
      } else {
        return false;
      }
    }
    if (this.entities.some((e) => e !== enemy && e !== this.player && e.isAlive() && e.x === nx && e.y === ny)) return false;
    enemy.x = nx;
    enemy.y = ny;
    if (options.event === "ambush") {
      enemy.specialFx = { symbol: "👣", ttl: 8, color: enemy.factionColor };
    }
    return true;
  }

  enemyIdleMove(enemy) {
    if (enemy.type === EnemyType.PATROLLER) {
      this.followPatrol(enemy);
    } else {
      this.wander(enemy);
    }
  }

  predictPlayerTile() {
    if (!this.lastDirection) return null;
    const dir = Directions[this.lastDirection];
    if (!dir) return null;
    let x = this.player.x;
    let y = this.player.y;
    for (let i = 0; i < 2; i++) {
      const nx = x + dir.x;
      const ny = y + dir.y;
      const tile = this.map[ny]?.[nx];
      if (!tile || !tile.isWalkable()) break;
      x = nx;
      y = ny;
    }
    return { x, y };
  }

  enemySteal(enemy) {
    if (!this.player.inventory.length) {
      this.pushMessage("盗もうとしたが何も持っていない。");
      return;
    }
    const item = randChoice(this.player.inventory);
    this.player.inventory = this.player.inventory.filter((i) => i.id !== item.id);
    enemy.stolenItems.push(item);
    enemy.aware = false;
    enemy.turnsSinceSeen = 0;
    enemy.grace = Config.graceTurns + 1;
    this.pushMessage("盗賊にアイテムを奪われた！");
    this.showToast(`${item.label} を盗まれた`);
    this.recalculateStats();
    this.updateHUD();
    this.updateQuickslots();
    this.enemyIdleMove(enemy);
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

  findPathTo(goal) {
    const start = { x: this.player.x, y: this.player.y };
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
        if (this.entities.some((e) => e !== this.player && e.isAlive() && e.x === nx && e.y === ny)) continue;
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

  buildPatrolRoute(x, y) {
    const points = [];
    let cx = x;
    let cy = y;
    const order = [Directions.right, Directions.down, Directions.left, Directions.up];
    for (const dir of order) {
      let step = 0;
      let nextX = cx;
      let nextY = cy;
      while (step < 4) {
        const nx = nextX + dir.x;
        const ny = nextY + dir.y;
        const tile = this.map[ny]?.[nx];
        if (!tile || !tile.isWalkable()) break;
        nextX = nx;
        nextY = ny;
        step++;
      }
      if (nextX !== cx || nextY !== cy) {
        points.push({ x: nextX, y: nextY });
        cx = nextX;
        cy = nextY;
      }
    }
    if (!points.length) {
      points.push({ x, y });
    }
    return points;
  }

  followPatrol(enemy) {
    if (!enemy.patrolRoute.length) {
      this.wander(enemy);
      return;
    }
    const target = enemy.patrolRoute[enemy.patrolIndex % enemy.patrolRoute.length];
    if (enemy.x === target.x && enemy.y === target.y) {
      enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolRoute.length;
    }
    const nextTarget = enemy.patrolRoute[enemy.patrolIndex % enemy.patrolRoute.length];
    const path = this.findPath(enemy, nextTarget);
    if (path && path.length > 1) {
      if (this.moveEnemyTo(enemy, path[1].x, path[1].y)) {
        return;
      }
    }
    this.wander(enemy);
  }

  resolveCombat(attacker, defender, options = {}) {
    let attackValue = attacker.attack;
    let defenseValue = defender.defense;
    let pierceBonus = 0;
    let applyBleed = false;
    let applyStun = false;
    let reflectGuard = false;
    if (attacker === this.player) {
      const weapon = this.player.equipment.weapon;
      if (weapon) {
        attackValue = this.player.baseAttack + weapon.attack;
        if (weapon.tags?.attackMod) {
          attackValue += weapon.tags.attackMod;
        }
        if (weapon.effect?.id === WeaponEffects.PIERCE.id) {
          pierceBonus = 2;
        }
        if (weapon.effect?.id === WeaponEffects.BLEED.id) {
          applyBleed = true;
        }
        if (weapon.effect?.id === WeaponEffects.STUN.id) {
          applyStun = true;
        }
        if (weapon.tags?.firstStrike) {
          defender.energy = 0;
        }
        if (weapon.tags?.heavy && Math.random() < 0.12) {
          this.player.effects.slow = Math.max(this.player.effects.slow, 1);
          this.pushMessage("武器が重くて隙が生まれた…");
        }
      }
    } else if (defender === this.player) {
      const weapon = this.player.equipment.weapon;
      if (weapon?.effect?.id === WeaponEffects.REFLECT.id) {
        reflectGuard = true;
      }
      if (weapon?.tags?.heavy) {
        defenseValue += 1;
      }
    }
    const attackRoll = attackValue + randInt(0, 2);
    let defenseRoll = defenseValue + randInt(0, 2) - pierceBonus;
    defenseRoll = Math.max(0, defenseRoll);
    const damage = Math.max(1, attackRoll - defenseRoll);
    defender.hp = Math.max(0, defender.hp - damage);
    const attackerName = attacker === this.player ? "私" : "敵";
    const defenderName = defender === this.player ? "私" : "敵";
    this.pushMessage(`${attackerName}は${defenderName}に${damage}のダメージ！`);
    if (attacker === this.player && defender instanceof Enemy) {
      if (applyBleed && !defender.flags.bleedImmune) {
        defender.status.bleed = Math.max(defender.status.bleed, 3);
        this.pushMessage("出血させた！");
      }
      if (applyStun) {
        defender.status.stun = Math.max(defender.status.stun, 1);
        this.pushMessage("敵の動きを止めた！");
      }
    }
    if (defender === this.player && reflectGuard && damage > 0) {
      attacker.hp = Math.max(0, attacker.hp - Math.ceil(damage / 2));
      if (attacker.hp <= 0) {
        this.pushMessage("反射の光が敵を焼いた！");
      } else {
        this.pushMessage("反射の光で敵にダメージ！");
      }
    }
    if (attacker !== this.player && attacker instanceof Enemy && attacker.hp <= 0) {
      this.player.kills++;
      this.entities = this.entities.filter((e) => e.isAlive());
      this.gainExp(10 + this.depth * 2);
    }
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
    this.clearAutomation();
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
        if (item.type === ItemType.WEAPON || item.type === ItemType.SHIELD) {
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
        li.draggable = true;
        li.dataset.itemId = item.id;
        li.addEventListener("dragstart", (ev) => {
          ev.dataTransfer?.setData("text/plain", item.id);
          ev.dataTransfer?.setDragImage(label, 0, 0);
        });
        list.appendChild(li);
      }
    }
    overlay.classList.remove("hidden");
  }

  closeInventory() {
    document.getElementById("menu-overlay").classList.add("hidden");
  }

  equipItem(item) {
    if (item.type === ItemType.WEAPON) {
      const previous = this.player.equipment.weapon;
      this.player.inventory = this.player.inventory.filter((i) => i.id !== item.id);
      if (previous) {
        this.player.inventory.push(previous);
      }
      this.player.equipment.weapon = item;
      this.player.rangedLoaded = false;
    } else if (item.type === ItemType.SHIELD) {
      const previous = this.player.equipment.shield;
      this.player.inventory = this.player.inventory.filter((i) => i.id !== item.id);
      if (previous) {
        this.player.inventory.push(previous);
      }
      this.player.equipment.shield = item;
    }
    this.recalculateStats();
    this.pushMessage(`${item.label} を装備した。`);
    this.updateHUD();
    this.updateQuickslots();
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
    this.updateQuickslots();
  }

  recalculateStats() {
    let attack = this.player.baseAttack;
    let defense = this.player.baseDefense;
    const weapon = this.player.equipment.weapon;
    if (weapon) {
      attack += weapon.attack + (weapon.tags?.attackMod || 0);
    }
    if (this.player.equipment.shield) defense += this.player.equipment.shield.bonus;
    this.player.attack = attack;
    this.player.defense = defense;
  }

  useItem(item, { fromQuickslot = false } = {}) {
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
    if (!fromQuickslot) this.closeInventory();
    this.updateQuickslots();
    this.endPlayerTurn(fromQuickslot ? ActionCost.MINOR : ActionCost.MAJOR);
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
    this.updateQuickslots();
    this.endPlayerTurn(ActionCost.MAJOR);
  }

  fireRangedWeapon(direction) {
    const weapon = this.player.equipment.weapon;
    if (!weapon) return false;
    let x = this.player.x;
    let y = this.player.y;
    let hit = false;
    for (let i = 0; i < weapon.range; i++) {
      x += direction.x;
      y += direction.y;
      const tile = this.map[y]?.[x];
      if (!tile || !tile.isWalkable()) break;
      const enemy = this.entities.find((e) => e !== this.player && e.x === x && e.y === y && e.isAlive());
      if (enemy) {
        this.resolveCombat(this.player, enemy);
        if (!enemy.isAlive()) {
          this.player.kills++;
          this.entities = this.entities.filter((e) => e.isAlive());
          this.gainExp(12 + this.depth * 2);
        }
        hit = true;
        break;
      }
    }
    if (!hit) {
      this.pushMessage("矢は空を切った。");
    }
    this.player.rangedLoaded = false;
    return true;
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
    const hungerValue = Math.max(0, this.player.hunger);
    const hungerDisplay = Number.isInteger(hungerValue) ? hungerValue : hungerValue.toFixed(1);
    document.getElementById("ui-hunger").textContent = `${hungerDisplay}%`;
    document.getElementById("ui-atk").textContent = this.player.attack;
    document.getElementById("ui-def").textContent = this.player.defense;
    document.getElementById("ui-inventory").textContent = `${this.inventoryCount()} / ${Config.maxInventory}`;
  }

  pushMessage(message) {
    this.logMessages.push(message);
    if (this.logMessages.length > 8) this.logMessages.shift();
    const recent = this.logMessages.slice(-2);
    this.messageLog.innerHTML = recent.map((m) => `<p>${m}</p>`).join("");
  }

  showToast(text) {
    this.toast.textContent = text;
    this.toast.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast.classList.remove("show");
    }, 1800);
  }

  resetCamera() {
    if (!this.player) return;
    const px = this.player.x + 0.5;
    const py = this.player.y + 0.5;
    this.camera.x = px;
    this.camera.y = py;
    this.camera.targetX = px;
    this.camera.targetY = py;
  }

  updateCamera(force = false) {
    if (!this.player) return;
    const px = this.player.x + 0.5;
    const py = this.player.y + 0.5;
    if (force) {
      this.camera.x = px;
      this.camera.y = py;
      this.camera.targetX = px;
      this.camera.targetY = py;
      return;
    }
    const deadzone = Config.camera.deadzone;
    if (Math.abs(px - this.camera.targetX) > deadzone) {
      this.camera.targetX = px;
    }
    if (Math.abs(py - this.camera.targetY) > deadzone) {
      this.camera.targetY = py;
    }
    this.camera.x += (this.camera.targetX - this.camera.x) * Config.camera.lerp;
    this.camera.y += (this.camera.targetY - this.camera.y) * Config.camera.lerp;
  }

  draw() {
    if (!this.map) return;
    const ctx = this.ctx;
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#050b18";
    ctx.fillRect(0, 0, width, height);
    const tileSize = Config.tileSize;
    this.updateCamera();
    const offsetX = width / 2 - (this.camera.x - 0.5) * tileSize;
    const offsetY = height / 2 - (this.camera.y - 0.5) * tileSize;
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
    const now = performance.now();
    for (const entity of this.entities) {
      if (!entity.isAlive()) continue;
      let visible = true;
      if (this.player?.effects.fog > 0) {
        const dxFog = entity.x - this.player.x;
        const dyFog = entity.y - this.player.y;
        visible = dxFog * dxFog + dyFog * dyFog <= Config.fogRadius * Config.fogRadius;
      }
      if (!visible) continue;
      const px = entity.x * tileSize;
      const py = entity.y * tileSize;
      if (entity === this.player) {
        const centerX = px + tileSize / 2;
        const centerY = py + tileSize / 2;
        const haloRadius = (tileSize * 1.3) / 2;
        const gradient = ctx.createRadialGradient(centerX, centerY, tileSize * 0.2, centerX, centerY, haloRadius);
        gradient.addColorStop(0, "#facc15aa");
        gradient.addColorStop(1, "rgba(250, 204, 21, 0)");
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, haloRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const pulse = 1 + 0.04 * Math.sin((now / 400) * Math.PI * 2);
        const size = tileSize * 0.9 * pulse;
        const half = size / 2;
        const bodyX = centerX - half;
        const bodyY = centerY - half;
        const corner = size * 0.25;
        ctx.save();
        ctx.fillStyle = "#facc15";
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 4;
        drawRoundedRect(ctx, bodyX, bodyY, size, size, corner);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#fde68a";
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        const centerX = px + tileSize / 2;
        const centerY = py + tileSize / 2;
        const enemySize = tileSize * 0.65;
        const halfEnemy = enemySize / 2;
        ctx.save();
        const bodyColor = entity.factionColor || "#ef4444";
        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, centerX - halfEnemy, centerY - halfEnemy, enemySize, enemySize, enemySize * 0.2);
        ctx.fill();
        ctx.stroke();
        if (entity.badge) {
          ctx.fillStyle = "rgba(15,23,42,0.85)";
          ctx.beginPath();
          ctx.arc(centerX, centerY - enemySize * 0.55, enemySize * 0.28, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#f9fafb";
          ctx.font = `${enemySize * 0.45}px 'Noto Sans JP', sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(entity.badge, centerX, centerY - enemySize * 0.55);
        }
        if (entity.specialFx?.ttl > 0) {
          ctx.fillStyle = entity.specialFx.color || "#facc15";
          ctx.font = `${enemySize * 0.6}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(entity.specialFx.symbol, centerX, centerY + enemySize * 0.1);
          entity.specialFx.ttl -= 1;
          if (entity.specialFx.ttl <= 0) entity.specialFx = null;
        }
        ctx.restore();
      }
    }
    ctx.restore();
    this.drawMinimap();
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
      let symbol = "?";
      let itemColor = "#e1f5fe";
      switch (tile.item.type) {
        case ItemType.WEAPON:
          symbol = tile.item.weaponLabel?.[0] || "武";
          itemColor = "#34d399";
          break;
        case ItemType.SHIELD:
          symbol = "盾";
          itemColor = "#60a5fa";
          break;
        case ItemType.HERB:
          symbol = "草";
          itemColor = "#86efac";
          break;
        case ItemType.SCROLL:
          symbol = "巻";
          itemColor = "#a855f7";
          break;
        case ItemType.BREAD:
          symbol = "食";
          itemColor = "#fb923c";
          break;
        case ItemType.STONE:
          symbol = "石";
          itemColor = "#cbd5f5";
          break;
      }
      ctx.fillStyle = itemColor;
      ctx.font = `${size - 12}px 'Noto Sans JP', sans-serif`;
      ctx.textBaseline = "top";
      ctx.fillText(symbol, px + 8, py + 8);
    }
    if (this.debugGrid) {
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.strokeRect(px, py, size, size);
    }
  }

  nextFloor() {
    this.clearAutomation();
    this.depth++;
    this.playerSlowGate = false;
    this.pushMessage(`${this.depth}Fへ降りた。敵が強くなっている…`);
    this.generateFloor();
    this.updateHUD();
    this.resizeCanvas();
  }

  gameOver(reason) {
    this.clearAutomation();
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
const mobileUI = new MobileUI(game);
game.attachUI(mobileUI);

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
