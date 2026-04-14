import React from 'react';
import { motion } from 'framer-motion';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#07070A] relative overflow-x-hidden">
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(74,74,92,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(74,74,92,0.055) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Radial glow top-center */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.07) 0%, transparent 70%)' }}
      />

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function Header() {
  return (
    <header className="border-b border-[#1C1C24] bg-[#0D0D12]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="relative w-7 h-7">
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="13" stroke="#F97316" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="4" fill="#F97316" opacity="0.9" />
              <path d="M4 14 Q9 8 14 14 Q19 20 24 14" stroke="#F97316" strokeWidth="1.2" fill="none" opacity="0.6" />
            </svg>
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 10px rgba(249,115,22,0.5)' }} />
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-lg tracking-widest text-white leading-none">
              EFECTOS
            </span>
            <span className="font-display font-semibold text-sm tracking-widest leading-none"
              style={{ color: '#F97316', textShadow: '0 0 10px rgba(249,115,22,0.6)' }}>
              IA
            </span>
          </div>
        </motion.div>

        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 text-xs font-mono text-[#6B6B82]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
          MOCK MODE
        </motion.div>
      </div>
    </header>
  );
}
