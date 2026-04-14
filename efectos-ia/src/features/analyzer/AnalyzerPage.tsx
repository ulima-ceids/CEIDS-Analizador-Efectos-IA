import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, RefreshCw, ArrowDown } from 'lucide-react';
import { AudioUploader }    from '@/components/AudioUploader';
import { WaveformPlayer }   from '@/components/WaveformPlayer';
import { AnalysisResults }  from '@/components/AnalysisResults';
import { HistoryPanel }     from '@/components/HistoryPanel';
import { useAnalyze }       from '@/hooks/useAnalyze';
import { useHistory }       from '@/hooks/useHistory';
import type { AnalysisResult, AnalysisStatus } from '@/types';

export function AnalyzerPage() {
  const [file,    setFile]    = useState<File | null>(null);
  const [status,  setStatus]  = useState<AnalysisStatus>('idle');
  const [result,  setResult]  = useState<AnalysisResult | null>(null);

  const { mutateAsync, error } = useAnalyze();
  const { entries, addEntry, removeEntry, clearHistory } = useHistory();

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setStatus('idle');
  };

  const handleAnalyze = async () => {
    if (!file) return;
    try {
      setStatus('uploading');
      await new Promise((r) => setTimeout(r, 900));  // mock upload phase
      setStatus('analyzing');
      const res = await mutateAsync(file);
      setResult(res);
      addEntry(res);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setStatus('idle');
  };

  const handleHistorySelect = (entry: { result: AnalysisResult }) => {
    setResult(entry.result);
    setStatus('success');
    setFile(null);
  };

  const isLoading = status === 'uploading' || status === 'analyzing';
  const canAnalyze = !!file && !isLoading;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">

      {/* ── Hero section ── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4 pt-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#252530] text-xs font-mono"
          style={{ color: '#6B6B82', background: 'rgba(255,255,255,0.02)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
          Análisis DSP en tiempo real
        </div>

        <h1 className="font-display font-bold leading-none tracking-tight"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#E8E8EE' }}>
          Detecta el{' '}
          <span style={{
            background: 'linear-gradient(135deg, #F97316, #FB923C)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            efecto
          </span>
          {' '}de tu guitarra
        </h1>

        <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: '#6B6B82' }}>
          Sube un audio, analiza su firma espectral y obtén una estimación precisa
          del procesamiento de señal — distortion, overdrive, fuzz y más.
        </p>
      </motion.section>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* LEFT: main workflow */}
        <div className="space-y-5">

          {/* Step 1 — upload */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <StepLabel n={1} label="Selecciona un archivo de audio" />
            <div className="mt-3">
              <AudioUploader
                onFile={handleFile}
                currentFile={file}
                disabled={isLoading}
              />
            </div>
          </motion.div>

          {/* Step 2 — preview */}
          <AnimatePresence>
            {file && (
              <motion.div
                key="player"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <StepLabel n={2} label="Previsualiza el audio" />
                <div className="mt-3">
                  <WaveformPlayer file={file} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3 — analyze button */}
          <AnimatePresence>
            {file && (
              <motion.div
                key="btn"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <StepLabel n={3} label="Ejecuta el análisis" />
                <div className="mt-3">
                  <button
                    className="btn-primary w-full flex items-center justify-center gap-2 py-4"
                    disabled={!canAnalyze}
                    onClick={handleAnalyze}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {status === 'uploading' ? 'Cargando archivo…' : 'Analizando señal…'}
                      </>
                    ) : (
                      <>
                        <ArrowDown size={16} />
                        Analizar audio
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading state */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card-surface p-6 scanline-effect"
              >
                <AnalyzingIndicator status={status} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error state */}
          <AnimatePresence>
            {status === 'error' && !isLoading && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card-surface p-5 border border-red-500/20"
                style={{ background: 'rgba(248,113,113,0.04)' }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} style={{ color: '#F87171', flexShrink: 0, marginTop: 1 }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#F87171' }}>
                      Error en el análisis
                    </p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#9898AC' }}>
                      {(error as Error)?.message ?? 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'}
                    </p>
                    <button
                      onClick={handleAnalyze}
                      disabled={!file}
                      className="btn-ghost flex items-center gap-1.5 mt-3 text-xs"
                    >
                      <RefreshCw size={11} />
                      Reintentar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {result && status === 'success' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <AnalysisResults result={result} onReset={handleReset} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {status === 'idle' && !file && entries.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="py-8 text-center"
            >
              <EmptyState />
            </motion.div>
          )}
        </div>

        {/* RIGHT: history panel */}
        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 lg:sticky lg:top-20"
        >
          <p className="text-[10px] font-mono tracking-[0.15em] uppercase" style={{ color: '#6B6B82' }}>
            Análisis Recientes
          </p>
          <HistoryPanel
            entries={entries}
            onSelect={handleHistorySelect}
            onRemove={removeEntry}
            onClear={clearHistory}
            selectedId={result?.id}
          />

          {/* Info card */}
          <div className="card-elevated p-4 space-y-2">
            <p className="text-[10px] font-mono tracking-[0.15em] uppercase" style={{ color: '#6B6B82' }}>
              Sobre el análisis
            </p>
            <ul className="space-y-1.5">
              {[
                'Extracción de features DSP (RMS, centroid, ZCR…)',
                'Separación armónico/percusivo (HPSS)',
                'Detección de reverb por decaimiento de señal',
                'Estimación heurística + CNN (próximamente)',
              ].map((item) => (
                <li key={item} className="text-[11px] flex gap-2" style={{ color: '#9898AC' }}>
                  <span style={{ color: '#F97316', flexShrink: 0 }}>·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0"
        style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316', border: '1px solid rgba(249,115,22,0.25)' }}
      >
        {n}
      </span>
      <span className="text-xs font-mono tracking-wide uppercase" style={{ color: '#6B6B82' }}>
        {label}
      </span>
    </div>
  );
}

function AnalyzingIndicator({ status }: { status: string }) {
  const steps = [
    { id: 'upload',   label: 'Cargando archivo',          active: status === 'uploading' },
    { id: 'features', label: 'Extrayendo features DSP',    active: status === 'analyzing' },
    { id: 'hpss',     label: 'Análisis HPSS',              active: status === 'analyzing' },
    { id: 'classify', label: 'Clasificando efecto',        active: status === 'analyzing' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Loader2 size={14} className="animate-spin" style={{ color: '#F97316' }} />
        <span className="text-xs font-mono tracking-wide" style={{ color: '#9898AC' }}>
          {status === 'uploading' ? 'Enviando audio al servidor…' : 'Procesando señal de audio…'}
        </span>
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: step.active ? 1 : 0.3 }}
            className="flex items-center gap-2.5 text-xs font-mono"
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              animate={step.active ? { backgroundColor: ['#F97316', '#FB923C', '#F97316'] } : { backgroundColor: '#252530' }}
              transition={step.active ? { repeat: Infinity, duration: 1 } : {}}
            />
            <span style={{ color: step.active ? '#C4C4D0' : '#4A4A5C' }}>{step.label}</span>
            {step.active && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                style={{ color: '#F97316' }}
              >
                …
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Animated frequency bars */}
      <div className="flex items-end gap-0.5 h-8">
        {[...Array(32)].map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm"
            style={{ background: `rgba(249,115,22,${0.2 + Math.sin(i * 0.5) * 0.15})` }}
            animate={{ height: ['20%', `${30 + Math.abs(Math.sin(i * 0.7)) * 70}%`, '20%'] }}
            transition={{
              duration: 0.8 + Math.random() * 0.4,
              repeat: Infinity,
              delay: i * 0.025,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="space-y-6">
      {/* Decorative wave */}
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 200 60" className="w-48 opacity-20">
          <path
            d="M0,30 C20,10 30,50 50,30 C70,10 80,50 100,30 C120,10 130,50 150,30 C170,10 180,50 200,30"
            stroke="#F97316"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M0,30 C15,20 35,40 50,30 C65,20 85,40 100,30 C115,20 135,40 150,30 C165,20 185,40 200,30"
            stroke="#22D3EE"
            strokeWidth="1"
            fill="none"
            opacity="0.6"
          />
        </svg>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium" style={{ color: '#6B6B82' }}>
          Listo para analizar
        </p>
        <p className="text-xs" style={{ color: '#4A4A5C' }}>
          Sube un riff, un solo o cualquier audio de guitarra y descubre su procesamiento.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 text-[11px] font-mono">
        {['Distortion', 'Overdrive', 'Fuzz', 'Clean'].map((fx) => (
          <span key={fx} className="tag tag-ink">{fx}</span>
        ))}
      </div>
    </div>
  );
}
