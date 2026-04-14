import { motion } from 'framer-motion';
import { Zap, Radio, Music, Waves, type LucideIcon } from 'lucide-react';
import type { EffectType } from '@/types';
import { effectLabel, confidenceLabel } from '@/utils';

interface EffectCardProps {
  effect:     EffectType;
  confidence: number;
}

const EFFECT_CONFIG: Record<EffectType, {
  Icon:        LucideIcon;
  accent:      string;
  accentDim:   string;
  description: string;
  waveform:    string;
}> = {
  distortion: {
    Icon:        Zap,
    accent:      '#F97316',
    accentDim:   'rgba(249,115,22,0.15)',
    description: 'Clipping agresivo, riqueza armónica elevada, alta saturación.',
    waveform:    'M0,28 L12,4 L20,52 L28,4 L36,52 L44,16 L52,40 L60,12 L68,44 L76,8 L84,48 L92,16 L100,36',
  },
  overdrive: {
    Icon:        Radio,
    accent:      '#22D3EE',
    accentDim:   'rgba(34,211,238,0.12)',
    description: 'Saturación suave y cálida, compresión natural, segundo armónico dominante.',
    waveform:    'M0,28 C8,12 16,8 24,28 C32,48 40,52 48,28 C56,8 64,4 72,28 C80,48 88,52 96,28 L100,28',
  },
  clean: {
    Icon:        Music,
    accent:      '#4ADE80',
    accentDim:   'rgba(74,222,128,0.12)',
    description: 'Señal limpia sin distorsión perceptible, respuesta lineal.',
    waveform:    'M0,28 C16,16 32,16 50,28 C68,40 84,40 100,28',
  },
  fuzz: {
    Icon:        Waves,
    accent:      '#F87171',
    accentDim:   'rgba(248,113,113,0.12)',
    description: 'Recorte extremo, contenido de armónicos muy alto, sustain extendido.',
    waveform:    'M0,20 L5,8 L10,48 L15,4 L20,50 L25,10 L30,46 L35,6 L40,48 L45,12 L50,44 L55,8 L60,46 L65,14 L70,42 L75,10 L80,46 L85,16 L90,40 L95,12 L100,28',
  },
};

export function EffectCard({ effect, confidence }: EffectCardProps) {
  const cfg = EFFECT_CONFIG[effect] ?? EFFECT_CONFIG.overdrive;
  const pct = Math.round(confidence * 100);
  const { Icon } = cfg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="card-surface scanline-effect relative overflow-hidden"
      style={{ padding: '28px 28px 24px' }}
    >
      <div
        className="absolute top-0 right-0 w-64 h-64 pointer-events-none rounded-full"
        style={{
          background: `radial-gradient(circle, ${cfg.accentDim} 0%, transparent 70%)`,
          transform: 'translate(30%, -40%)',
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 opacity-[0.07] pointer-events-none">
        <svg viewBox="0 0 100 56" preserveAspectRatio="none" className="w-full h-8">
          <path d={cfg.waveform} stroke={cfg.accent} strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: cfg.accentDim, border: `1px solid ${cfg.accent}30` }}
            >
              <Icon size={22} style={{ color: cfg.accent }} />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-[0.15em] uppercase mb-0.5" style={{ color: cfg.accent }}>
                Efecto Detectado
              </p>
              <h2
                className="font-display font-bold tracking-wider leading-none"
                style={{ fontSize: '2rem', color: cfg.accent, textShadow: `0 0 20px ${cfg.accent}50` }}
              >
                {effectLabel(effect)}
              </h2>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-[10px] font-mono tracking-[0.15em] uppercase mb-1" style={{ color: '#6B6B82' }}>
              Confianza
            </p>
            <div className="font-display font-bold text-3xl leading-none" style={{ color: '#E8E8EE' }}>
              {pct}<span className="text-lg font-semibold" style={{ color: '#6B6B82' }}>%</span>
            </div>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: cfg.accent }}>
              {confidenceLabel(confidence)}
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: '#9898AC' }}>
          {cfg.description}
        </p>

        <div className="space-y-1.5">
          <div className="meter-bar">
            <motion.div
              className="meter-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: `linear-gradient(90deg, ${cfg.accent}99, ${cfg.accent})` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono" style={{ color: '#4A4A5C' }}>
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
