import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { formatDuration } from '@/utils';

interface WaveformPlayerProps {
  file: File;
}

export function WaveformPlayer({ file }: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef        = useRef<WaveSurfer | null>(null);

  const [playing,  setPlaying]  = useState(false);
  const [muted,    setMuted]    = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current,  setCurrent]  = useState(0);
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container:     containerRef.current,
      waveColor:     '#32323F',
      progressColor: '#F97316',
      cursorColor:   'rgba(249,115,22,0.6)',
      cursorWidth:   2,
      height:        56,
      barWidth:      2,
      barGap:        1.5,
      barRadius:     2,
      normalize:     true,
      interact:      true,
    });

    wsRef.current = ws;

    const url = URL.createObjectURL(file);
    ws.load(url);

    ws.on('ready', () => {
      setDuration(ws.getDuration());
      setReady(true);
    });

    ws.on('audioprocess', (t: number) => {
      setCurrent(t);
      const dur = ws.getDuration();
      if (dur > 0) setProgress(t / dur);
    });

    ws.on('timeupdate', (t: number) => {
      setCurrent(t);
      const dur = ws.getDuration();
      if (dur > 0) setProgress(t / dur);
    });

    ws.on('play',   () => setPlaying(true));
    ws.on('pause',  () => setPlaying(false));
    ws.on('finish', () => { setPlaying(false); setProgress(0); setCurrent(0); });

    return () => {
      ws.destroy();
      URL.revokeObjectURL(url);
      setReady(false);
      setPlaying(false);
    };
  }, [file]);

  const togglePlay = () => wsRef.current?.playPause();
  const toggleMute = () => {
    if (!wsRef.current) return;
    const next = !muted;
    wsRef.current.setMuted(next);
    setMuted(next);
  };

  return (
    <div className="card-surface p-4 space-y-3">
      <div className="relative min-h-[56px]">
        <div ref={containerRef} className={ready ? 'opacity-100' : 'opacity-0'} />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center gap-1">
            {[...Array(28)].map((_, i) => (
              <motion.div
                key={i}
                className="w-0.5 rounded-full"
                style={{ background: '#32323F' }}
                animate={{ height: [8, 14 + Math.sin(i * 0.8) * 18, 8] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.06,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={togglePlay}
          disabled={!ready}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40"
          style={{
            background: ready ? 'rgba(249,115,22,0.15)' : 'rgba(74,74,92,0.15)',
            border:     ready ? '1px solid rgba(249,115,22,0.3)' : '1px solid #252530',
            color:      ready ? '#F97316' : '#4A4A5C',
          }}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
        >
          {playing
            ? <Pause size={15} fill="currentColor" />
            : <Play  size={15} fill="currentColor" />
          }
        </motion.button>

        <div className="flex items-center gap-1 font-mono text-xs flex-shrink-0" style={{ color: '#6B6B82', minWidth: 80 }}>
          <span style={{ color: '#C4C4D0' }}>{formatDuration(current)}</span>
          <span>/</span>
          <span>{formatDuration(duration)}</span>
        </div>

        <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: '#1C1C24' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: '#F97316', width: `${progress * 100}%` }}
          />
        </div>

        <button
          onClick={toggleMute}
          disabled={!ready}
          className="w-7 h-7 flex items-center justify-center rounded transition-colors flex-shrink-0 disabled:opacity-40"
          style={{ color: '#6B6B82' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#E8E8EE')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6B82')}
          aria-label={muted ? 'Activar sonido' : 'Silenciar'}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </div>
  );
}
