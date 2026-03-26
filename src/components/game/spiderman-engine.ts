/* eslint-disable @typescript-eslint/no-explicit-any */

const RESOURCES_FOLDER_PATH = "/spider-man/";

// Module-level RAF function; setSlowmotion swaps it out
let rafFn: (cb: FrameRequestCallback) => any =
  typeof window !== "undefined" && window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : (cb: FrameRequestCallback) => setTimeout(cb, 1000 / 60);

// Inject game CSS once per document
if (typeof document !== "undefined") {
  const cssHref = `${RESOURCES_FOLDER_PATH}css/spiderman-game.css`;
  if (!document.querySelector(`link[href="${cssHref}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssHref;
    document.head.appendChild(link);
  }
}

const IMAGE_RESOURCES: Record<string, string> = {
  JUMP: "images/jump.png",
  RUNNING_CHANGE_STEP: "images/running-change-step.png",
  RUNNING_LEFT_STEP: "images/running-left-step.png",
  RUNNING_RIGHT_STEP: "images/running-right-step.png",
  SHOOT_CHANGE_STEP: "images/shoot-change-step.png",
  SHOOT_JUMP: "images/shoot-jump.png",
  "SHOOT_LEFT-STEP": "images/shoot-left-step.png",
  "SHOOT_RIGHT-STEP": "images/shoot-right-step.png",
  SHOOT: "images/shoot.png",
  SLIDE: "images/slide.png",
  STANDING: "images/standing.png",
  WEB_PROJECTILE: "images/web.png",
  BACKGROUND: "images/background.jpg",
  ROOF: "images/wall.jpg",
  BUILDING: "images/building.png",
  SPIDER_HEAD: "images/spider-head.png",
  HEART: "images/heart.png",
  VENOM: "images/venom.png",
  THUG: "images/thug.png",
  KNIFE: "images/knife.png",
};

const AUDIO_LOOP = [
  "AMAZING_SPIDER_MAN_2",
  "FRIENDLY_SPIDERMAN",
  "MOVIE_THEME",
  "ANIMATED_SERIES",
];

function createAudioResources(): Record<string, HTMLAudioElement> {
  if (typeof Audio === "undefined") return {};
  return {
    AMAZING_SPIDER_MAN_2: new Audio(`${RESOURCES_FOLDER_PATH}audio/amazing-spider-man-2.mp3`),
    FRIENDLY_SPIDERMAN: new Audio(`${RESOURCES_FOLDER_PATH}audio/60-theme-song.mp3`),
    MOVIE_THEME: new Audio(`${RESOURCES_FOLDER_PATH}audio/old-theme.mp3`),
    ANIMATED_SERIES: new Audio(`${RESOURCES_FOLDER_PATH}audio/animated-series-theme.mp3`),
    SHOOT: new Audio(`${RESOURCES_FOLDER_PATH}audio/shooting-web.mp3`),
  };
}

const KEY = {
  ARROW_LEFT: 37, ARROW_UP: 38, ARROW_RIGHT: 39,
  SPACEBAR: 32, ESC: 27,
};

const DIRECTION = { RIGHT: 1, LEFT: -1 };

// ---------------------------------------------------------------------------
// Projectile
// ---------------------------------------------------------------------------

export class Projectile {
  x = 0;
  y = 0;
  damage = 0;
  name = "UNKNOWN";
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  game: SpidermanGame;

  constructor(game: SpidermanGame) {
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    this.game = game;
  }

  update() {}

  remove() {
    this.game.removeProjectile(this);
  }

  handleHitWithCharacter(_character: any) {
    this.remove();
  }
}

// ---------------------------------------------------------------------------
// Enemy
// ---------------------------------------------------------------------------

export class Enemy {
  game: SpidermanGame;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  health: number;
  maxHealth: number;
  name: string;
  x: number;
  y: number;
  scale = 0.5;
  stateImg: HTMLImageElement;
  wasDamagedOnPreviousFrame = false;
  frame = 0;

  constructor(
    game: SpidermanGame,
    opts: Partial<{ health: number; maxHealth: number; name: string; x: number; y: number }> = {}
  ) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    this.health = opts.health ?? 4;
    this.maxHealth = opts.maxHealth ?? this.health;
    this.name = opts.name ?? "THUG";
    this.x = opts.x ?? this.canvas.width - 50;
    this.y = opts.y ?? 0;
    this.stateImg = game.resources[this.name];
  }

  shoot() {
    const self = this;
    const knife = this.game.resources.KNIFE;
    const projectile = new Projectile(this.game);
    projectile.name = "KNIFE";
    projectile.damage = 1;
    projectile.x = this.x - knife.width * this.scale / 2;
    projectile.y = this.y + (this.stateImg.height * this.scale / 2) - (knife.height * this.scale / 4);
    projectile.update = function () {
      this.ctx.drawImage(
        knife,
        this.x - this.game.cameraX, this.y,
        knife.width * self.scale / 2, knife.height * self.scale / 2
      );
      this.x -= 10;
    };
    this.game.addProjectile(projectile);
  }

  drawHealthbar() {
    const hb = { height: 5, width: 100, borderWidth: 2 };
    let x = this.x - this.game.cameraX - hb.width / 2 + this.stateImg.width * this.scale / 2;
    const y = this.y - (hb.height + hb.borderWidth * 2) - 5;

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(x - hb.borderWidth, y - hb.borderWidth, hb.width + hb.borderWidth * 2, hb.height + hb.borderWidth * 2);
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(x, y, hb.width * this.health / this.maxHealth, hb.height);
  }

  update() {
    const img = this.game.resources[this.name];
    this.stateImg = img;

    if (this.health <= 0) { this.remove(); return; }

    this.drawHealthbar();

    const x = this.x - this.game.cameraX;
    const y = this.y;
    const w = img.width * this.scale;
    const h = img.height * this.scale;

    this.ctx.save();
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(img, (x + w) * -1, y, w, h);
    this.ctx.restore();

    if (this.wasDamagedOnPreviousFrame) {
      this.wasDamagedOnPreviousFrame = false;
      this.ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
      this.ctx.fillRect(x, y, w, h);
    }

    const isInScreen = this.x - this.game.cameraX <= this.canvas.width;
    if (this.frame % 100 === 0 && isInScreen) this.shoot();
    this.frame++;
  }

  remove() {
    this.game.score++;
    this.game.spiderman.web += this.maxHealth;
    this.game.removeEnemy(this);
  }

  handleHitWithProjectile(projectile: Projectile) {
    if (projectile.name === "WEB") {
      this.health -= projectile.damage;
      this.wasDamagedOnPreviousFrame = true;
    }
  }
}

// ---------------------------------------------------------------------------
// Roof
// ---------------------------------------------------------------------------

export class Roof {
  game: SpidermanGame;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  fullWidth: number;
  x: number;
  y: number;
  enemy?: Enemy;

  constructor(game: SpidermanGame, x = 0) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;

    this.width = Math.round(Math.random() * (game.resources.BUILDING.width - 200)) + 200;
    this.height = Math.round(Math.random() * 50) + 100;
    this.fullWidth = this.width + 15;
    this.x = x;
    this.y = this.canvas.height - this.height;

    if (Math.round(Math.random() * 100) >= 30) {
      const enemy = new Enemy(game, { x: this.x + this.width / 2 });
      enemy.y = this.y - 1 - enemy.stateImg.height * enemy.scale;
      game.addEnemy(enemy);
      this.enemy = enemy;
    }
  }

  update() {
    const renderX = this.x - this.game.cameraX;
    const building = this.game.resources.BUILDING;
    this.ctx.drawImage(building, 0, 0, this.width, this.height, renderX, this.y, this.width, this.height);
    this.ctx.drawImage(building, this.width, 0, 15, 26, renderX + this.width, this.y, 15, 26);

    if (renderX + this.width <= 0) {
      this.game.removeRoof(this);
      if (this.enemy) this.game.removeEnemy(this.enemy);
    }
  }
}

// ---------------------------------------------------------------------------
// SpiderMan (player)
// ---------------------------------------------------------------------------

export class SpiderMan {
  game: SpidermanGame;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  name = "SPIDER_MAN";
  x = 0;
  y = 0;
  states: string[] = ["STANDING"];
  scale = 0.5;
  keydowns: number[] = [];
  health = 5;
  maxHealth = 5;
  web = 50;
  velocityX = 0;
  velocityY = 0;
  regenerationSpeed = 1200;
  frame = 0;
  runningFrames = ["RUNNING_RIGHT_STEP", "RUNNING_CHANGE_STEP", "RUNNING_LEFT_STEP", "RUNNING_CHANGE_STEP"];
  runningShootingFrames = ["SHOOT_RIGHT-STEP", "SHOOT_CHANGE_STEP", "SHOOT_LEFT-STEP", "SHOOT_CHANGE_STEP"];
  runningFrame = 0;
  gravityForce = 0.7;
  runningDirection = 0;
  runningSpeed = 5;
  shootingFrame = 0;
  wasDamagedOnPreviousFrame = false;
  stateImg!: HTMLImageElement;

  constructor(game: SpidermanGame) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
  }

  keyIsDown(k: number) { return this.keydowns.includes(k); }
  hasState(s: string) { return this.states.includes(s); }

  addState(s: string) {
    if (!this.hasState(s)) this.states.push(s);
  }

  removeState(s: string | string[]) {
    if (Array.isArray(s)) { s.forEach(x => this.removeState(x)); return; }
    const i = this.states.indexOf(s);
    if (i > -1) this.states.splice(i, 1);
  }

  handleHitWithProjectile(p: Projectile) {
    if (p.name !== "WEB") {
      this.health -= p.damage;
      this.wasDamagedOnPreviousFrame = true;
    }
  }

  stateImage(): HTMLImageElement {
    let state = "STANDING";

    if (this.hasState("JUMP")) {
      state = "JUMP";
      if (this.velocityY === 0) this.velocityY = -15;
    }
    if (this.velocityY >= 0) this.removeState("JUMP");

    if (this.hasState("RUNNING")) {
      state = this.runningFrames[this.runningFrame];
      if (this.hasState("SHOOT")) state = this.runningShootingFrames[this.runningFrame];
      if (this.frame % 10 === 0) {
        this.runningFrame = (this.runningFrame + 1) % (this.runningFrames.length - 1);
      }
      this.velocityX = this.runningDirection * this.runningSpeed;
    } else {
      this.velocityX = 0;
    }

    if (this.hasState("SHOOT")) {
      if (!this.hasState("RUNNING")) state = "SHOOT";
      if (this.shootingFrame % 20 === 0) this.shoot(this.game.resources.SHOOT);
      this.shootingFrame++;
    }

    const image = this.game.resources[state] || this.game.resources["STANDING"];
    this.stateImg = image;
    return image;
  }

  keydown(k: number) { this.keydowns.push(k); }

  keyup(k: number) {
    this.runningFrame = 0;
    if (k === KEY.ARROW_RIGHT || k === KEY.ARROW_LEFT) this.removeState("RUNNING");
    if (k === KEY.SPACEBAR) { this.removeState("SHOOT"); this.shootingFrame = 0; }
    while (this.keydowns.includes(k)) this.keydowns.splice(this.keydowns.indexOf(k), 1);
  }

  regenerate() {
    if (this.frame % this.regenerationSpeed === 0 && this.health < this.maxHealth) {
      this.health = Math.round(this.health + 1);
    }
  }

  shoot(img: HTMLImageElement) {
    if (this.web <= 0) return;
    const direction = this.runningDirection || 1;
    const web = new Projectile(this.game);
    web.name = "WEB";
    web.damage = 2;
    web.x = this.runningDirection === DIRECTION.LEFT ? this.x - 1 : this.x + img.width * this.scale + 1;
    web.y = this.y + img.height * this.scale / 2;

    web.update = function () {
      let x = this.x - this.game.cameraX;
      if (direction === DIRECTION.LEFT) x -= 20;
      this.ctx.drawImage(this.game.resources["WEB_PROJECTILE"], x, this.y - 10, 20, 20);
      this.x += direction * 10;
      if (this.x - this.game.cameraX >= this.canvas.width || this.x <= 0) this.remove();
    };

    web.handleHitWithCharacter = function (character: any) {
      if (character.name !== "SPIDER_MAN") this.remove();
    };

    this.game.addProjectile(web);
    if (this.game.soundEffects) this.game.playSound("SHOOT", true, 0);
    this.web--;
  }

  drawHealthbar() {
    for (let i = 0; i < this.health; i++) {
      this.ctx.drawImage(this.game.resources.HEART, i * 25 + 5 * (i + 1), 5, 25, 25);
    }
  }

  drawWebbar() {
    const webImg = this.game.resources.WEB_PROJECTILE;
    const str = "X " + this.web;
    this.ctx.fillStyle = "white";
    this.ctx.font = "15px SpidermanGamePixelFont, Monospace, Arial";
    this.ctx.textAlign = "start";
    this.ctx.textBaseline = "top";
    const textW = this.ctx.measureText(str).width;
    const pad = 10;
    const x = this.canvas.width - 20 - textW - pad * 2;
    this.ctx.drawImage(webImg, x, 5, 20, 20);
    this.ctx.fillText(str, x + 20 + pad, 5);
  }

  update() {
    if (this.keyIsDown(KEY.ARROW_UP) && !this.hasState("FALL")) this.addState("JUMP");
    if (this.keyIsDown(KEY.ARROW_RIGHT)) { this.addState("RUNNING"); this.runningDirection = DIRECTION.RIGHT; }
    if (this.keyIsDown(KEY.ARROW_LEFT))  { this.addState("RUNNING"); this.runningDirection = DIRECTION.LEFT; }
    if (this.keyIsDown(KEY.SPACEBAR)) this.addState("SHOOT");

    if (this.y >= this.canvas.height || !this.health || !this.web) {
      this.game.gameover();
    }

    const img = this.stateImage();
    this.velocityY += this.gravityForce;
    this.y += this.velocityY;
    this.x += this.velocityX;

    if (this.x - this.game.cameraX < 0) this.x = this.game.cameraX;
    if (this.x - this.game.cameraX > 150) this.game.cameraX += this.velocityX;

    const roofLeft  = this.game.isRoofAtPoint(this.x - this.velocityX, this.y + img.height * this.scale + 1);
    const roofRight = this.game.isRoofAtPoint(this.x + img.width * this.scale - this.velocityX, this.y + img.height * this.scale + 1);

    if (roofLeft || roofRight) {
      const roof = (roofLeft || roofRight)!;
      if (roof.y + this.velocityY <= this.y) {
        this.x -= this.velocityX;
        this.velocityX = 0;
      } else {
        this.y = this.canvas.height - roof.height - img.height * this.scale;
        this.velocityY = 0;
        this.removeState("FALL");
      }
    }

    let x = this.x - this.game.cameraX;
    const y = this.y;
    const w = img.width * this.scale;
    const h = img.height * this.scale;

    this.ctx.save();
    if (this.runningDirection === DIRECTION.LEFT) {
      this.ctx.scale(-1, 1);
      x = x * -1 - w;
    }
    this.ctx.drawImage(img, x, y, w, h);
    this.ctx.restore();

    if (this.wasDamagedOnPreviousFrame) {
      this.wasDamagedOnPreviousFrame = false;
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      this.ctx.fillRect(x, y, w, h);
    }

    this.regenerate();
    this.drawHealthbar();
    this.drawWebbar();
    this.frame++;
  }
}

// ---------------------------------------------------------------------------
// SpidermanGame (main controller)
// ---------------------------------------------------------------------------

interface Scene {
  spiderman: SpiderMan | null;
  projectiles: Projectile[];
  roofs: Roof[];
  enemies: Enemy[];
}

export interface SpidermanGameOptions {
  canvas?: HTMLCanvasElement | string;
  score?: number;
  muted?: boolean;
  soundEffects?: boolean;
}

export class SpidermanGame {
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  score: number;
  muted: boolean;
  soundEffects: boolean;
  paused = false;
  initialized = false;
  escapeKey = false;
  slowmotion = false;
  gameIsOver = false;
  frame = 0;
  resources: Record<string, HTMLImageElement> = {};
  audioResources: Record<string, HTMLAudioElement> = {};
  cameraX = 0;
  scene: Scene = { spiderman: null, projectiles: [], roofs: [], enemies: [] };
  spiderman!: SpiderMan;
  pauseMenu!: HTMLElement;
  gameoverMenu!: HTMLElement;

  private _canvasOpts: HTMLCanvasElement | string;
  private keydownHandler?: (e: KeyboardEvent) => void;
  private keyupHandler?: (e: KeyboardEvent) => void;
  private resizeHandler?: () => void;

  constructor(opts: SpidermanGameOptions = {}) {
    this._canvasOpts = opts.canvas ?? "canvas";
    this.score = opts.score ?? 0;
    this.muted = opts.muted ?? false;
    this.soundEffects = opts.soundEffects !== false;
  }

  load(): Promise<void> {
    if (this.initialized) return Promise.resolve();
    this.initialized = true;

    // Resolve canvas element
    if (this._canvasOpts instanceof HTMLCanvasElement) {
      this.canvas = this._canvasOpts;
    } else {
      const el = document.querySelector(this._canvasOpts) as HTMLCanvasElement | null;
      this.canvas = el ?? (() => {
        const c = document.createElement("canvas");
        document.body.appendChild(c);
        return c;
      })();
    }

    this.ctx = this.canvas.getContext("2d")!;
    this.canvas.height = 400;
    this.canvas.width = 711;

    this.audioResources = createAudioResources();

    const self = this;

    // Pause menu
    const pauseWrap = document.createElement("div");
    pauseWrap.innerHTML =
      '<div class="spiderman-game-menu-container">' +
        '<div class="spiderman-game-menu-title">PAUSED</div>' +
        '<div class="spiderman-game-menu-button spiderman-game-menu-button-resume">RESUME</div>' +
        '<div class="spiderman-game-menu-button spiderman-game-menu-button-mute-sounds">MUTE SOUNDS</div>' +
        '<div class="spiderman-game-menu-button spiderman-game-menu-button-mute-music">MUTE MUSIC</div>' +
        '<div class="spiderman-game-menu-button spiderman-game-menu-button-mute-slowmotion">TOGGLE SLOWMOTION</div>' +
      "</div>";
    this.pauseMenu = pauseWrap.firstChild as HTMLElement;
    this.pauseMenu.style.display = "none";

    this.pauseMenu.querySelector(".spiderman-game-menu-button-resume")!.addEventListener("click", () => self.unpause());

    const soundsBtn = this.pauseMenu.querySelector(".spiderman-game-menu-button-mute-sounds") as HTMLElement;
    soundsBtn.addEventListener("click", () => {
      if (self.soundEffects) { self.soundEffects = false; soundsBtn.innerHTML = "UNMUTE SOUNDS"; }
      else                   { self.soundEffects = true;  soundsBtn.innerHTML = "MUTE SOUNDS"; }
    });

    const musicBtn = this.pauseMenu.querySelector(".spiderman-game-menu-button-mute-music") as HTMLElement;
    musicBtn.addEventListener("click", () => {
      if (self.muted) { self.unmute(); musicBtn.innerHTML = "MUTE MUSIC"; }
      else            { self.mute();   musicBtn.innerHTML = "UNMUTE MUSIC"; }
    });

    this.pauseMenu.querySelector(".spiderman-game-menu-button-mute-slowmotion")!
      .addEventListener("click", () => self.setSlowmotion(!self.slowmotion));

    document.body.appendChild(this.pauseMenu);

    // Game-over menu
    const gameoverWrap = document.createElement("div");
    gameoverWrap.innerHTML =
      '<div class="spiderman-game-menu-container">' +
        '<div class="spiderman-game-menu-title">GAME OVER</div>' +
        '<div class="spiderman-game-menu-title">FINAL SCORE: <span class="spiderman-game-score">0</span></div>' +
        '<div class="spiderman-game-menu-button spiderman-game-menu-button-restart">RESTART</div>' +
      "</div>";
    this.gameoverMenu = gameoverWrap.firstChild as HTMLElement;
    this.gameoverMenu.querySelector(".spiderman-game-menu-button-restart")!
      .addEventListener("click", () => self.restart());
    document.body.appendChild(this.gameoverMenu);

    // Input
    const spiderman = new SpiderMan(this);
    this.spiderman = spiderman;

    this.keydownHandler = (e: KeyboardEvent) => {
      const k = e.keyCode || e.which;
      if (k === KEY.ESC && !self.escapeKey) {
        self.escapeKey = true;
        self.paused ? self.unpause() : self.pause();
      }
      self.spiderman.keydown(k);
    };
    this.keyupHandler = (e: KeyboardEvent) => {
      const k = e.keyCode || e.which;
      if (k === KEY.ESC) self.escapeKey = false;
      self.spiderman.keyup(k);
    };
    this.resizeHandler = () => {
      if (self.paused) self.showPauseMenu();
      if (self.gameIsOver) self.showGameoverMenu();
    };

    document.addEventListener("keydown", this.keydownHandler);
    document.addEventListener("keyup", this.keyupHandler);
    window.addEventListener("resize", this.resizeHandler);

    // Audio loop chaining
    for (const soundName of AUDIO_LOOP) {
      const sound = this.audioResources[soundName];
      if (!sound) continue;
      sound.setAttribute("data-name", soundName);
      sound.ontimeupdate = function (this: HTMLAudioElement) {
        if (this.currentTime >= this.duration) {
          const current = AUDIO_LOOP.indexOf(this.getAttribute("data-name") || "");
          self.playSound(AUDIO_LOOP[(current + 1) % AUDIO_LOOP.length], false, 0);
        }
      };
    }

    // Show loading state on canvas
    this.canvas.style.backgroundColor = "black";
    this.ctx.font = "30px Helvetica";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Loading...", this.canvas.width / 2, this.canvas.height / 2);

    return new Promise<void>((resolve) => {
      const entries = Object.entries(IMAGE_RESOURCES).map(([name, src]) => ({
        name,
        source: RESOURCES_FOLDER_PATH + src,
      }));
      let index = 0;

      const loadNext = () => {
        if (index >= entries.length) {
          const roof = new Roof(self, 0);
          self.scene.spiderman = spiderman;
          self.scene.roofs = [roof];
          self.update();
          self.playSound(AUDIO_LOOP[0], false, 0);
          if (self.muted) self.mute();
          return resolve();
        }
        const { name, source } = entries[index];
        const img = new Image();
        img.onload = () => { self.resources[name] = img; index++; loadNext(); };
        img.src = source;
      };

      loadNext();
    });
  }

  /** Clean up event listeners and DOM elements created by this instance. */
  destroy() {
    if (this.keydownHandler) document.removeEventListener("keydown", this.keydownHandler);
    if (this.keyupHandler)   document.removeEventListener("keyup",   this.keyupHandler);
    if (this.resizeHandler)  window.removeEventListener("resize",    this.resizeHandler);
    this.pauseMenu?.remove();
    this.gameoverMenu?.remove();
    this.paused = true; // stop the rAF loop
    for (const audio of Object.values(this.audioResources)) audio.pause();
  }

  setSlowmotion(slowmo: boolean) {
    this.slowmotion = slowmo;
    if (slowmo) {
      rafFn = (cb: FrameRequestCallback) => setTimeout(cb, 1000 / 10) as unknown as number;
      for (const a of Object.values(this.audioResources)) a.playbackRate = 0.5;
    } else {
      rafFn = typeof window !== "undefined" && window.requestAnimationFrame
        ? window.requestAnimationFrame.bind(window)
        : (cb: FrameRequestCallback) => setTimeout(cb, 1000 / 60) as unknown as number;
      for (const a of Object.values(this.audioResources)) a.playbackRate = 1;
    }
  }

  mute()   { this.muted = true;  for (const a of Object.values(this.audioResources)) a.volume = 0; }
  unmute() { this.muted = false; for (const a of Object.values(this.audioResources)) a.volume = 1; }

  showPauseMenu() {
    if (this.gameoverMenu.style.display === "block") return;
    const r = this.canvas.getBoundingClientRect();
    this.pauseMenu.style.display = "block";
    this.pauseMenu.style.left = (r.left + r.width  / 2) + "px";
    this.pauseMenu.style.top  = (r.top  + r.height / 2) + "px";
  }

  showGameoverMenu() {
    this.gameoverMenu.querySelector(".spiderman-game-score")!.innerHTML = String(this.score);
    const r = this.canvas.getBoundingClientRect();
    this.gameoverMenu.style.display = "block";
    this.gameoverMenu.style.left = (r.left + r.width  / 2) + "px";
    this.gameoverMenu.style.top  = (r.top  + r.height / 2) + "px";
  }

  pause()   { this.paused = true; this.showPauseMenu(); }
  unpause() { this.paused = false; this.pauseMenu.style.display = "none"; this.update(); }

  playSound(audio: string | HTMLAudioElement, clone: boolean, currentTime?: number) {
    let el = typeof audio === "string" ? this.audioResources[audio] : audio;
    if (!el) return;
    if (clone) el = el.cloneNode(true) as HTMLAudioElement;
    if (currentTime !== undefined) el.currentTime = currentTime;
    return el.play().catch(() => {});
  }

  pauseSound(audio: string | HTMLAudioElement) {
    const el = typeof audio === "string" ? this.audioResources[audio] : audio;
    el?.pause();
  }

  drawBackground() {
    const bg = this.resources.BACKGROUND;
    const ratio = bg.width / bg.height;
    const tileW = this.canvas.height * ratio;
    let x = (this.cameraX / 5) * -1;
    x %= Math.min(bg.width, this.canvas.width);
    this.ctx.drawImage(bg, x,        0, tileW, this.canvas.height);
    this.ctx.drawImage(bg, x + tileW, 0, tileW, this.canvas.height);
  }

  drawRoofs() {
    for (const roof of this.scene.roofs) roof.update();
    if (this.scene.roofs.length < 3) {
      const last = this.scene.roofs[this.scene.roofs.length - 1];
      const x = last.x + last.fullWidth + Math.round(Math.random() * 50) + 100;
      this.addRoof(new Roof(this, x));
      this.scene.roofs[0].update();
    }
  }

  drawEnemies() {
    for (const enemy of this.scene.enemies) enemy.update();
  }

  update() {
    if (this.paused || this.gameIsOver) return;
    const { spiderman, projectiles } = this.scene;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackground();
    this.drawRoofs();
    this.drawEnemies();
    for (const p of projectiles) p.update();
    spiderman!.update();

    this.ctx.fillStyle = "white";
    this.ctx.font = "20px SpidermanGamePixelFont, Monospace, Helvetica";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "top";
    this.ctx.fillText(String(this.score), this.canvas.width / 2, 5);

    for (const p of [...projectiles]) {
      const ch = this.isCharacterAtPoint(p.x, p.y);
      if (ch) { p.handleHitWithCharacter(ch); ch.handleHitWithProjectile(p); }
    }

    rafFn(this.update.bind(this));
    this.frame++;
  }

  addProjectile(p: Projectile) { this.scene.projectiles.push(p); }
  removeProjectile(p: Projectile) {
    const i = this.scene.projectiles.indexOf(p);
    if (i > -1) this.scene.projectiles.splice(i, 1);
  }

  addEnemy(e: Enemy) { this.scene.enemies.push(e); }
  removeEnemy(e: Enemy) {
    const i = this.scene.enemies.indexOf(e);
    if (i > -1) this.scene.enemies.splice(i, 1);
  }

  addRoof(r: Roof) { this.scene.roofs.push(r); }
  removeRoof(r: Roof) {
    const i = this.scene.roofs.indexOf(r);
    if (i > -1) this.scene.roofs.splice(i, 1);
  }

  isRoofAtPoint(x: number, y: number): Roof | false {
    const relX = x - this.cameraX;
    for (const roof of this.scene.roofs) {
      const roofX = roof.x - this.cameraX;
      if (roofX <= relX && roofX + roof.fullWidth >= relX && y >= roof.y) return roof;
    }
    return false;
  }

  isCharacterAtPoint(x: number, y: number): (SpiderMan | Enemy) | false {
    const chars: (SpiderMan | Enemy)[] = [...this.scene.enemies, this.spiderman];
    const relX = x - this.cameraX;
    for (const ch of chars) {
      if (!ch?.stateImg) continue;
      const left   = ch.x - this.cameraX;
      const top    = ch.y;
      const right  = left + ch.stateImg.width  * ch.scale;
      const bottom = top  + ch.stateImg.height * ch.scale;
      if (left <= relX && top <= y && right >= relX && bottom >= y) return ch;
    }
    return false;
  }

  restart() {
    this.spiderman = new SpiderMan(this);
    this.scene = { spiderman: this.spiderman, projectiles: [], roofs: [new Roof(this, 0)], enemies: [] };
    this.cameraX = 0;
    this.score = 0;
    this.paused = false;
    this.gameIsOver = false;
    this.gameoverMenu.style.display = "none";
    this.pauseMenu.style.display = "none";
    this.update();
  }

  gameover() {
    this.gameIsOver = true;
    this.showGameoverMenu();
  }
}
