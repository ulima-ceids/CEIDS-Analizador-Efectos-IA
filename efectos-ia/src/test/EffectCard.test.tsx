import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EffectCard } from '@/components/EffectCard';

describe('EffectCard', () => {
  it('renders the effect label for distortion', () => {
    render(<EffectCard effect="distortion" confidence={0.87} />);
    expect(screen.getByText('Distortion')).toBeInTheDocument();
  });

  it('renders the effect label for overdrive', () => {
    render(<EffectCard effect="overdrive" confidence={0.72} />);
    expect(screen.getByText('Overdrive')).toBeInTheDocument();
  });

  it('renders the confidence percentage', () => {
    render(<EffectCard effect="distortion" confidence={0.87} />);
    expect(screen.getByText('87')).toBeInTheDocument();
  });

  it('renders the confidence label "Alta"', () => {
    render(<EffectCard effect="overdrive" confidence={0.91} />);
    expect(screen.getByText('Alta')).toBeInTheDocument();
  });

  it('renders the confidence label "Media"', () => {
    render(<EffectCard effect="distortion" confidence={0.70} />);
    expect(screen.getByText('Media')).toBeInTheDocument();
  });

  it('renders the confidence label "Baja"', () => {
    render(<EffectCard effect="overdrive" confidence={0.40} />);
    expect(screen.getByText('Baja')).toBeInTheDocument();
  });

  it('renders "Efecto Detectado" label', () => {
    render(<EffectCard effect="fuzz" confidence={0.65} />);
    expect(screen.getByText('Efecto Detectado')).toBeInTheDocument();
  });
});
