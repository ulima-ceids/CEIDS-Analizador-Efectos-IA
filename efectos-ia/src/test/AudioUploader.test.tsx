import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioUploader } from '@/components/AudioUploader';

describe('AudioUploader', () => {
  it('renders the upload prompt when no file is selected', () => {
    render(<AudioUploader onFile={vi.fn()} currentFile={null} />);
    expect(screen.getByText(/arrastra tu archivo/i)).toBeInTheDocument();
  });

  it('shows accepted formats hint', () => {
    render(<AudioUploader onFile={vi.fn()} currentFile={null} />);
    expect(screen.getByText(/WAV/)).toBeInTheDocument();
  });

  it('shows file name when a file is selected', () => {
    const file = new File([new Uint8Array(1024)], 'solo.wav', { type: 'audio/wav' });
    render(<AudioUploader onFile={vi.fn()} currentFile={file} />);
    expect(screen.getByText('solo.wav')).toBeInTheDocument();
  });

  it('calls onFile with a valid audio file via input', () => {
    const onFile = vi.fn();
    render(<AudioUploader onFile={onFile} currentFile={null} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file  = new File([new Uint8Array(1024)], 'riff.wav', { type: 'audio/wav' });

    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('does NOT call onFile for an invalid file type', () => {
    const onFile = vi.fn();
    render(<AudioUploader onFile={onFile} currentFile={null} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file  = new File([new Uint8Array(1024)], 'doc.pdf', { type: 'application/pdf' });

    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    expect(onFile).not.toHaveBeenCalled();
    expect(screen.getByText(/Formato no soportado/i)).toBeInTheDocument();
  });

  it('renders the hidden file input with correct accept attribute', () => {
    render(<AudioUploader onFile={vi.fn()} currentFile={null} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toContain('.wav');
    expect(input.accept).toContain('.mp3');
  });

  it('is disabled when disabled prop is true', () => {
    render(<AudioUploader onFile={vi.fn()} currentFile={null} disabled />);
    const button = screen.getByRole('button', { hidden: true });
    expect(button).toBeDisabled();
  });
});
