/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Heart, 
  Zap, 
  Shield, 
  Target, 
  Gamepad2, 
  Info,
  ChevronRight,
  X,
  Languages,
  Swords,
  Star
} from 'lucide-react';
import { useGameEngine } from './useGameEngine';
import { Achievement } from './types';
import { TRANSLATIONS } from './constants';

export default function App() {
  const { 
    canvasRef, 
    gameState, 
    setGameState, 
    stats, 
    initGame, 
    achievements, 
    activeAchievement,
    playerRef
  } = useGameEngine();

  const [showSidebar, setShowSidebar] = useState(false);
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startGame = () => {
    initGame();
    setGameState('PLAYING');
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameState !== 'PLAYING' || !playerRef.current) return;
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    playerRef.current.x = touch.clientX;
    playerRef.current.y = touch.clientY - 50; // Offset for finger visibility
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans">
      {/* Language Switcher - Always on top */}
      <div className="fixed top-6 right-6 z-[100]">
        <button 
          onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          className="glass px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/20 transition-all active:scale-95"
        >
          <Languages className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">{lang === 'en' ? '中文' : 'EN'}</span>
        </button>
      </div>

      {/* Game Canvas */}
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full cursor-none touch-none"
        onTouchMove={handleTouchMove}
        onTouchStart={(e) => e.cancelable && e.preventDefault()}
      />

      {/* Achievement Popup */}
      <AnimatePresence>
        {activeAchievement && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-50 glass px-6 py-3 rounded-2xl flex items-center gap-4 border-yellow-500/50"
          >
            <div className="p-2 bg-yellow-500 rounded-full">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest">{t.achievementUnlocked}</p>
              <p className="text-lg font-display font-bold">
                {(t.achievements_data as any)[activeAchievement.id]?.title || activeAchievement.title}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD */}
      {gameState === 'PLAYING' && (
        <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
          <div className="flex flex-col gap-2">
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-3">
              <Target className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-display font-bold text-glow">{stats.score.toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: stats.maxLives }).map((_, i) => {
                const fillAmount = Math.max(0, Math.min(1, stats.lives - i));
                return (
                  <div key={i} className="relative w-6 h-6">
                    <Heart className="absolute inset-0 w-6 h-6 text-white/20" />
                    <div 
                      className="absolute inset-0 overflow-hidden transition-all duration-300" 
                      style={{ width: `${fillAmount * 100}%` }}
                    >
                      <Heart className="w-6 h-6 text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 pr-24 md:pr-0">
            <div className="glass px-4 py-2 rounded-xl">
              <span className="text-sm font-bold text-white/50 uppercase tracking-widest">{t.level}</span>
              <p className="text-2xl font-display font-bold text-blue-400 text-center">{stats.level}</p>
            </div>
            <button 
              onClick={() => setGameState('PAUSED')}
              className="pointer-events-auto p-3 glass rounded-full hover:bg-white/20 transition-colors"
            >
              <Pause className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Overlays */}
      <AnimatePresence>
        {gameState === 'START' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-black/80 backdrop-blur-sm"
          >
            <div className="min-h-full w-full p-8 flex flex-col items-center justify-center">
              <div className="max-w-4xl w-full text-center flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="mb-8"
              >
                <h1 className="text-5xl md:text-8xl font-display font-black mb-2 tracking-tighter text-glow leading-tight">
                  {lang === 'en' ? (
                    <>KING'S<br className="md:hidden" /> <span className="text-blue-500">STAR WAR 2</span></>
                  ) : (
                    <>King的<br className="md:hidden" /> <span className="text-blue-500">星际战争 2</span></>
                  )}
                </h1>
                <p className="text-white/60 text-lg uppercase tracking-[0.3em]">{t.subtitle}</p>
              </motion.div>

              {/* Gameplay Intro */}
              <div className="glass-dark p-6 rounded-3xl mb-8 max-w-2xl">
                <h3 className="flex items-center justify-center gap-2 font-bold mb-3 text-yellow-500 uppercase tracking-widest">
                  <Info className="w-4 h-4" /> {t.howToPlay}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {t.gameplayIntro}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 w-full max-w-3xl">
                <div className="glass-dark p-6 rounded-3xl text-left">
                  <h3 className="flex items-center gap-2 font-bold mb-4 text-blue-400">
                    <Gamepad2 className="w-5 h-5" /> {t.controls}
                  </h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex justify-between"><span>{t.move}</span> <span className="text-white font-mono">ARROWS / WASD</span></li>
                    <li className="flex justify-between"><span>{t.shoot}</span> <span className="text-white font-mono">SPACE</span></li>
                    <li className="flex justify-between"><span>{t.pause}</span> <span className="text-white font-mono">P</span></li>
                    <li className="flex justify-between"><span>{t.mobile}</span> <span className="text-white font-mono">TOUCH & DRAG</span></li>
                  </ul>
                </div>
                <div className="glass-dark p-6 rounded-3xl text-left">
                  <h3 className="flex items-center gap-2 font-bold mb-4 text-yellow-500">
                    <Trophy className="w-5 h-5" /> {t.achievementList}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {achievements.map(ach => (
                      <div key={ach.id} className="flex items-center gap-2 text-[11px] text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        <span className="font-bold text-white/90">
                          {(t.achievements_data as any)[ach.id]?.title || ach.title}:
                        </span>
                        <span>
                          {(t.achievements_data as any)[ach.id]?.desc || ach.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-6">
                <button onClick={startGame} className="btn-primary text-xl px-12 py-4">
                  <Play className="w-6 h-6 fill-current" /> {t.startMission}
                </button>
                
                <div className="text-white/30 text-xs uppercase tracking-widest">
                  {t.highScore}: {stats.highScore.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {gameState === 'PAUSED' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-black/60 backdrop-blur-md"
          >
            <div className="min-h-full w-full p-8 flex flex-col items-center justify-center">
              <div className="glass p-12 rounded-[3rem] text-center max-w-sm w-full">
                <h2 className="text-4xl font-display font-bold mb-8 uppercase">{t.missionPaused}</h2>
                <div className="flex flex-col gap-4">
                  <button onClick={() => setGameState('PLAYING')} className="btn-primary w-full">
                    <Play className="w-5 h-5 fill-current" /> {t.resume}
                  </button>
                  <button onClick={() => setGameState('START')} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold transition-all uppercase">
                    {t.abort}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'GAMEOVER' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-red-950/40 backdrop-blur-xl"
          >
            <div className="min-h-full w-full p-8 flex flex-col items-center justify-center">
              <div className="max-w-4xl w-full">
              <div className="text-center mb-12">
                <h2 className="text-6xl md:text-8xl font-display font-black text-red-500 mb-2 uppercase">{t.missionFailed}</h2>
                <p className="text-white/60 uppercase tracking-[0.4em]">{t.shipDestroyed}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="glass-dark p-8 rounded-[2rem] text-center">
                  <p className="text-sm font-bold text-white/40 uppercase mb-2">{t.finalScore}</p>
                  <p className="text-4xl font-display font-bold text-glow">{stats.score.toLocaleString()}</p>
                </div>
                <div className="glass-dark p-8 rounded-[2rem] text-center">
                  <p className="text-sm font-bold text-white/40 uppercase mb-2">{t.levelReached}</p>
                  <p className="text-4xl font-display font-bold text-blue-400">{stats.level}</p>
                </div>
                <div className="glass-dark p-8 rounded-[2rem] text-center">
                  <p className="text-sm font-bold text-white/40 uppercase mb-2">{t.enemiesSlain}</p>
                  <p className="text-4xl font-display font-bold text-red-400">{stats.enemiesDestroyed}</p>
                </div>
              </div>

              <div className="glass-dark p-8 rounded-[3rem] mb-12">
                <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2 uppercase">
                  <Trophy className="w-6 h-6 text-yellow-500" /> {t.achievements}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {achievements.map((ach) => (
                    <div 
                      key={ach.id} 
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                        ach.unlocked 
                          ? 'bg-yellow-500/10 border-yellow-500/30 opacity-100' 
                          : 'bg-white/5 border-white/10 opacity-30 grayscale'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${ach.unlocked ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white/40'}`}>
                        {ach.id === 'first_blood' && <Target className="w-5 h-5" />}
                        {ach.id === 'survivor' && <Heart className="w-5 h-5" />}
                        {ach.id === 'ace_pilot' && <Trophy className="w-5 h-5" />}
                        {ach.id === 'power_hungry' && <Zap className="w-5 h-5" />}
                        {ach.id === 'untouchable' && <Shield className="w-5 h-5" />}
                      </div>
                      <span className="text-[10px] font-bold text-center uppercase">
                        {(t.achievements_data as any)[ach.id]?.title || ach.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-6">
                <button onClick={startGame} className="btn-primary px-12 py-4 uppercase">
                  <RotateCcw className="w-6 h-6" /> {t.tryAgain}
                </button>
                <button onClick={() => setGameState('START')} className="px-12 py-4 bg-white/10 hover:bg-white/20 rounded-full font-bold transition-all uppercase">
                  {t.mainMenu}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Mission Intel Modal */}
      <AnimatePresence>
        {(showSidebar && (gameState === 'PLAYING' || gameState === 'PAUSED')) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-dark w-full max-w-6xl p-8 md:p-12 rounded-[3rem] relative"
            >
              <button 
                onClick={() => setShowSidebar(false)}
                className="absolute top-6 left-6 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-blue-400 uppercase tracking-tighter">{t.missionIntel}</h2>
                <div className="h-1 w-20 bg-blue-500 mx-auto mt-2 rounded-full" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Column 1: Enemies */}
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/10 pb-2">{t.enemyClasses}</h3>
                  <div className="space-y-5">
                    {[
                      { img: '/enemy_basic.png', name: t.striker, desc: t.strikerDesc, color: 'rgba(59,130,246,0.5)' },
                      { img: '/enemy_fast.png', name: t.interceptor, desc: t.interceptorDesc, color: 'rgba(16,185,129,0.5)' },
                      { img: '/enemy_heavy.png', name: t.dreadnought, desc: t.dreadnoughtDesc, color: 'rgba(168,85,247,0.5)' },
                      { img: '/enemy_kamikaze.png', name: t.kamikaze, desc: t.kamikazeDesc, color: 'rgba(249,115,22,0.5)' },
                      { img: '/enemy_shooter.png', name: t.destroyer, desc: t.destroyerDesc, color: 'rgba(239,68,68,0.5)' },
                    ].map((enemy, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                          <img src={enemy.img} className="w-8 h-8 object-contain" style={{ filter: `drop-shadow(0 0 8px ${enemy.color})` }} alt="" />
                        </div>
                        <div>
                          <p className="text-sm font-bold uppercase text-white/90">{enemy.name}</p>
                          <p className="text-[10px] text-white/50 leading-tight">{enemy.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Powerups */}
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/10 pb-2">{t.powerupClasses}</h3>
                  <div className="space-y-5">
                    {[
                      { icon: Zap, name: t.tripleShot, desc: t.tripleShotDesc, bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-500' },
                      { icon: Shield, name: t.shield, desc: t.shieldDesc, bg: 'bg-violet-500/20', border: 'border-violet-500/40', text: 'text-violet-500' },
                      { icon: Heart, name: t.repair, desc: t.repairDesc, bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-500' },
                      { icon: Swords, name: t.damageBoost, desc: t.damageBoostDesc, bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-500' },
                      { icon: Star, name: t.goldenStar, desc: t.goldenStarDesc, bg: 'bg-amber-400/20', border: 'border-amber-400/40', text: 'text-amber-400', fill: true },
                    ].map((pw, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className={`w-12 h-12 ${pw.bg} border ${pw.border} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <pw.icon className={`w-6 h-6 ${pw.text} ${pw.fill ? 'fill-current' : ''}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold uppercase text-white/90">{pw.name}</p>
                          <p className="text-[10px] text-white/50 leading-tight">{pw.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: Tactical */}
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/10 pb-2">{t.tacticalInfo}</h3>
                  <div className="glass-dark p-6 rounded-2xl">
                    <ul className="text-xs text-white/70 space-y-4 list-none">
                      {[t.tactical1, t.tactical2, t.tactical3, t.tactical4].map((text, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-blue-500 font-bold">{i + 1}.</span>
                          <span className="leading-relaxed">{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 border border-white/5 rounded-2xl bg-white/2">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">System Status</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-blue-400 font-mono">ENCRYPTION: ACTIVE</span>
                      <span className="text-[10px] text-emerald-400 font-mono">SIGNAL: STABLE</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => setShowSidebar(false)}
                  className="btn-primary px-12 py-3 text-sm uppercase tracking-widest"
                >
                  {t.resume}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Trigger Button */}
      <div className="fixed right-6 bottom-24 z-[60]">
        {(gameState === 'PLAYING' || gameState === 'PAUSED') && !showSidebar && (
          <button 
            onClick={() => {
              setShowSidebar(true);
              if (gameState === 'PLAYING') setGameState('PAUSED');
            }}
            className="glass p-4 rounded-full hover:bg-white/20 transition-all active:scale-90 shadow-xl"
          >
            <Info className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
