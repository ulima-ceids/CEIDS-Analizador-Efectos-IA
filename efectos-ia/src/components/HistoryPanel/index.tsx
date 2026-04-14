import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, History, ChevronRight, Zap, Radio, Music, Waves, type LucideIcon } from 'lucide-react';
import type { HistoryEntry, EffectType } from '@/types';
import { formatDate, effectLabel } from '@/utils';

interface HistoryPanelProps {
  entries:     HistoryEntry[];
  onSelect:    (entry: HistoryEntry) => void;
  onRemove:    (id: string) => void;
  onClear:     () => void;
  selectedId?: string;
}

const EFFECT_ICONS: Record<EffectType, LucideIcon> = {
  distortion: Zap,
  overdrive:  Radio,
  clean:      Music,
  fuzz:       Waves,
};

const EFFECT_COLORS: Record<EffectType, string> = {
  distortion: '#F97316',
  overdrive:  '#22D3EE',
  clean:      '#4ADE80',
  fuzz:       '#F87171',
};

export function HistoryPanel({ entries, onSelect, onRemove, onClear, selectedId }: HistoryPanelProps) {
  if (entries.length === 0) {
    return (
      <div className="card-surface p-6 flex flex-col items-center gap-3 text-center">
        <History size={24} style={{ color: '#32323F' }} />
        <div>
          <p className="text-sm font-medium" style={{ color: '#6B6B82' }}>Sin historial</p>
          <p className="text-xs mt-0.5" style={{ color: '#4A4A5C' }}>
            Los análisis recientes aparecerán aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1C1C24]">
        <div className="flex items-center gap-2">
          <History size={13} style={{ color: '#6B6B82' }} />
          <span className="text-xs font-mono tracking-wider uppercase" style={{ color: '#6B6B82' }}>
            Historial
          </span>
          <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: '#1C1C24', color: '#9898AC' }}>
            {entries.length}
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-xs font-mono transition-colors flex items-center gap-1"
          style={{ color: '#4A4A5C' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#F87171')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#4A4A5C')}
        >
          <Trash2 size={11} />
          Borrar todo
        </button>
      </div>

      <ul className="divide-y divide-[#141419] max-h-72 overflow-y-auto">
        <AnimatePresence initial={false}>
          {entries.map((entry) => {
            const Icon       = EFFECT_ICONS[entry.effect] ?? Radio;
            const color      = EFFECT_COLORS[entry.effect] ?? '#F97316';
            const isSelected = entry.id === selectedId;

            return (
              <motion.li
                key={entry.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer group transition-colors"
                  style={{ background: isSelected ? 'rgba(249,115,22,0.05)' : undefined }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  onClick={() => onSelect(entry)}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                  >
                    <Icon size={12} style={{ color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: isSelected ? color : '#C4C4D0' }}>
                      {entry.filename}
                    </p>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: '#4A4A5C' }}>
                      {effectLabel(entry.effect)} · {Math.round(entry.confidence * 100)}% · {formatDate(entry.analyzed_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove(entry.id); }}
                      className="w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: '#4A4A5C' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#F87171')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#4A4A5C')}
                      aria-label="Eliminar"
                    >
                      <Trash2 size={11} />
                    </button>
                    <ChevronRight size={12} style={{ color: '#32323F' }} />
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
