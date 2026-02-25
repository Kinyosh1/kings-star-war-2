import { ENEMY_CONFIGS, EnemyConfig, Point, PowerupType, POWERUP_CONFIGS } from './types';

// --- Entities ---

export class Player {
  x: number;
  y: number;
  width: number = 40;
  height: number = 40;
  speed: number = 7;
  baseSpeed: number = 7;
  lives: number = 3;
  maxLives: number = 3;
  score: number = 0;
  invincible: boolean = false;
  invincibleTimer: number = 0;
  shield: boolean = false;
  tripleShot: boolean = false;
  tripleShotTimer: number = 0;
  damageBoost: boolean = false;
  damageBoostTimer: number = 0;
  image: HTMLImageElement | null = null;
  
  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 100;
    
    // Attempt to load local image
    const img = new Image();
    img.src = '/player.png';
    img.onload = () => { this.image = img; };
  }

  update(keys: Set<string>, canvasWidth: number, canvasWidth_ignored: number, deltaTime: number) {
    const currentSpeed = this.baseSpeed;
    
    if (keys.has('arrowleft') || keys.has('a')) this.x -= currentSpeed;
    if (keys.has('arrowright') || keys.has('d')) this.x += currentSpeed;
    if (keys.has('arrowup') || keys.has('w')) this.y -= currentSpeed;
    if (keys.has('arrowdown') || keys.has('s')) this.y += currentSpeed;

    // Boundaries
    this.x = Math.max(this.width / 2, Math.min(canvasWidth - this.width / 2, this.x));
    this.y = Math.max(this.height / 2, Math.min(window.innerHeight - this.height / 2, this.y));

    // Timers
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= deltaTime;
      if (this.invincibleTimer <= 0) this.invincible = false;
    }

    if (this.tripleShotTimer > 0) {
      this.tripleShotTimer -= deltaTime;
      if (this.tripleShotTimer <= 0) this.tripleShot = false;
    }

    if (this.damageBoostTimer > 0) {
      this.damageBoostTimer -= deltaTime;
      if (this.damageBoostTimer <= 0) this.damageBoost = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    // Flashing effect for invincibility
    if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Shield effect
    if (this.shield) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.fill();
    }

    // Damage boost glow
    if (this.damageBoost) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.translate(this.x, this.y);

    if (this.image) {
      // Draw PNG Image
      ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      // Fallback to Vector drawing
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#3b82f6';

      ctx.beginPath();
      ctx.moveTo(0, -this.height / 2); // Tip
      ctx.lineTo(this.width / 2, this.height / 2); // Bottom right
      ctx.lineTo(0, this.height / 4); // Bottom middle notch
      ctx.lineTo(-this.width / 2, this.height / 2); // Bottom left
      ctx.closePath();

      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Engine flame
      ctx.beginPath();
      ctx.moveTo(-5, this.height / 2);
      ctx.lineTo(0, this.height / 2 + 10 + Math.random() * 10);
      ctx.lineTo(5, this.height / 2);
      ctx.fillStyle = '#f97316'; // orange-500
      ctx.fill();
    }

    ctx.restore();
  }
}

export class Bullet {
  x: number;
  y: number;
  speed: number = 10;
  radius: number = 4;
  color: string = '#fff';

  constructor(x: number, y: number, angle: number = 0) {
    this.x = x;
    this.y = y;
    // Angle support for triple shot
    this.speed = 10;
    this.vx = Math.sin(angle) * this.speed;
    this.vy = -Math.cos(angle) * this.speed;
  }
  vx: number;
  vy: number;

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#3b82f6';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

export class EnemyBullet {
  x: number;
  y: number;
  speed: number = 5;
  radius: number = 4;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ef4444';
    ctx.fill();
    ctx.restore();
  }
}

export class Enemy {
  x: number;
  y: number;
  config: EnemyConfig;
  hp: number;
  maxHp: number;
  image: HTMLImageElement | null = null;
  fireTimer: number = 0;
  
  constructor(canvasWidth: number, config: EnemyConfig, hpMultiplier: number = 1) {
    this.config = config;
    this.maxHp = Math.ceil(config.hp * hpMultiplier);
    this.hp = this.maxHp;
    this.x = Math.random() * (canvasWidth - config.size * 2) + config.size;
    this.y = -config.size;

    // Attempt to load local image based on type
    const img = new Image();
    img.src = `/enemy_${config.type.toLowerCase()}.png`;
    img.onload = () => { this.image = img; };
  }

