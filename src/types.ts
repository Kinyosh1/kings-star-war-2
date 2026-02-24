/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface GameStats {
  score: number;
  level: number;
  lives: number;
  enemiesDestroyed: number;
  powerupsCollected: number;
  distanceTraveled: number;
  highScore: number;
}

export interface Point {
  x: number;
  y: number;
}

export type EnemyType = 'BASIC' | 'FAST' | 'HEAVY';

export interface EnemyConfig {
  type: EnemyType;
  hp: number;
  speed: number;
  score: number;
  color: string;
  size: number;
  glowColor: string;
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  BASIC: {
    type: 'BASIC',
    hp: 1,
    speed: 2,
    score: 100,
    color: '#3b82f6', // blue-500
    size: 20,
    glowColor: 'rgba(59, 130, 246, 0.5)'
  },
  FAST: {
    type: 'FAST',
    hp: 1,
    speed: 4,
    score: 200,
    color: '#facc15', // yellow-400
    size: 15,
    glowColor: 'rgba(250, 204, 21, 0.5)'
  },
  HEAVY: {
    type: 'HEAVY',
    hp: 3,
    speed: 1,
    score: 500,
    color: '#ef4444', // red-500
    size: 30,
    glowColor: 'rgba(239, 68, 68, 0.5)'
  }
};

export type PowerupType = 'TRIPLE_SHOT' | 'SHIELD' | 'REPAIR';

export interface PowerupConfig {
  type: PowerupType;
  color: string;
  duration: number;
  icon: string;
}

export const POWERUP_CONFIGS: Record<PowerupType, PowerupConfig> = {
  TRIPLE_SHOT: {
    type: 'TRIPLE_SHOT',
    color: '#10b981', // emerald-500
    duration: 10000,
    icon: 'Zap'
  },
  SHIELD: {
    type: 'SHIELD',
    color: '#8b5cf6', // violet-500
    duration: 0, // Instant/One-time
    icon: 'Shield'
  },
  REPAIR: {
    type: 'REPAIR',
    color: '#ef4444', // red-500
    duration: 0,
    icon: 'Heart'
  }
};
