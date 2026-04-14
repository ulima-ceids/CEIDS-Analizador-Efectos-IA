import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Check, RotateCcw, Clock } from 'lucide-react';
import type { AnalysisResult } from '@/types';
import { EffectCard } from '@/components/EffectCard';
import { DSPMetrics } from '@/components/DSPMetrics';
import { formatDate, formatDuration, exportResultAsJSON, copyToClipboard, cn } from '@/utils';

interface AnalysisResultsProps {
  result:   AnalysisResult;
  onReset:  () => void;
}

const PARAM_LABELS: Record<string, { label: string; color: string }> = {
  gain:   { label: 'Gain',   color: '#F97316' },
  tone:   { label: 'Tone',   color: '#F97316' },
  bass:   { label: 'Bass',   color: '#22D3EE' },
  mid:    { label: 'Mid',    color: '#22D3EE' },
  treble: { label: 'Treble', color: '#22D3EE' },
  reverb: { label: 'Reverb', color: '#9898AC' },
};

function KnobSVG({ value, color }: { value: number; color: string }) {
  // 0-100 → -135° to +135° arc
  const angle = -135 + (value / 100) * 270;
  const r = 18;
  const cx = 22;
  const cy = 22;
  const rad = (angle * Math.PI) / 180;
  const markerX = cx + r * Math.cos(rad);
  const markerY = cy + r * Math.sin(rad);

  // Arc path
  const startRad = (-135 * Math.PI) / 180;
  const endRad   = rad;
  const largeArc = endRad - startRad > Math.PI ? 1 : 0;
  const arcSx = cx + r * Math.cos(startRad);
  const arcSy = cy + r * Math.sin(startRad);

  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1C1C24" strokeWidth="3" />
      {/* Filled arc */}
      {value > 0 && (
        <path
          d={`M ${arcSx} ${arcSy} A ${r} ${r} 0 ${largeArc} 1 ${markerX} ${markerY}`}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.8"
        />
      )}
      {/* Knob face */}
      <circle cx={cx} cy={cy} r="12" fill="#141419" stroke="#252530" strokeWidth="1" />
      {/* Marker dot */}
      <circle cx={markerX} cy={markerY} r="2.5" fill={color} />
    </svg>
  );
}

function ParamKnob({ name, value }: { name: string; value: number }) {
  const meta = PARAM_LABELS[name] ?? { label: name, color: '#9898AC' };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-1.5"
    >
      <KnobSVG value={value} color={meta.color} />
      <span className="text-[10px] font-mono tracking-wider uppercase" style={{ color: '#6B6B82' }}>
        {meta.label}
      </span>
      <span className="text-xs font-mono font-medium" style={{ color: '#E8E8EE' }}>
        {value}
      </span>
    </motion.div>
  );
}

export function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    exportResultAsJSON(result, `analisis-${result.effect}-${Date.now()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Meta row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono" style={{ color: '#6B6B82' }}>
          <Clock size={12} />
          <span>{formatDate(result.analyzed_at)}</span>
          <span className="text-[#252530]">·</span>
          <span className="truncate max-w-[180px]" title={result.filename}>{result.filename}</span>
          {result.duration_s > 0 && (
            <>
              <span className="text-[#252530]">·</span>
              <span>{formatDuration(result.duration_s)}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="btn-ghost flex items-center gap-1.5">
            {copied ? <Check size={12} style={{ color: '#4ADE80' }} /> : <Copy size={12} />}
            {copied ? 'Copiado' : 'Copiar JSON'}
          </button>
          <button onClick={handleExport} className="btn-ghost flex items-center gap-1.5">
            <Download size={12} />
            Exportar
          </button>
          <button onClick={onReset} className="btn-ghost flex items-center gap-1.5">
            <RotateCcw size={12} />
            Nuevo
          </button>
        </div>
      </div>

      {/* Hero effect card */}
      <EffectCard effect={result.effect} confidence={result.confidence} />

      {/* Pedal parameters */}
      <div className="card-surface p-5">
        <p className="text-[10px] font-mono tracking-[0.15em] uppercase mb-5" style={{ color: '#6B6B82' }}>
          Parámetros Sugeridos — Unidad MG-30
        </p>
        <div className="flex flex-wrap justify-around gap-4">
          {Object.entries(result.parameters).map(([name, value], i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <ParamKnob name={name} value={value} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* DSP features */}
      <div>
        <p className="text-[10px] font-mono tracking-[0.15em] uppercase mb-3" style={{ color: '#6B6B82' }}>
          Análisis DSP
        </p>
        <DSPMetrics features={result.features} />
      </div>
    </motion.div>
  );
}
