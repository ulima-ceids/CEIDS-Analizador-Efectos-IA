import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Music, X, AlertCircle, FileAudio } from 'lucide-react';
import { audioFileSchema, ACCEPTED_AUDIO_TYPES } from '@/schemas/analysis';
import { formatFileSize, cn } from '@/utils';

interface AudioUploaderProps {
  onFile: (file: File) => void;
  disabled?: boolean;
  currentFile: File | null;
}

const ACCEPTED_EXTENSIONS = '.wav,.mp3,.ogg,.flac,.aiff,.aif';

export function AudioUploader({ onFile, disabled, currentFile }: AudioUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const validate = useCallback((file: File): boolean => {
    const result = audioFileSchema.safeParse({ file });
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? 'Archivo inválido');
      return false;
    }
    setError(null);
    return true;
  }, []);

  const handleFile = useCallback((file: File) => {
    if (validate(file)) onFile(file);
  }, [validate, onFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [disabled, handleFile]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); if (!disabled) setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
  };

  if (currentFile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-surface p-5 flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)' }}>
          <FileAudio size={18} style={{ color: '#F97316' }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{currentFile.name}</p>
          <p className="text-xs font-mono mt-0.5" style={{ color: '#6B6B82' }}>
            {formatFileSize(currentFile.size)} · {currentFile.type || 'audio'}
          </p>
        </div>

        <button
          onClick={clear}
          disabled={disabled}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: '#6B6B82' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#E8E8EE')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6B82')}
          aria-label="Eliminar archivo"
        >
          <X size={15} />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <motion.button
        type="button"
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        disabled={disabled}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'w-full rounded-xl border-2 border-dashed p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-200',
          dragging
            ? 'border-orange-500 bg-orange-500/5'
            : 'border-[#252530] hover:border-[#4A4A5C] hover:bg-white/[0.01]',
          disabled && 'pointer-events-none opacity-50'
        )}
      >
        <motion.div
          animate={dragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: dragging ? 'rgba(249,115,22,0.15)' : 'rgba(74,74,92,0.2)' }}
        >
          {dragging
            ? <Music size={24} style={{ color: '#F97316' }} />
            : <Upload size={24} style={{ color: '#9898AC' }} />
          }
        </motion.div>

        <div className="text-center">
          <p className="text-sm font-medium text-white">
            {dragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo de audio'}
          </p>
          <p className="text-xs mt-1" style={{ color: '#6B6B82' }}>
            o haz clic para seleccionar
          </p>
          <p className="text-xs mt-3 font-mono" style={{ color: '#4A4A5C' }}>
            WAV · MP3 · OGG · FLAC · AIFF — máx. 50 MB
          </p>
        </div>
      </motion.button>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}
          >
            <AlertCircle size={13} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={onInputChange}
        className="sr-only"
        aria-label="Seleccionar archivo de audio"
      />
    </div>
  );
}
