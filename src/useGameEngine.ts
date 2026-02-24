import { useEffect, useRef, useState } from 'react';
import { 
  Player, 
  Bullet, 
  Enemy, 
  Powerup, 
  Particle, 
  Star,
  EnemyBullet
} from './entities';
import { 
  GameState, 
  GameStats, 
  ENEMY_CONFIGS, 
  POWERUP_CONFIGS, 
  Achievement,
  PowerupType
} from './types';
import { INITIAL_ACHIEVEMENTS } from './constants';

export function useGameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('START');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    level: 1,
    lives: 3,
    maxLives: 3,
    enemiesDestroyed: 0,
    powerupsCollected: 0,
    distanceTraveled: 0,
    highScore: parseInt(localStorage.getItem('kings_star_war_highscore') || '0')
  });
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);

  // Game Objects
  const playerRef = useRef<Player | null>(null);
  const bulletsRef = useRef<Bullet[]>([]);
  const enemyBulletsRef = useRef<EnemyBullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const powerupsRef = useRef<Powerup[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  
  // Progress tracking for new enemies
  const fastDestroyedCount = useRef<number>(0);
  const heavyDestroyedCount = useRef<number>(0);
  const enemiesSinceLastStar = useRef<number>(0);
  
  // Timing
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const powerupTimerRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      const achievement = prev.find(a => a.id === id);
      if (achievement && !achievement.unlocked) {
        setActiveAchievement(achievement);
        setTimeout(() => setActiveAchievement(null), 3000);
        return prev.map(a => a.id === id ? { ...a, unlocked: true } : a);
      }
      return prev;
    });
  };

  const initGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    playerRef.current = new Player(canvas.width, canvas.height);
    bulletsRef.current = [];
    enemyBulletsRef.current = [];
    enemiesRef.current = [];
    powerupsRef.current = [];
    particlesRef.current = [];
    fastDestroyedCount.current = 0;
    heavyDestroyedCount.current = 0;
    enemiesSinceLastStar.current = 0;
    
    // Init stars if empty
    if (starsRef.current.length === 0) {
      for (let i = 0; i < 100; i++) {
        starsRef.current.push(new Star(canvas.width, canvas.height));
      }
    }

    setStats({
      score: 0,
      level: 1,
      lives: 3,
      maxLives: 3,
      enemiesDestroyed: 0,
      powerupsCollected: 0,
      distanceTraveled: 0,
      highScore: parseInt(localStorage.getItem('kings_star_war_highscore') || '0')
    });
  };

  const spawnEnemy = (canvasWidth: number) => {
    const level = Math.floor(stats.score / 2000) + 1;
    const rand = Math.random();
    let type: keyof typeof ENEMY_CONFIGS = 'BASIC';
    
    const canSpawnKamikaze = fastDestroyedCount.current >= 3;
    const canSpawnShooter = heavyDestroyedCount.current >= 1;

    if (canSpawnShooter && rand > 0.9) type = 'SHOOTER';
    else if (canSpawnKamikaze && rand > 0.8) type = 'KAMIKAZE';
    else if (level >= 3 && rand > 0.6) type = 'HEAVY';
    else if (level >= 2 && rand > 0.4) type = 'FAST';

    // HP Scaling: Increase every 4 levels, up to level 20
    // level 1-4: 1x, level 5-8: 1.5x, level 9-12: 2x, level 13-16: 2.5x, level 17-20: 3x
    const hpMultiplier = 1 + Math.min(4, Math.floor((level - 1) / 4)) * 0.5;

    enemiesRef.current.push(new Enemy(canvasWidth, ENEMY_CONFIGS[type], hpMultiplier));
  };

  const spawnPowerup = (canvasWidth: number, forceType?: PowerupType) => {
    const types: (keyof typeof POWERUP_CONFIGS)[] = ['TRIPLE_SHOT', 'SHIELD', 'REPAIR', 'DAMAGE_BOOST'];
    let type = forceType || types[Math.floor(Math.random() * types.length)];
    
    // Low random chance for golden star if not forced
    if (!forceType && Math.random() < 0.05) {
      type = 'GOLDEN_STAR';
    }
    
    powerupsRef.current.push(new Powerup(canvasWidth, type as PowerupType));
  };

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push(new Particle(x, y, color));
    }
  };

  const update = (time: number) => {
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'PLAYING') {
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    starsRef.current.forEach(star => {
      star.update(canvas.height);
      star.draw(ctx);
    });

    // Player
    const player = playerRef.current;
    if (player) {
      player.update(keysRef.current, canvas.width, canvas.height, deltaTime);
      player.draw(ctx);

      // Shooting - Auto-fire in PLAYING state for mobile support
      if (time % 150 < 20) {
        if (player.tripleShot) {
          bulletsRef.current.push(new Bullet(player.x, player.y - 20, -0.2));
          bulletsRef.current.push(new Bullet(player.x, player.y - 20, 0));
          bulletsRef.current.push(new Bullet(player.x, player.y - 20, 0.2));
        } else {
          bulletsRef.current.push(new Bullet(player.x, player.y - 20, 0));
        }
      }
    }

    // Bullets
    bulletsRef.current = bulletsRef.current.filter(bullet => {
      bullet.update();
      bullet.draw(ctx);
      return bullet.y > 0 && bullet.x > 0 && bullet.x < canvas.width;
    });

    // Enemy Bullets
    enemyBulletsRef.current = enemyBulletsRef.current.filter(bullet => {
      bullet.update();
      bullet.draw(ctx);

      if (player && !player.invincible) {
        const dx = player.x - bullet.x;
        const dy = player.y - bullet.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bullet.radius + player.width / 2) {
          if (player.shield) {
            player.shield = false;
          } else {
            player.lives--;
            player.invincible = true;
            player.invincibleTimer = 2000;
            setStats(prev => ({ ...prev, lives: player.lives }));
            if (player.lives <= 0) setGameState('GAMEOVER');
          }
          return false;
        }
      }
      return bullet.y < canvas.height;
    });

    // Enemies
    spawnTimerRef.current += deltaTime;
    const spawnRate = Math.max(300, 1500 - (stats.level * 150));
    if (spawnTimerRef.current > spawnRate) {
      spawnEnemy(canvas.width);
      spawnTimerRef.current = 0;
    }

    enemiesRef.current = enemiesRef.current.filter(enemy => {
      enemy.update(player?.x || 0, player?.y || 0, deltaTime);
      enemy.draw(ctx);

      if (enemy.config.type === 'SHOOTER' && enemy.fireTimer > 1200) {
        enemyBulletsRef.current.push(new EnemyBullet(enemy.x, enemy.y + enemy.config.size));
        enemy.fireTimer = 0;
      }

      // Collision with bullets
      let destroyed = false;
      bulletsRef.current = bulletsRef.current.filter(bullet => {
        const dx = bullet.x - enemy.x;
        const dy = bullet.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < enemy.config.size + bullet.radius) {
          const damage = player?.damageBoost ? 2 : 1;
          enemy.hp -= damage;
          if (enemy.hp <= 0) {
            destroyed = true;
            createExplosion(enemy.x, enemy.y, enemy.config.color);
            
            if (enemy.config.type === 'FAST') fastDestroyedCount.current++;
            if (enemy.config.type === 'HEAVY') heavyDestroyedCount.current++;
            
            enemiesSinceLastStar.current++;
            if (enemiesSinceLastStar.current >= 40) {
              spawnPowerup(canvas.width, 'GOLDEN_STAR');
              enemiesSinceLastStar.current = 0;
            }

            setStats(prev => {
              const newScore = prev.score + enemy.config.score;
              const newEnemies = prev.enemiesDestroyed + 1;
              const newLevel = Math.floor(newScore / 2000) + 1;
              
              if (newLevel > prev.level) {
                if (newLevel === 5) unlockAchievement('survivor');
              }
              
              if (newEnemies === 1) unlockAchievement('first_blood');
              if (newScore >= 10000) unlockAchievement('ace_pilot');

              return { 
                ...prev, 
                score: newScore, 
                enemiesDestroyed: newEnemies,
                level: newLevel
              };
            });
          }
          return false;
        }
        return true;
      });

      if (destroyed) return false;

      // Collision with player
      if (player && !player.invincible) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < enemy.config.size + player.width / 2) {
          if (enemy.config.type === 'KAMIKAZE') {
            // Kamikaze deals 1.5 damage, shield only blocks 1.0
            if (player.shield) {
              player.shield = false;
              player.lives -= 0.5;
            } else {
              player.lives -= 1.5;
            }
            createExplosion(enemy.x, enemy.y, enemy.config.color);
            player.invincible = true;
            player.invincibleTimer = 2000;
            setStats(prev => ({ ...prev, lives: Math.max(0, player.lives) }));
            if (player.lives <= 0) setGameState('GAMEOVER');
            return false;
          } else {
            if (player.shield) {
              player.shield = false;
              createExplosion(enemy.x, enemy.y, '#8b5cf6');
            } else {
              player.lives--;
              player.invincible = true;
              player.invincibleTimer = 2000;
              createExplosion(player.x, player.y, '#3b82f6');
              setStats(prev => ({ ...prev, lives: player.lives }));
              if (player.lives <= 0) setGameState('GAMEOVER');
            }
            return false;
          }
        }
      }

      // Escape penalty
      if (enemy.y > canvas.height + enemy.config.size) {
        setStats(prev => ({ ...prev, score: Math.max(0, prev.score - 50) }));
        return false;
      }

      return true;
    });

    // Powerups
    powerupTimerRef.current += deltaTime;
    if (powerupTimerRef.current > 15000) {
      spawnPowerup(canvas.width);
      powerupTimerRef.current = 0;
    }

    powerupsRef.current = powerupsRef.current.filter(powerup => {
      powerup.update();
      powerup.draw(ctx);

      if (player) {
        const dx = player.x - powerup.x;
        const dy = player.y - powerup.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < powerup.size + player.width / 2) {
          if (powerup.type === 'TRIPLE_SHOT') {
            player.tripleShot = true;
            player.tripleShotTimer = 10000;
          } else if (powerup.type === 'SHIELD') {
            player.shield = true;
          } else if (powerup.type === 'REPAIR') {
            player.lives = Math.min(3, player.lives + 1);
            setStats(prev => ({ ...prev, lives: player.lives }));
          } else if (powerup.type === 'DAMAGE_BOOST') {
            player.damageBoost = true;
            player.damageBoostTimer = 8000;
          } else if (powerup.type === 'GOLDEN_STAR') {
            player.maxLives++;
            player.lives = player.maxLives;
            enemiesSinceLastStar.current = 0;
            setStats(prev => ({ ...prev, lives: player.lives, maxLives: player.maxLives }));
          }
          
          setStats(prev => {
            const newCount = prev.powerupsCollected + 1;
            if (newCount === 5) unlockAchievement('power_hungry');
            return { ...prev, powerupsCollected: newCount };
          });
          
          return false;
        }
      }

      return powerup.y < canvas.height + powerup.size;
    });

    // Particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.update();
      particle.draw(ctx);
      return particle.life > 0;
    });

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-init stars on resize to fill screen
      starsRef.current = [];
      for (let i = 0; i < 100; i++) {
        starsRef.current.push(new Star(canvas.width, canvas.height));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (e.key.toLowerCase() === 'p' && gameState === 'PLAYING') setGameState('PAUSED');
      else if (e.key.toLowerCase() === 'p' && gameState === 'PAUSED') setGameState('PLAYING');
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, stats.score]);

  useEffect(() => {
    if (gameState === 'GAMEOVER') {
      if (stats.score > stats.highScore) {
        localStorage.setItem('kings_star_war_highscore', stats.score.toString());
        setStats(prev => ({ ...prev, highScore: stats.score }));
      }
    }
  }, [gameState]);

  return {
    canvasRef,
    gameState,
    setGameState,
    stats,
    initGame,
    achievements,
    activeAchievement,
    playerRef
  };
}