  update(playerX: number, playerY: number, deltaTime: number) {
    if (this.config.type === 'KAMIKAZE') {
      // Track player
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      const angle = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * this.config.speed;
      this.y += Math.sin(angle) * this.config.speed;
    } else {
      this.y += this.config.speed;
    }

    if (this.config.type === 'SHOOTER') {
      this.fireTimer += deltaTime;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    if (this.image) {
      // Draw PNG Image
      ctx.drawImage(this.image, -this.config.size, -this.config.size, this.config.size * 2, this.config.size * 2);
    } else {
      // Fallback to Vector drawing
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.config.glowColor;

      // Draw Enemy Ship
      ctx.beginPath();
      if (this.config.type === 'KAMIKAZE') {
        // Pointy triangle for kamikaze
        ctx.moveTo(0, this.config.size);
        ctx.lineTo(this.config.size / 2, -this.config.size);
        ctx.lineTo(-this.config.size / 2, -this.config.size);
      } else if (this.config.type === 'SHOOTER') {
        // Hexagon for shooter
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          ctx.lineTo(Math.cos(angle) * this.config.size, Math.sin(angle) * this.config.size);
        }
      } else {
        // Diamond for others
        ctx.moveTo(0, this.config.size);
        ctx.lineTo(this.config.size, 0);
        ctx.lineTo(0, -this.config.size);
        ctx.lineTo(-this.config.size, 0);
      }
      ctx.closePath();

      ctx.fillStyle = this.config.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Eye/Core
      ctx.beginPath();
      ctx.arc(0, 0, this.config.size / 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    // Health Bar
    if (this.hp < this.maxHp) {
      const barWidth = this.config.size * 1.5;
      const barHeight = 4;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(-barWidth / 2, -this.config.size - 10, barWidth, barHeight);
      ctx.fillStyle = this.hp / this.maxHp > 0.5 ? '#10b981' : this.hp / this.maxHp > 0.2 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(-barWidth / 2, -this.config.size - 10, barWidth * (this.hp / this.maxHp), barHeight);
    }

    ctx.restore();
  }
}

export class Powerup {
  x: number;
  y: number;
  type: PowerupType;
  size: number = 15;
  speed: number = 2;

  constructor(canvasWidth: number, type: PowerupType) {
    this.type = type;
    this.x = Math.random() * (canvasWidth - this.size * 2) + this.size;
    this.y = -this.size;
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const config = POWERUP_CONFIGS[this.type];
    ctx.save();
    ctx.translate(this.x, this.y);
    
    ctx.shadowBlur = 20;
    ctx.shadowColor = config.color;

    // Background circle
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fill();
    ctx.strokeStyle = config.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Icon
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (this.type === 'TRIPLE_SHOT') {
      // Zap icon
      ctx.beginPath();
      ctx.moveTo(2, -8);
      ctx.lineTo(-4, 0);
      ctx.lineTo(0, 0);
      ctx.lineTo(-2, 8);
      ctx.lineTo(4, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fill();
    } else if (this.type === 'SHIELD') {
      // Shield icon
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.bezierCurveTo(5, -8, 7, -4, 7, 0);
      ctx.bezierCurveTo(7, 5, 4, 8, 0, 10);
      ctx.bezierCurveTo(-4, 8, -7, 5, -7, 0);
      ctx.bezierCurveTo(-7, -4, -5, -8, 0, -8);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fill();
    } else if (this.type === 'REPAIR') {
      // Heart icon
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.bezierCurveTo(-5, 4, -8, 0, -8, -3);
      ctx.bezierCurveTo(-8, -7, -4, -8, 0, -4);
      ctx.bezierCurveTo(4, -8, 8, -7, 8, -3);
      ctx.bezierCurveTo(8, 0, 5, 4, 0, 8);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fill();
    } else if (this.type === 'DAMAGE_BOOST') {
      // Swords icon
      ctx.beginPath();
      ctx.moveTo(-6, 6);
      ctx.lineTo(6, -6);
      ctx.moveTo(6, 6);
      ctx.lineTo(-6, -6);
      ctx.stroke();
    } else if (this.type === 'GOLDEN_STAR') {
      // Star icon
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        ctx.lineTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    ctx.restore();
  }
}

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number = 1.0;
  decay: number;
  color: string;
  size: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.decay = Math.random() * 0.02 + 0.01;
    this.color = color;
    this.size = Math.random() * 3 + 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class Star {
  x: number;
  y: number;
  size: number;
  speed: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.size = Math.random() * 2;
    this.speed = Math.random() * 3 + 1;
  }

  update(canvasHeight: number) {
    this.y += this.speed;
    if (this.y > canvasHeight) {
      this.y = 0;
      this.x = Math.random() * window.innerWidth;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = this.speed / 4;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}
