import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import type { DSPFeatures } from '@/types';

interface DSPMetricsProps {
  features: DSPFeatures;
}

// Normalise raw DSP values to 0-100 for display
function normalize(features: DSPFeatures): Record<string, number> {
  return {
    'Energía (RMS)': Math.max(0, Math.min(100, (features.rms_db + 60) * (100 / 60))),
    'Brillo':        Math.min(100, (features.centroid / 8000) * 100),
    'Ancho Esp.':    Math.min(100, (features.bandwidth / 5000) * 100),
    'Flatness':      features.flatness * 100,
    'ZCR':           Math.min(100, (features.zcr / 300) * 100),
    'HP Ratio':      features.hp_ratio * 100,
    'Reverb':        features.reverb_ratio * 100,
  };
}

const FEATURE_META: {
  key: keyof DSPFeatures;
  label:   string;
  unit:    string;
  desc:    string;
  color:   string;
  format:  (v: number) => string;
}[] = [
  {
    key:    'rms_db',
    label:  'RMS Level',
    unit:   'dBFS',
    desc:   'Nivel energético medio de la señal',
    color:  '#F97316',
    format: (v) => `${v.toFixed(1)} dBFS`,
  },
  {
    key:    'centroid',
    label:  'Centroide Esp.',
    unit:   'Hz',
    desc:   'Centro de masa espectral — mayor = más brillante',
    color:  '#22D3EE',
    format: (v) => `${Math.round(v).toLocaleString()} Hz`,
  },
  {
    key:    'bandwidth',
    label:  'Ancho Espectral',
    unit:   'Hz',
    desc:   'Dispersión del contenido frecuencial',
    color:  '#22D3EE',
    format: (v) => `${Math.round(v).toLocaleString()} Hz`,
  },
  {
    key:    'flatness',
    label:  'Flatness',
    unit:   '',
    desc:   'Relación ruido/tono — mayor = más distorsionado',
    color:  '#F97316',
    format: (v) => v.toFixed(3),
  },
  {
    key:    'zcr',
    label:  'ZCR',
    unit:   'cr/s',
    desc:   'Zero-crossing rate — indicador de aspereza y ruido',
    color:  '#F97316',
    format: (v) => `${Math.round(v)} cr/s`,
  },
  {
    key:    'hp_ratio',
    label:  'HP Ratio',
    unit:   '',
    desc:   'Ratio armónico/percusivo (HPSS)',
    color:  '#4ADE80',
    format: (v) => v.toFixed(2),
  },
  {
    key:    'onset_count',
    label:  'Onsets',
    unit:   '',
    desc:   'Número de ataques transitorios detectados',
    color:  '#9898AC',
    format: (v) => `${Math.round(v)}`,
  },
  {
    key:    'reverb_ratio',
    label:  'Reverb Ratio',
    unit:   '',
    desc:   'Estimación de cola de reverberación',
    color:  '#22D3EE',
    format: (v) => v.toFixed(2),
  },
];

function FeatureRow({ meta, value, index }: {
  meta:  typeof FEATURE_META[0];
  value: number;
  index: number;
}) {
  const normalized = Math.max(0, Math.min(100, (() => {
    switch (meta.key) {
      case 'rms_db':       return Math.max(0, (value + 60) * (100 / 60));
      case 'centroid':     return (value / 8000) * 100;
      case 'bandwidth':    return (value / 5000) * 100;
      case 'flatness':     return value * 100;
      case 'zcr':          return (value / 300) * 100;
      case 'hp_ratio':     return value * 100;
      case 'onset_count':  return (value / 30) * 100;
      case 'reverb_ratio': return value * 100;
      default:             return 50;
    }
  })()));

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="card-elevated p-3 space-y-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-mono font-medium" style={{ color: meta.color }}>
            {meta.label}
          </p>
          <p className="text-[10px] mt-0.5 leading-snug" style={{ color: '#6B6B82' }}>
            {meta.desc}
          </p>
        </div>
        <span className="text-sm font-mono font-medium flex-shrink-0" style={{ color: '#E8E8EE' }}>
          {meta.format(value)}
        </span>
      </div>
      <div className="meter-bar">
        <motion.div
          className="meter-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${normalized}%` }}
          transition={{ duration: 0.8, delay: 0.1 + index * 0.04, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: `linear-gradient(90deg, ${meta.color}60, ${meta.color})` }}
        />
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-elevated px-3 py-2 text-xs font-mono" style={{ color: '#E8E8EE' }}>
      <p style={{ color: '#F97316' }}>{payload[0]?.payload?.subject}</p>
      <p className="mt-0.5">{Math.round(payload[0]?.value ?? 0)}</p>
    </div>
  );
};

export function DSPMetrics({ features }: DSPMetricsProps) {
  const norm = normalize(features);
  const radarData = Object.entries(norm).map(([subject, value]) => ({ subject, value }));

  return (
    <div className="space-y-4">
      {/* Radar chart */}
      <div className="card-surface p-5">
        <p className="text-[10px] font-mono tracking-[0.15em] uppercase mb-4" style={{ color: '#6B6B82' }}>
          Perfil Espectral
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
            <PolarGrid stroke="#1C1C24" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#6B6B82', fontSize: 10, fontFamily: 'DM Mono' }}
            />
            <Radar
              name="Señal"
              dataKey="value"
              stroke="#F97316"
              fill="#F97316"
              fillOpacity={0.12}
              strokeWidth={1.5}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Feature rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {FEATURE_META.map((meta, i) => (
          <FeatureRow
            key={meta.key}
            meta={meta}
            value={features[meta.key] as number}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
